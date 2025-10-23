import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { APIResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as APIResponse,
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let projectsQuery = '';
    let queryParams: any[] = [user.id, limit, offset];

    if (user.role === 'designer') {
      projectsQuery = `
        SELECT 
          hr.id,
          hr.project_title,
          hr.project_description,
          hr.budget,
          hr.timeline,
          hr.status,
          hr.created_at,
          hr.updated_at,
          u.first_name as client_first_name,
          u.last_name as client_last_name,
          u.email as client_email
        FROM hiring_requests hr
        JOIN users u ON hr.client_id = u.id
        WHERE hr.designer_id = $1
        ORDER BY hr.created_at DESC
        LIMIT $2 OFFSET $3
      `;
    } else if (user.role === 'client') {
      projectsQuery = `
        SELECT 
          hr.id,
          hr.project_title,
          hr.project_description,
          hr.budget,
          hr.timeline,
          hr.status,
          hr.created_at,
          hr.updated_at,
          u.first_name as designer_first_name,
          u.last_name as designer_last_name,
          u.email as designer_email,
          dp.average_rating as designer_rating
        FROM hiring_requests hr
        JOIN users u ON hr.designer_id = u.id
        LEFT JOIN designer_profiles dp ON hr.designer_id = dp.id
        WHERE hr.client_id = $1
        ORDER BY hr.created_at DESC
        LIMIT $2 OFFSET $3
      `;
    } else if (user.role === 'admin') {
      projectsQuery = `
        SELECT 
          hr.id,
          hr.project_title,
          hr.project_description,
          hr.budget,
          hr.timeline,
          hr.status,
          hr.created_at,
          hr.updated_at,
          uc.first_name as client_first_name,
          uc.last_name as client_last_name,
          ud.first_name as designer_first_name,
          ud.last_name as designer_last_name
        FROM hiring_requests hr
        JOIN users uc ON hr.client_id = uc.id
        JOIN users ud ON hr.designer_id = ud.id
        ORDER BY hr.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [limit, offset]; // Admin doesn't need user.id filter
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user role',
        } as APIResponse,
        { status: 403 }
      );
    }

    const result = await query(projectsQuery, queryParams);
    const projects = result.rows;

    return NextResponse.json(
      {
        success: true,
        data: {
          projects,
          total: projects.length,
          limit,
          offset,
        },
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard projects error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}