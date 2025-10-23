import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'dashboard', 60, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'client') {
      return createSecureResponse({ error: 'Access denied' }, 403);
    }

    // Fetch client dashboard statistics
    const statsQueries = [
      // Active hiring requests
      query(
        'SELECT COUNT(*) as count FROM hiring_requests WHERE client_id = $1 AND status IN (\'pending\', \'in_progress\')',
        [user.id]
      ),
      // Pending responses (hiring requests waiting for designer response)
      query(
        'SELECT COUNT(*) as count FROM hiring_requests WHERE client_id = $1 AND status = \'pending\'',
        [user.id]
      ),
      // Completed projects
      query(
        'SELECT COUNT(*) as count FROM hiring_requests WHERE client_id = $1 AND status = \'completed\'',
        [user.id]
      ),
      // Total spent on projects
      query(
        'SELECT COALESCE(SUM(budget), 0) as total FROM hiring_requests WHERE client_id = $1 AND status IN (\'completed\', \'paid\')',
        [user.id]
      ),
      // Saved designers
      query(
        'SELECT COUNT(*) as count FROM saved_professionals WHERE client_id = $1 AND professional_type = \'designer\'',
        [user.id]
      ),
      // Saved suppliers
      query(
        'SELECT COUNT(*) as count FROM saved_professionals WHERE client_id = $1 AND professional_type = \'supplier\'',
        [user.id]
      ),
      // Unread messages
      query(
        'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = false',
        [user.id]
      )
    ];

    const results = await Promise.all(statsQueries);

    const stats = {
      activeHiringRequests: parseInt(results[0].rows[0].count),
      pendingResponses: parseInt(results[1].rows[0].count),
      completedProjects: parseInt(results[2].rows[0].count),
      totalSpent: parseFloat(results[3].rows[0].total || '0'),
      savedDesigners: parseInt(results[4].rows[0].count),
      savedSuppliers: parseInt(results[5].rows[0].count),
      unreadMessages: parseInt(results[6].rows[0].count)
    };

    return createSecureResponse({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching client dashboard stats:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}