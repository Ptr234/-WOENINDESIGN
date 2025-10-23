import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'subscription', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const subscriptionResult = await query(
      `SELECT 
        s.id, s.plan_id, s.status, s.current_period_start, 
        s.current_period_end, s.cancel_at_period_end, s.created_at,
        sp.name as plan_name, sp.price, sp.currency, sp.interval,
        sp.features, sp.limits, sp.user_type
      FROM user_subscriptions s
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = $1 AND s.status IN ('active', 'cancelled')
      ORDER BY s.created_at DESC
      LIMIT 1`,
      [user.id]
    );

    if (subscriptionResult.rows.length === 0) {
      const defaultPlanId = user.role === 'designer' ? 'designer-free' : 'supplier-free';
      
      return createSecureResponse({
        success: true,
        data: {
          subscription: null,
          plan: {
            id: defaultPlanId,
            name: 'Free',
            price: 0,
            currency: 'UGX',
            interval: 'monthly',
            features: user.role === 'designer' 
              ? ['Up to 10 portfolio items', 'Basic image uploads', 'Public portfolio visibility']
              : ['Up to 10 product lines', 'Basic product showcase', 'Public supplier profile'],
            limits: user.role === 'designer'
              ? { portfolioItems: 10, imageUploads: 50, priority: 'low' }
              : { productLines: 10, priority: 'low' },
            userType: user.role
          }
        }
      });
    }

    const subscription = subscriptionResult.rows[0];
    
    const responseData = {
      subscription: {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        createdAt: subscription.created_at
      },
      plan: {
        id: subscription.plan_id,
        name: subscription.plan_name,
        price: subscription.price,
        currency: subscription.currency,
        interval: subscription.interval,
        features: subscription.features,
        limits: subscription.limits,
        userType: subscription.user_type
      }
    };

    return createSecureResponse({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}