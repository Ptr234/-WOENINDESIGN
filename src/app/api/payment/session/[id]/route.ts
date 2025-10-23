import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { validateUUID } from '@/lib/security/validation';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitResult = await rateLimitMiddleware(request, 'payment', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { id } = params;

    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const sessionResult = await DatabaseService.query(
      `SELECT 
        ps.id, ps.user_id, ps.amount, ps.currency, ps.type, ps.status,
        ps.expires_at, ps.hiring_request_id, ps.plan_id,
        hr.project_title,
        d.first_name as designer_first_name, d.last_name as designer_last_name,
        d.profile_picture as designer_profile_picture
      FROM payment_sessions ps
      LEFT JOIN hiring_requests hr ON ps.hiring_request_id = hr.id
      LEFT JOIN users d ON hr.designer_id = d.id
      WHERE ps.id = $1 AND ps.user_id = $2`,
      [id, user.id]
    );

    if (sessionResult.rows.length === 0) {
      return createSecureResponse({ error: 'Payment session not found' }, 404);
    }

    const session = sessionResult.rows[0];

    if (session.status !== 'pending') {
      return createSecureResponse({ error: 'Payment session is not active' }, 400);
    }

    const responseData = {
      id: session.id,
      amount: parseFloat(session.amount),
      currency: session.currency,
      type: session.type,
      status: session.status,
      expiresAt: session.expires_at,
      hiringRequestId: session.hiring_request_id,
      planId: session.plan_id,
    };

    if (session.hiring_request_id) {
      responseData.hiringRequest = {
        projectTitle: session.project_title,
        designer: {
          firstName: session.designer_first_name,
          lastName: session.designer_last_name,
          profilePicture: session.designer_profile_picture,
        },
      };
    }

    return createSecureResponse({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching payment session:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}