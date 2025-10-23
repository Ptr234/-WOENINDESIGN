import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'payment_process', 10, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many payment attempts' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { sessionId, amount, currency, paymentMethod, paymentDetails } = body;

    if (!sessionId || !amount || !currency || !paymentMethod) {
      return createSecureResponse({ error: 'Missing required payment information' }, 400);
    }

    const sessionResult = await DatabaseService.query(
      'SELECT * FROM payment_sessions WHERE id = $1 AND user_id = $2 AND status = $3',
      [sessionId, user.id, 'pending']
    );

    if (sessionResult.rows.length === 0) {
      return createSecureResponse({ error: 'Invalid or expired payment session' }, 404);
    }

    const session = sessionResult.rows[0];

    if (new Date() > new Date(session.expires_at)) {
      return createSecureResponse({ error: 'Payment session has expired' }, 400);
    }

    if (parseFloat(session.amount) !== amount) {
      return createSecureResponse({ error: 'Payment amount mismatch' }, 400);
    }

    const paymentReference = generatePaymentReference();
    const paymentSuccess = await processPayment(paymentMethod, amount, currency, paymentDetails, paymentReference);

    if (!paymentSuccess.success) {
      return createSecureResponse({ 
        error: paymentSuccess.error || 'Payment processing failed' 
      }, 400);
    }

    await DatabaseService.query('BEGIN');

    try {
      await DatabaseService.query(
        'UPDATE payment_sessions SET status = $1, payment_method = $2, payment_reference = $3, updated_at = NOW() WHERE id = $4',
        ['completed', paymentMethod, paymentReference, sessionId]
      );

      if (session.type === 'contact_fee' && session.hiring_request_id) {
        await DatabaseService.query(
          'UPDATE hiring_requests SET contact_fee_status = $1, updated_at = NOW() WHERE id = $2',
          ['paid', session.hiring_request_id]
        );

        await DatabaseService.query(
          `INSERT INTO project_transactions (
            hiring_request_id, client_id, designer_id, amount, currency, type,
            status, payment_method, payment_reference, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            session.hiring_request_id,
            user.id,
            await getDesignerIdFromHiringRequest(session.hiring_request_id),
            amount,
            currency,
            'contact_fee',
            'paid',
            paymentMethod,
            paymentReference,
            'Contact fee for designer communication'
          ]
        );
      } else if (session.type === 'subscription' && session.plan_id) {
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

        await DatabaseService.query(
          `INSERT INTO user_subscriptions (
            user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id) DO UPDATE SET
            plan_id = EXCLUDED.plan_id,
            status = EXCLUDED.status,
            current_period_start = EXCLUDED.current_period_start,
            current_period_end = EXCLUDED.current_period_end,
            cancel_at_period_end = false,
            updated_at = NOW()`,
          [user.id, session.plan_id, 'active', currentDate, endDate, false]
        );
      }

      await DatabaseService.query('COMMIT');

      // Log payment confirmation (email functionality removed)
      try {
        const userName = `${user.firstName} ${user.lastName}`;
        const paymentDescription = session.type === 'contact_fee' 
          ? 'Contact fee for designer communication'
          : session.type === 'subscription'
          ? 'Subscription payment'
          : 'Platform payment';

        console.log(`Payment confirmation would be sent to: ${user.email} - Amount: ${amount} - Description: ${paymentDescription} - Reference: ${paymentReference}`);
      } catch (error) {
        console.error('Failed to process payment confirmation:', error);
      }

      return createSecureResponse({
        success: true,
        data: {
          paymentReference,
          status: 'completed',
          message: 'Payment processed successfully'
        }
      });
    } catch (error) {
      await DatabaseService.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

async function processPayment(
  paymentMethod: string, 
  amount: number, 
  currency: string, 
  paymentDetails: Record<string, unknown>,
  paymentReference: string
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (paymentMethod) {
      case 'mobile_money':
        return await processMobileMoneyPayment(amount, currency, paymentDetails, paymentReference);
      case 'bank_transfer':
        return await processBankTransferPayment(amount, currency, paymentDetails, paymentReference);
      case 'card':
        return await processCardPayment(amount, currency, paymentDetails, paymentReference);
      default:
        return { success: false, error: 'Unsupported payment method' };
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: 'Payment processing failed' };
  }
}

async function processMobileMoneyPayment(
  amount: number, 
  currency: string, 
  paymentDetails: Record<string, unknown>,
  paymentReference: string
): Promise<{ success: boolean; error?: string }> {
  // Simulate mobile money API integration
  // In a real implementation, you would integrate with MTN Mobile Money or Airtel Money APIs
  
  const phoneNumber = paymentDetails.phoneNumber;
  
  if (!phoneNumber) {
    return { success: false, error: 'Phone number is required for mobile money payments' };
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success (95% success rate for demo)
  const isSuccess = Math.random() > 0.05;
  
  if (isSuccess) {
    console.log(`Mobile Money Payment Processed: ${amount} ${currency} to ${phoneNumber}, Ref: ${paymentReference}`);
    return { success: true };
  } else {
    return { success: false, error: 'Mobile money payment failed. Please check your balance and try again.' };
  }
}

async function processBankTransferPayment(
  amount: number, 
  currency: string, 
  paymentDetails: Record<string, unknown>,
  paymentReference: string
): Promise<{ success: boolean; error?: string }> {
  // For bank transfers, we would typically mark as pending and verify manually
  // For demo purposes, we'll mark as successful immediately
  
  const bankAccount = paymentDetails.bankAccount;
  
  if (!bankAccount) {
    return { success: false, error: 'Bank account number is required' };
  }

  console.log(`Bank Transfer Payment Processed: ${amount} ${currency} from ${bankAccount}, Ref: ${paymentReference}`);
  return { success: true };
}

async function processCardPayment(
  amount: number, 
  currency: string, 
  paymentDetails: Record<string, unknown>,
  paymentReference: string
): Promise<{ success: boolean; error?: string }> {
  // In a real implementation, you would integrate with Stripe, PayPal, or local card processors
  // For now, this is not implemented
  return { success: false, error: 'Card payments are not yet available' };
}

function generatePaymentReference(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WID-${timestamp}-${random}`;
}

async function getDesignerIdFromHiringRequest(hiringRequestId: string): Promise<string> {
  const result = await DatabaseService.query(
    'SELECT designer_id FROM hiring_requests WHERE id = $1',
    [hiringRequestId]
  );
  return result.rows[0]?.designer_id;
}