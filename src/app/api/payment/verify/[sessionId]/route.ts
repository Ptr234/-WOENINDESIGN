import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitResult = await rateLimitMiddleware(request, 'payment', 20, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { sessionId } = params;

    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const sessionResult = await DatabaseService.query(
      `SELECT 
        ps.id, ps.amount, ps.currency, ps.type, ps.status,
        ps.payment_method, ps.payment_reference, ps.updated_at,
        ps.hiring_request_id, ps.plan_id
      FROM payment_sessions ps
      WHERE ps.id = $1 AND ps.user_id = $2`,
      [sessionId, user.id]
    );

    if (sessionResult.rows.length === 0) {
      return createSecureResponse({ error: 'Payment session not found' }, 404);
    }

    const session = sessionResult.rows[0];

    if (session.status !== 'completed') {
      return createSecureResponse({ error: 'Payment not completed' }, 400);
    }

    const responseData = {
      sessionId: session.id,
      amount: parseFloat(session.amount),
      currency: session.currency,
      type: session.type,
      status: session.status,
      paymentMethod: session.payment_method,
      paymentReference: session.payment_reference,
      completedAt: session.updated_at,
    };

    // Add additional context based on payment type
    if (session.type === 'contact_fee' && session.hiring_request_id) {
      const hiringRequestResult = await DatabaseService.query(
        `SELECT 
          hr.project_title,
          d.first_name as designer_first_name, 
          d.last_name as designer_last_name
        FROM hiring_requests hr
        JOIN users d ON hr.designer_id = d.id
        WHERE hr.id = $1`,
        [session.hiring_request_id]
      );

      if (hiringRequestResult.rows.length > 0) {
        const hr = hiringRequestResult.rows[0];
        responseData.hiringRequest = {
          projectTitle: hr.project_title,
          designer: {
            firstName: hr.designer_first_name,
            lastName: hr.designer_last_name,
          },
        };
      }
    } else if (session.type === 'subscription' && session.plan_id) {
      const planResult = await DatabaseService.query(
        'SELECT name, features FROM subscription_plans WHERE id = $1',
        [session.plan_id]
      );

      if (planResult.rows.length > 0) {
        const plan = planResult.rows[0];
        responseData.subscriptionPlan = {
          name: plan.name,
          features: plan.features,
        };
      }
    }

    return createSecureResponse({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}