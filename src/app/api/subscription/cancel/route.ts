import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'subscription_cancel', 3, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many cancellation attempts' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const subscriptionResult = await DatabaseService.query(
      'SELECT id, status, current_period_end FROM user_subscriptions WHERE user_id = $1 AND status = \'active\' ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    if (subscriptionResult.rows.length === 0) {
      return createSecureResponse({ error: 'No active subscription found' }, 404);
    }

    const subscription = subscriptionResult.rows[0];

    await DatabaseService.query(
      'UPDATE user_subscriptions SET cancel_at_period_end = true, updated_at = NOW() WHERE id = $1',
      [subscription.id],
      {
        monitoring: {
          name: 'cancel_subscription',
          metadata: { userId: user.id, subscriptionId: subscription.id }
        }
      }
    );

    await DatabaseService.query(
      `INSERT INTO subscription_cancellations (
        subscription_id, user_id, cancelled_at, effective_date, reason
      ) VALUES ($1, $2, NOW(), $3, $4)`,
      [subscription.id, user.id, subscription.current_period_end, 'user_requested']
    );

    return createSecureResponse({
      success: true,
      message: `Subscription will be cancelled at the end of your current billing period (${new Date(subscription.current_period_end).toLocaleDateString()})`
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}