import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { APIResponse, SearchResults, User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as APIResponse,
        { status: 401 }
      );
    }

    // Check if user is admin (for now, we'll use a simple check)
    // In production, you'd have proper admin roles
    if (user.email !== 'admin@womenindesignuganda.com') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' } as APIResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const whereConditions = ['1=1'];
    const queryParams: string[] = [];
    let paramIndex = 1;

    if (role) {
      whereConditions.push(`role = $${paramIndex}`);
      queryParams.push(role);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        LOWER(first_name || ' ' || last_name) LIKE LOWER($${paramIndex}) OR
        LOWER(email) LIKE LOWER($${paramIndex + 1})
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
      paramIndex += 2;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users WHERE ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT id, email, role, first_name, last_name, phone, profile_picture, 
             is_verified, is_active, created_at, updated_at
      FROM users 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const dataResult = await query(dataQuery, queryParams);

    const users = dataResult.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      profilePicture: row.profile_picture,
      isVerified: row.is_verified,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          total,
          pagination: {
            page,
            limit,
            total,
            hasMore: hasNext,
            totalPages
          }
        },
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as APIResponse,
      { status: 500 }
    );
  }
}