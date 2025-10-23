import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'subscription_reactivate', 5, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many reactivation attempts' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const subscriptionResult = await DatabaseService.query(
      'SELECT id, status, cancel_at_period_end, current_period_end FROM user_subscriptions WHERE user_id = $1 AND status = \'active\' AND cancel_at_period_end = true ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    if (subscriptionResult.rows.length === 0) {
      return createSecureResponse({ error: 'No subscription scheduled for cancellation found' }, 404);
    }

    const subscription = subscriptionResult.rows[0];

    if (new Date() > new Date(subscription.current_period_end)) {
      return createSecureResponse({ error: 'Subscription has already expired and cannot be reactivated' }, 400);
    }

    await DatabaseService.query(
      'UPDATE user_subscriptions SET cancel_at_period_end = false, updated_at = NOW() WHERE id = $1',
      [subscription.id],
      {
        monitoring: {
          name: 'reactivate_subscription',
          metadata: { userId: user.id, subscriptionId: subscription.id }
        }
      }
    );

    await DatabaseService.query(
      'DELETE FROM subscription_cancellations WHERE subscription_id = $1',
      [subscription.id]
    );

    return createSecureResponse({
      success: true,
      message: 'Subscription has been successfully reactivated'
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}