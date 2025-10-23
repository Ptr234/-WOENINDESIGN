import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'hiring', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'designer') {
      return createSecureResponse({ error: 'Only designers can view received hiring requests' }, 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        hr.id, hr.client_id, hr.designer_id, hr.project_title, hr.project_description,
        hr.budget, hr.timeline, hr.project_type, hr.priority, hr.location,
        hr.status, hr.contact_fee_status, hr.contact_preferences,
        hr.created_at, hr.updated_at,
        u.first_name as client_first_name, u.last_name as client_last_name,
        u.email as client_email, u.phone as client_phone, u.profile_picture as client_profile_picture
      FROM hiring_requests hr
      JOIN users u ON hr.client_id = u.id
      WHERE hr.designer_id = $1
    `;

    const queryParams: any[] = [user.id];
    let paramIndex = 2;

    if (status && ['pending', 'accepted', 'declined', 'cancelled', 'completed'].includes(status)) {
      query += ` AND hr.status = $${paramIndex++}`;
      queryParams.push(status);
    }

    query += ` ORDER BY hr.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    const result = await DatabaseService.query(query, queryParams, {
      cache: {
        key: `hiring_received:${user.id}:${status || 'all'}:${limit}:${offset}`,
        ttl: 60,
        tags: ['hiring']
      },
      monitoring: {
        name: 'get_received_hiring_requests',
        metadata: { designerId: user.id, status }
      }
    });

    const hiringRequests = result.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      designerId: row.designer_id,
      projectTitle: row.project_title,
      projectDescription: row.project_description,
      budget: parseFloat(row.budget),
      timeline: row.timeline,
      projectType: row.project_type,
      priority: row.priority,
      location: row.location,
      status: row.status,
      contactFeeStatus: row.contact_fee_status,
      contactPreferences: JSON.parse(row.contact_preferences),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      client: {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        email: row.client_email,
        phone: row.client_phone,
        profilePicture: row.client_profile_picture,
      },
    }));

    return createSecureResponse({
      success: true,
      data: hiringRequests,
      meta: {
        total: hiringRequests.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching received hiring requests:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}