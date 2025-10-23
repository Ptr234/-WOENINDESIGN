import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { validateRequest, portfolioItemSchema } from '@/lib/security/validation';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'portfolio', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { searchParams } = new URL(request.url);
    const designerId = searchParams.get('designerId');
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = await AuthService.authenticateRequest(request);
    
    let query = `
      SELECT 
        p.id, p.title, p.description, p.category, p.tags, p.images,
        p.project_date, p.client_name, p.is_public, p.created_at, p.updated_at,
        u.first_name, u.last_name
      FROM portfolio_items p
      JOIN users u ON p.designer_id = u.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (designerId) {
      query += ` AND p.designer_id = $${paramIndex++}`;
      queryParams.push(designerId);
    }

    if (category && category !== 'All') {
      query += ` AND p.category = $${paramIndex++}`;
      queryParams.push(category);
    }

    if (!user || (user && designerId !== user.id)) {
      query += ` AND p.is_public = true`;
    }

    if (isPublic === 'true') {
      query += ` AND p.is_public = true`;
    } else if (isPublic === 'false' && user) {
      query += ` AND p.is_public = false AND p.designer_id = $${paramIndex++}`;
      queryParams.push(user.id);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    const result = await DatabaseService.query(query, queryParams, {
      cache: {
        key: `portfolio:${designerId || 'all'}:${category || 'all'}:${isPublic || 'all'}:${limit}:${offset}`,
        ttl: 300,
        tags: ['portfolio']
      },
      monitoring: {
        name: 'get_portfolio_items',
        metadata: { designerId, category, isPublic }
      }
    });

    const portfolioItems = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      tags: row.tags,
      images: row.images,
      projectDate: row.project_date,
      clientName: row.client_name,
      isPublic: row.is_public,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      designer: {
        firstName: row.first_name,
        lastName: row.last_name,
      },
    }));

    return createSecureResponse({
      success: true,
      data: portfolioItems,
      meta: {
        total: portfolioItems.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'portfolio_create', 10, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many portfolio creation attempts' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'designer') {
      return createSecureResponse({ error: 'Only designers can create portfolio items' }, 403);
    }

    const body = await request.json();
    
    const validation = validateRequest(portfolioItemSchema)(body);
    if (!validation.success) {
      return createSecureResponse({
        error: 'Invalid input data',
        details: validation.error
      }, 400);
    }

    const {
      title,
      description,
      category,
      tags,
      images,
      projectDate,
      clientName,
      isPublic
    } = validation.data;

    if (!images || images.length === 0) {
      return createSecureResponse({ error: 'At least one image is required' }, 400);
    }

    if (images.length > 10) {
      return createSecureResponse({ error: 'Maximum 10 images allowed per portfolio item' }, 400);
    }

    const insertQuery = `
      INSERT INTO portfolio_items (
        designer_id, title, description, category, tags, images,
        project_date, client_name, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, description, category, tags, images,
                project_date, client_name, is_public, created_at, updated_at
    `;

    const result = await DatabaseService.query(
      insertQuery,
      [
        user.id,
        title,
        description || null,
        category,
        tags || null,
        JSON.stringify(images),
        projectDate || null,
        clientName || null,
        isPublic
      ],
      {
        monitoring: {
          name: 'create_portfolio_item',
          metadata: { userId: user.id, category }
        }
      }
    );

    const portfolioItem = result.rows[0];
    const responseData = {
      id: portfolioItem.id,
      title: portfolioItem.title,
      description: portfolioItem.description,
      category: portfolioItem.category,
      tags: portfolioItem.tags,
      images: JSON.parse(portfolioItem.images),
      projectDate: portfolioItem.project_date,
      clientName: portfolioItem.client_name,
      isPublic: portfolioItem.is_public,
      createdAt: portfolioItem.created_at,
      updatedAt: portfolioItem.updated_at,
    };

    return createSecureResponse({
      success: true,
      data: responseData,
      message: 'Portfolio item created successfully'
    }, 201);
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}