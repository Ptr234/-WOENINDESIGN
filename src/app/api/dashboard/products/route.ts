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

    if (user.role !== 'supplier' && user.role !== 'admin') {
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

    let productsQuery = '';
    let queryParams: any[];

    if (user.role === 'admin') {
      productsQuery = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.category,
          p.price,
          p.images,
          p.specifications,
          p.in_stock,
          p.created_at,
          sp.business_name as supplier_name,
          u.first_name as supplier_first_name,
          u.last_name as supplier_last_name
        FROM products p
        JOIN supplier_profiles sp ON p.supplier_id = sp.id
        JOIN users u ON sp.id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];
    } else {
      productsQuery = `
        SELECT 
          id,
          name,
          description,
          category,
          price,
          images,
          specifications,
          in_stock,
          created_at,
          updated_at
        FROM products
        WHERE supplier_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [user.id, limit, offset];
    }

    const result = await query(productsQuery, queryParams);
    const products = result.rows;

    return NextResponse.json(
      {
        success: true,
        data: {
          products,
          total: products.length,
          limit,
          offset,
        },
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}