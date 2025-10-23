import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const rateLimitResult = await rateLimitMiddleware(request, 'admin_user_details', 20, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Admin access control
    if (user.email !== 'admin@womenindesignuganda.com') {
      return createSecureResponse({ error: 'Admin access required' }, 403);
    }

    const userId = params.id;

    // Get basic user information
    const userResult = await query(`
      SELECT 
        u.id, u.email, u.role, u.first_name, u.last_name, u.phone, 
        u.profile_picture, u.is_verified, u.is_active, u.created_at, 
        u.updated_at, u.last_login_at
      FROM users u 
      WHERE u.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return createSecureResponse({ error: 'User not found' }, 404);
    }

    const userData = userResult.rows[0];
    let profileData = null;
    let documents = [];
    let verificationData = null;

    // Get role-specific profile data
    if (userData.role === 'designer') {
      const designerResult = await query(`
        SELECT 
          specialty, years_of_experience, biography, location, hourly_rate,
          availability, skills, education, certifications, website, instagram,
          linkedin, behance, dribbble, average_rating, total_projects
        FROM designer_profiles 
        WHERE id = $1
      `, [userId]);

      if (designerResult.rows.length > 0) {
        profileData = {
          type: 'designer',
          ...designerResult.rows[0]
        };
      }

      // Get portfolio items
      const portfolioResult = await query(`
        SELECT id, title, description, images, tags, created_at
        FROM portfolio_items 
        WHERE designer_id = $1 
        ORDER BY created_at DESC
      `, [userId]);

      profileData.portfolio = portfolioResult.rows;

    } else if (userData.role === 'supplier') {
      const supplierResult = await query(`
        SELECT 
          business_name, business_description, category, location, business_phone,
          business_email, address, website, business_hours, delivery_areas,
          minimum_order, payment_methods
        FROM supplier_profiles 
        WHERE id = $1
      `, [userId]);

      if (supplierResult.rows.length > 0) {
        profileData = {
          type: 'supplier',
          ...supplierResult.rows[0]
        };
      }

      // Get products
      const productsResult = await query(`
        SELECT id, name, description, price, category, images, stock_quantity, created_at
        FROM products 
        WHERE supplier_id = $1 
        ORDER BY created_at DESC
      `, [userId]);

      profileData.products = productsResult.rows;
    }

    // Get user documents for verification
    try {
      const documentsResult = await query(`
        SELECT 
          id, document_type, file_url, file_name, upload_date, 
          verification_status, admin_notes, verified_at, verified_by
        FROM user_documents 
        WHERE user_id = $1 
        ORDER BY upload_date DESC
      `, [userId]);

      documents = documentsResult.rows;
    } catch (error) {
      // Table might not exist, create mock documents
      documents = [];
    }

    // Get verification history
    try {
      const verificationResult = await query(`
        SELECT 
          id, verification_type, status, requested_at, completed_at,
          admin_id, admin_notes, rejection_reason
        FROM user_verifications 
        WHERE user_id = $1 
        ORDER BY requested_at DESC
      `, [userId]);

      verificationData = verificationResult.rows;
    } catch (error) {
      verificationData = [];
    }

    // Get activity summary
    const activityData = await getUserActivitySummary(userId);

    // Get subscription info if applicable
    let subscriptionData = null;
    if (userData.role === 'designer' || userData.role === 'supplier') {
      try {
        const subscriptionResult = await query(`
          SELECT 
            s.id, s.plan_id, s.status, s.current_period_start, 
            s.current_period_end, s.cancel_at_period_end,
            sp.name as plan_name, sp.price, sp.currency, sp.interval
          FROM subscriptions s
          JOIN subscription_plans sp ON s.plan_id = sp.id
          WHERE s.user_id = $1 AND s.status = 'active'
          ORDER BY s.created_at DESC
          LIMIT 1
        `, [userId]);

        if (subscriptionResult.rows.length > 0) {
          subscriptionData = subscriptionResult.rows[0];
        }
      } catch (error) {
        subscriptionData = null;
      }
    }

    return createSecureResponse({
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          firstName: userData.first_name,
          lastName: userData.last_name,
          phone: userData.phone,
          profilePicture: userData.profile_picture,
          isVerified: userData.is_verified,
          isActive: userData.is_active,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
          lastLoginAt: userData.last_login_at
        },
        profile: profileData,
        documents,
        verification: verificationData,
        activity: activityData,
        subscription: subscriptionData
      }
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

async function getUserActivitySummary(userId: string) {
  try {
    const activities = await Promise.all([
      // Messages sent
      query('SELECT COUNT(*) as count FROM messages WHERE sender_id = $1', [userId]),
      // Messages received  
      query('SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1', [userId]),
      // Hiring requests sent (if client)
      query('SELECT COUNT(*) as count FROM hiring_requests WHERE client_id = $1', [userId]),
      // Hiring requests received (if designer/supplier)
      query('SELECT COUNT(*) as count FROM hiring_requests WHERE designer_id = $1 OR supplier_id = $1', [userId]),
      // Contact fee payments made
      query('SELECT COUNT(*) as count FROM project_transactions WHERE client_id = $1 AND type = \'contact_fee\' AND status = \'completed\'', [userId]),
      // Last login
      query('SELECT last_login_at FROM users WHERE id = $1', [userId])
    ]);

    return {
      messagesSent: parseInt(activities[0].rows[0].count),
      messagesReceived: parseInt(activities[1].rows[0].count),
      hiringRequestsSent: parseInt(activities[2].rows[0].count),
      hiringRequestsReceived: parseInt(activities[3].rows[0].count),
      contactPaymentsMade: parseInt(activities[4].rows[0].count),
      lastLogin: activities[5].rows[0].last_login_at
    };
  } catch (error) {
    return {
      messagesSent: 0,
      messagesReceived: 0,
      hiringRequestsSent: 0,
      hiringRequestsReceived: 0,
      contactPaymentsMade: 0,
      lastLogin: null
    };
  }
}