import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { validateRequest, portfolioItemSchema } from '@/lib/security/validation';
import { validateUUID } from '@/lib/security/validation';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitResult = await rateLimitMiddleware(request, 'portfolio', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { id } = params;
    
    if (!validateUUID(id)) {
      return createSecureResponse({ error: 'Invalid portfolio item ID' }, 400);
    }

    const user = await AuthService.authenticateRequest(request);
    
    let query = `
      SELECT 
        p.id, p.title, p.description, p.category, p.tags, p.images,
        p.project_date, p.client_name, p.is_public, p.created_at, p.updated_at,
        p.designer_id, u.first_name, u.last_name, u.email
      FROM portfolio_items p
      JOIN users u ON p.designer_id = u.id
      WHERE p.id = $1
    `;

    if (!user) {
      query += ` AND p.is_public = true`;
    }

    const result = await DatabaseService.query(query, [id], {
      cache: {
        key: `portfolio_item:${id}`,
        ttl: 300,
        tags: ['portfolio']
      },
      monitoring: {
        name: 'get_portfolio_item',
        metadata: { portfolioItemId: id }
      }
    });

    if (result.rows.length === 0) {
      return createSecureResponse({ error: 'Portfolio item not found' }, 404);
    }

    const item = result.rows[0];

    if (!item.is_public && (!user || user.id !== item.designer_id)) {
      return createSecureResponse({ error: 'Portfolio item not found' }, 404);
    }

    const portfolioItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags,
      images: JSON.parse(item.images),
      projectDate: item.project_date,
      clientName: item.client_name,
      isPublic: item.is_public,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      designer: {
        id: item.designer_id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
      },
    };

    return createSecureResponse({
      success: true,
      data: portfolioItem
    });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rateLimitResult = await rateLimitMiddleware(request, 'portfolio_update', 10, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many update attempts' }, 429);
  }

  try {
    const { id } = params;
    
    if (!validateUUID(id)) {
      return createSecureResponse({ error: 'Invalid portfolio item ID' }, 400);
    }

    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const existingItemResult = await DatabaseService.query(
      'SELECT designer_id FROM portfolio_items WHERE id = $1',
      [id]
    );

    if (existingItemResult.rows.length === 0) {
      return createSecureResponse({ error: 'Portfolio item not found' }, 404);
    }

    const existingItem = existingItemResult.rows[0];
    if (existingItem.designer_id !== user.id) {
      return createSecureResponse({ error: 'You can only edit your own portfolio items' }, 403);
    }

    const body = await request.json();

    if (Object.keys(body).length === 1 && 'isPublic' in body) {
      const updateQuery = `
        UPDATE portfolio_items 
        SET is_public = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, title, description, category, tags, images,
                  project_date, client_name, is_public, created_at, updated_at
      `;

      const result = await DatabaseService.query(updateQuery, [body.isPublic, id], {
        monitoring: {
          name: 'update_portfolio_visibility',
          metadata: { portfolioItemId: id, isPublic: body.isPublic }
        }
      });

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
        message: 'Portfolio item visibility updated successfully'
      });
    }

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

    const updateQuery = `
      UPDATE portfolio_items 
      SET title = $1, description = $2, category = $3, tags = $4, images = $5,
          project_date = $6, client_name = $7, is_public = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING id, title, description, category, tags, images,
                project_date, client_name, is_public, created_at, updated_at
    `;

    const result = await DatabaseService.query(
      updateQuery,
      [
        title,
        description || null,
        category,
        tags || null,
        JSON.stringify(images),
        projectDate || null,
        clientName || null,
        isPublic,
        id
      ],
      {
        monitoring: {
          name: 'update_portfolio_item',
          metadata: { portfolioItemId: id, userId: user.id }
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
      message: 'Portfolio item updated successfully'
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitResult = await rateLimitMiddleware(request, 'portfolio_delete', 5, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many delete attempts' }, 429);
  }

  try {
    const { id } = params;
    
    if (!validateUUID(id)) {
      return createSecureResponse({ error: 'Invalid portfolio item ID' }, 400);
    }

    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const existingItemResult = await DatabaseService.query(
      'SELECT designer_id, images FROM portfolio_items WHERE id = $1',
      [id]
    );

    if (existingItemResult.rows.length === 0) {
      return createSecureResponse({ error: 'Portfolio item not found' }, 404);
    }

    const existingItem = existingItemResult.rows[0];
    if (existingItem.designer_id !== user.id) {
      return createSecureResponse({ error: 'You can only delete your own portfolio items' }, 403);
    }

    await DatabaseService.query('DELETE FROM portfolio_items WHERE id = $1', [id], {
      monitoring: {
        name: 'delete_portfolio_item',
        metadata: { portfolioItemId: id, userId: user.id }
      }
    });

    return createSecureResponse({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}