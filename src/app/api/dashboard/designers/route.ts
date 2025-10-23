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
    const available = searchParams.get('available') === 'true';

    let designersQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.profile_picture,
        dp.specialty,
        dp.years_of_experience,
        dp.biography,
        dp.location,
        dp.hourly_rate,
        dp.availability,
        dp.skills,
        dp.average_rating,
        dp.total_projects,
        COUNT(pi.id) as portfolio_count
      FROM users u
      JOIN designer_profiles dp ON u.id = dp.id
      LEFT JOIN portfolio_items pi ON u.id = pi.designer_id AND pi.is_public = true
      WHERE u.role = 'designer' AND u.is_active = true
    `;

    let queryParams: any[] = [];
    let paramIndex = 1;

    if (available) {
      designersQuery += ` AND dp.availability = 'available'`;
    }

    // If client is requesting, exclude designers they've already worked with for recommendations
    if (user.role === 'client') {
      designersQuery += ` AND u.id NOT IN (
        SELECT designer_id FROM hiring_requests WHERE client_id = $${paramIndex}
      )`;
      queryParams.push(user.id);
      paramIndex++;
    }

    designersQuery += `
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.profile_picture,
               dp.specialty, dp.years_of_experience, dp.biography, dp.location,
               dp.hourly_rate, dp.availability, dp.skills, dp.average_rating, dp.total_projects
      ORDER BY dp.average_rating DESC, dp.total_projects DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);

    const result = await query(designersQuery, queryParams);
    const designers = result.rows;

    return NextResponse.json(
      {
        success: true,
        data: {
          designers,
          total: designers.length,
          limit,
          offset,
        },
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard designers error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}