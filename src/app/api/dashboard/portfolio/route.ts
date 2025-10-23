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

    if (user.role !== 'designer' && user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
        } as APIResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    let portfolioQuery = '';
    let queryParams: any[];

    if (user.role === 'admin') {
      portfolioQuery = `
        SELECT 
          pi.id,
          pi.title,
          pi.description,
          pi.category,
          pi.tags,
          pi.images,
          pi.project_date,
          pi.client_name,
          pi.is_public,
          pi.created_at,
          u.first_name as designer_first_name,
          u.last_name as designer_last_name
        FROM portfolio_items pi
        JOIN users u ON pi.designer_id = u.id
        ORDER BY pi.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];
    } else {
      portfolioQuery = `
        SELECT 
          id,
          title,
          description,
          category,
          tags,
          images,
          project_date,
          client_name,
          is_public,
          created_at
        FROM portfolio_items
        WHERE designer_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [user.id, limit, offset];
    }

    const result = await query(portfolioQuery, queryParams);
    const portfolioItems = result.rows;

    return NextResponse.json(
      {
        success: true,
        data: {
          portfolioItems,
          total: portfolioItems.length,
          limit,
          offset,
        },
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard portfolio error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}