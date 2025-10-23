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

    const usageQueries = [];

    if (user.role === 'designer') {
      usageQueries.push(
        query(
          'SELECT COUNT(*) as portfolio_count FROM portfolio_items WHERE designer_id = $1',
          [user.id]
        ),
        query(
          `SELECT 
            COUNT(*) as total_images,
            COALESCE(SUM(array_length(string_to_array(images, ','), 1)), 0) as image_count
          FROM portfolio_items 
          WHERE designer_id = $1`,
          [user.id]
        )
      );
    } else if (user.role === 'supplier') {
      usageQueries.push(
        query(
          'SELECT COUNT(*) as product_count FROM supplier_products WHERE supplier_id = $1',
          [user.id]
        )
      );
    }

    const results = await Promise.all(usageQueries);

    let usageData: any = {};

    if (user.role === 'designer') {
      const portfolioResult = results[0];
      const imageResult = results[1];

      const currentSubscriptionResult = await query(
        `SELECT sp.limits 
        FROM user_subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1`,
        [user.id]
      );

      const limits = currentSubscriptionResult.rows[0]?.limits || {
        portfolioItems: 10,
        imageUploads: 50
      };

      usageData = {
        portfolioItems: {
          used: parseInt(portfolioResult.rows[0].portfolio_count),
          limit: limits.portfolioItems || 10
        },
        imageUploads: {
          used: parseInt(imageResult.rows[0].image_count || '0'),
          limit: limits.imageUploads || 50
        }
      };

      const storageResult = await query(
        `SELECT 
          SUM(
            CASE 
              WHEN images ~ '^\\[.*\\]$' THEN array_length(string_to_array(trim(both '[]' from images), ','), 1)
              ELSE 1
            END
          ) * 2048 as estimated_storage_bytes
        FROM portfolio_items 
        WHERE designer_id = $1`,
        [user.id]
      );

      const storageBytes = parseInt(storageResult.rows[0]?.estimated_storage_bytes || '0');
      const storageMB = storageBytes / (1024 * 1024);
      
      usageData.storageUsed = {
        bytes: storageBytes,
        readable: storageMB < 1024 
          ? `${storageMB.toFixed(1)} MB` 
          : `${(storageMB / 1024).toFixed(1)} GB`
      };

    } else if (user.role === 'supplier') {
      const productResult = results[0];

      const currentSubscriptionResult = await query(
        `SELECT sp.limits 
        FROM user_subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1`,
        [user.id]
      );

      const limits = currentSubscriptionResult.rows[0]?.limits || {
        productLines: 10
      };

      usageData = {
        portfolioItems: {
          used: 0,
          limit: 0
        },
        productLines: {
          used: parseInt(productResult.rows[0].product_count),
          limit: limits.productLines || 10
        }
      };
    }

    return createSecureResponse({
      success: true,
      data: usageData
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}