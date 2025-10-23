import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { query } from '@/lib/database/connection';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'subscription', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType') as 'designer' | 'supplier';

    if (!userType || !['designer', 'supplier'].includes(userType)) {
      return createSecureResponse({ error: 'Invalid user type' }, 400);
    }

    // Fetch plans from database
    const result = await query(
      'SELECT id, name, price, currency, interval, features, limits, user_type FROM subscription_plans WHERE user_type = $1 AND is_active = true ORDER BY price ASC',
      [userType]
    );

    const plans = result.rows.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: parseFloat(plan.price),
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      limits: plan.limits,
      userType: plan.user_type,
      popular: plan.price > 0 // Mark paid plans as popular
    }));

    return createSecureResponse({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}