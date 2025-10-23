import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { validateUUID } from '@/lib/security/validation';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const rateLimitResult = await rateLimitMiddleware(request, 'hiring', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { id } = params;
    
    if (!validateUUID(id)) {
      return createSecureResponse({ error: 'Invalid hiring request ID' }, 400);
    }

    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const result = await DatabaseService.query(
      `SELECT 
        hr.id, hr.client_id, hr.designer_id, hr.project_title, hr.project_description,
        hr.budget, hr.timeline, hr.project_type, hr.priority, hr.location,
        hr.status, hr.contact_fee_status, hr.contact_preferences,
        hr.created_at, hr.updated_at,
        c.first_name as client_first_name, c.last_name as client_last_name,
        c.email as client_email, c.phone as client_phone, c.profile_picture as client_profile_picture,
        d.first_name as designer_first_name, d.last_name as designer_last_name,
        d.email as designer_email, d.phone as designer_phone, d.profile_picture as designer_profile_picture
      FROM hiring_requests hr
      JOIN users c ON hr.client_id = c.id
      JOIN users d ON hr.designer_id = d.id
      WHERE hr.id = $1 AND (hr.client_id = $2 OR hr.designer_id = $2)`,
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return createSecureResponse({ error: 'Hiring request not found' }, 404);
    }

    const row = result.rows[0];
    const hiringRequest = {
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
      designer: {
        firstName: row.designer_first_name,
        lastName: row.designer_last_name,
        email: row.designer_email,
        phone: row.designer_phone,
        profilePicture: row.designer_profile_picture,
      },
    };

    return createSecureResponse({
      success: true,
      data: hiringRequest
    });
  } catch (error) {
    console.error('Error fetching hiring request:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rateLimitResult = await rateLimitMiddleware(request, 'hiring_update', 10, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many update attempts' }, 429);
  }

  try {
    const { id } = params;
    
    if (!validateUUID(id)) {
      return createSecureResponse({ error: 'Invalid hiring request ID' }, 400);
    }

    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['accepted', 'declined', 'cancelled', 'completed'].includes(status)) {
      return createSecureResponse({ error: 'Invalid status' }, 400);
    }

    const existingRequestResult = await DatabaseService.query(
      `SELECT 
        hr.client_id, hr.designer_id, hr.status, hr.contact_fee_status, hr.project_title,
        c.email as client_email, c.first_name as client_first_name, c.last_name as client_last_name,
        d.email as designer_email, d.first_name as designer_first_name, d.last_name as designer_last_name
      FROM hiring_requests hr
      JOIN users c ON hr.client_id = c.id
      JOIN users d ON hr.designer_id = d.id
      WHERE hr.id = $1`,
      [id]
    );

    if (existingRequestResult.rows.length === 0) {
      return createSecureResponse({ error: 'Hiring request not found' }, 404);
    }

    const existingRequest = existingRequestResult.rows[0];

    if (status === 'accepted' || status === 'declined') {
      if (user.id !== existingRequest.designer_id) {
        return createSecureResponse({ error: 'Only the designer can accept or decline requests' }, 403);
      }
      if (existingRequest.status !== 'pending') {
        return createSecureResponse({ error: 'Request has already been processed' }, 400);
      }
      if (existingRequest.contact_fee_status !== 'paid') {
        return createSecureResponse({ error: 'Contact fee must be paid before accepting' }, 400);
      }
    } else if (status === 'cancelled') {
      if (user.id !== existingRequest.client_id) {
        return createSecureResponse({ error: 'Only the client can cancel requests' }, 403);
      }
      if (!['pending', 'accepted'].includes(existingRequest.status)) {
        return createSecureResponse({ error: 'Request cannot be cancelled in current status' }, 400);
      }
    } else if (status === 'completed') {
      if (user.id !== existingRequest.designer_id && user.id !== existingRequest.client_id) {
        return createSecureResponse({ error: 'Only the client or designer can mark as completed' }, 403);
      }
      if (existingRequest.status !== 'accepted') {
        return createSecureResponse({ error: 'Only accepted requests can be marked as completed' }, 400);
      }
    }

    const updateResult = await DatabaseService.query(
      'UPDATE hiring_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id],
      {
        monitoring: {
          name: 'update_hiring_request_status',
          metadata: { hiringRequestId: id, newStatus: status, userId: user.id }
        }
      }
    );

    const updatedRequest = updateResult.rows[0];

    // Log project status update notification (email functionality removed)
    try {
      const clientName = `${existingRequest.client_first_name} ${existingRequest.client_last_name}`;
      const designerName = `${existingRequest.designer_first_name} ${existingRequest.designer_last_name}`;
      
      console.log(`Project status update notification would be sent to: ${existingRequest.client_email} - Project: ${existingRequest.project_title} Status: ${status}`);
    } catch (error) {
      console.error('Failed to process project status update notification:', error);
    }

    return createSecureResponse({
      success: true,
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        updatedAt: updatedRequest.updated_at,
      },
      message: `Hiring request ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating hiring request:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}