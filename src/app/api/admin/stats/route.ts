import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'admin', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Admin access control for Women in Design
    if (user.email !== 'admin@womenindesignuganda.com') {
      return createSecureResponse({ error: 'Admin access required' }, 403);
    }

    // Fetch comprehensive platform statistics
    const statsQueries = [
      // Total designers
      query('SELECT COUNT(*) as count FROM users WHERE role = \'designer\''),
      // Total suppliers  
      query('SELECT COUNT(*) as count FROM users WHERE role = \'supplier\''),
      // Total clients
      query('SELECT COUNT(*) as count FROM users WHERE role = \'client\''),
      // Total projects (hiring requests)
      query('SELECT COUNT(*) as count FROM hiring_requests'),
      // Active users (logged in within last 30 days)
      query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE is_active = true 
        AND updated_at >= NOW() - INTERVAL '30 days'
      `),
      // Verified businesses (designers and suppliers)
      query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role IN ('designer', 'supplier') 
        AND is_verified = true
      `),
      // Pending verifications (unverified designers and suppliers)
      query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE role IN ('designer', 'supplier') 
        AND is_verified = false 
        AND is_active = true
      `),
      // Total users
      query('SELECT COUNT(*) as count FROM users')
    ];

    const results = await Promise.all(statsQueries);

    const platformStats = {
      totalDesigners: parseInt(results[0].rows[0].count),
      totalSuppliers: parseInt(results[1].rows[0].count),
      totalClients: parseInt(results[2].rows[0].count),
      totalProjects: parseInt(results[3].rows[0].count),
      activeUsers: parseInt(results[4].rows[0].count),
      verifiedBusinesses: parseInt(results[5].rows[0].count),
      pendingVerifications: parseInt(results[6].rows[0].count),
      totalUsers: parseInt(results[7].rows[0].count)
    };

    return createSecureResponse({
      success: true,
      data: platformStats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}