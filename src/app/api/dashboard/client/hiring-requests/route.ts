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

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');

    let whereClause = 'WHERE hr.client_id = $1';
    const queryParams: any[] = [user.id];

    if (status) {
      whereClause += ' AND hr.status = $2';
      queryParams.push(status);
    }

    // Fetch hiring requests with designer information
    const hiringRequestsQuery = `
      SELECT 
        hr.id,
        hr.project_title,
        hr.project_description,
        hr.budget,
        hr.timeline,
        hr.status,
        hr.created_at,
        hr.deadline,
        hr.priority,
        hr.last_updated,
        u.first_name || ' ' || u.last_name as designer_name,
        u.email as designer_email,
        CASE 
          WHEN hr.status = 'completed' THEN 100
          WHEN hr.status = 'in_progress' THEN 
            CASE 
              WHEN hr.deadline > CURRENT_DATE THEN 
                GREATEST(0, LEAST(100, 
                  ((EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) - EXTRACT(EPOCH FROM hr.created_at)) / 
                   (EXTRACT(EPOCH FROM hr.deadline) - EXTRACT(EPOCH FROM hr.created_at))) * 100
                ))
              ELSE 90
            END
          WHEN hr.status = 'pending' THEN 5
          ELSE 0
        END as progress
      FROM hiring_requests hr
      LEFT JOIN users u ON hr.designer_id = u.id
      ${whereClause}
      ORDER BY 
        CASE hr.status 
          WHEN 'in_progress' THEN 1
          WHEN 'pending' THEN 2
          WHEN 'completed' THEN 3
          ELSE 4
        END,
        hr.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);
    const result = await query(hiringRequestsQuery, queryParams);

    // Count total hiring requests for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM hiring_requests hr
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams.slice(0, -2));

    const hiringRequests = result.rows.map(row => ({
      id: row.id,
      projectTitle: row.project_title,
      designerName: row.designer_name || 'No designer assigned',
      status: row.status,
      budget: parseFloat(row.budget || '0'),
      deadline: row.deadline ? new Date(row.deadline).toLocaleDateString() : 'No deadline',
      progress: parseInt(row.progress || '0'),
      lastUpdate: row.last_updated ? new Date(row.last_updated).toLocaleDateString() : new Date(row.created_at).toLocaleDateString(),
      priority: row.priority || 'medium'
    }));

    return createSecureResponse({
      success: true,
      data: hiringRequests,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
        hasMore: (offset + limit) < parseInt(countResult.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Error fetching client hiring requests:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}