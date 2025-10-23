import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { validateUUID } from '@/lib/security/validation';

const SUBSCRIPTION_PLANS = {
  'designer-free': {
    name: 'Free',
    price: 0,
    currency: 'UGX',
    interval: 'monthly',
    userType: 'designer',
    limits: { portfolioItems: 10, imageUploads: 50, priority: 'low' }
  },
  'designer-pro': {
    name: 'Pro',
    price: 50000,
    currency: 'UGX',
    interval: 'yearly',
    userType: 'designer',
    limits: { portfolioItems: -1, imageUploads: -1, priority: 'high' }
  },
  'supplier-free': {
    name: 'Free',
    price: 0,
    currency: 'UGX',
    interval: 'monthly',
    userType: 'supplier',
    limits: { productLines: 10, priority: 'low' }
  },
  'supplier-business': {
    name: 'Business',
    price: 200000,
    currency: 'UGX',
    interval: 'yearly',
    userType: 'supplier',
    limits: { productLines: -1, priority: 'high' }
  }
};

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'subscription_change', 5, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many subscription change attempts' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { planId } = await request.json();

    if (!planId || !SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return createSecureResponse({ error: 'Invalid plan ID' }, 400);
    }

    const selectedPlan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS];

    if (selectedPlan.userType !== user.role) {
      return createSecureResponse({ error: 'Plan not available for your user type' }, 400);
    }

    const currentSubscriptionResult = await DatabaseService.query(
      'SELECT id, plan_id, status FROM user_subscriptions WHERE user_id = $1 AND status IN (\'active\', \'cancelled\') ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    const currentSubscription = currentSubscriptionResult.rows[0];

    if (currentSubscription && currentSubscription.plan_id === planId) {
      return createSecureResponse({ error: 'You are already on this plan' }, 400);
    }

    const periodStart = new Date();
    const periodEnd = new Date();
    if (selectedPlan.interval === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    if (selectedPlan.price === 0) {
      if (currentSubscription) {
        await DatabaseService.query(
          'UPDATE user_subscriptions SET status = \'cancelled\', updated_at = NOW() WHERE id = $1',
          [currentSubscription.id]
        );
      }

      const newSubscriptionResult = await DatabaseService.query(
        `INSERT INTO user_subscriptions (
          user_id, plan_id, status, current_period_start, current_period_end,
          cancel_at_period_end
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [user.id, planId, 'active', periodStart, periodEnd, false]
      );

      return createSecureResponse({
        success: true,
        data: {
          subscriptionId: newSubscriptionResult.rows[0].id,
          paymentRequired: false
        },
        message: 'Successfully switched to free plan'
      });
    }

    const paymentSessionId = `payment_${user.id}_${planId}_${Date.now()}`;
    
    await DatabaseService.query(
      `INSERT INTO payment_sessions (
        id, user_id, plan_id, amount, currency, status, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        paymentSessionId,
        user.id,
        planId,
        selectedPlan.price,
        selectedPlan.currency,
        'pending',
        new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      ]
    );

    const paymentUrl = `/payment/checkout?session_id=${paymentSessionId}`;

    return createSecureResponse({
      success: true,
      data: {
        paymentRequired: true,
        paymentUrl,
        sessionId: paymentSessionId
      },
      message: 'Payment required to complete subscription change'
    });
  } catch (error) {
    console.error('Error changing subscription:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}