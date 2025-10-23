import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'suppliers', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    // Check if user is authenticated (optional for public browsing)
    let currentUser = null;
    try {
      currentUser = await AuthService.authenticateRequest(request);
    } catch (error) {
      // Public access allowed
    }
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Parse filters
    const categoryParam = searchParams.get('category');
    const category = categoryParam ? categoryParam.split(',') : [];
    const location = searchParams.get('location');
    const deliveryArea = searchParams.get('deliveryArea');
    const hasProducts = searchParams.get('hasProducts');
    const searchQuery = searchParams.get('q');

    // Build WHERE clause
    const whereConditions = ['u.is_active = true', 'u.role = $1'];
    const queryParams: any[] = ['supplier'];
    let paramIndex = 2;

    if (category.length > 0) {
      whereConditions.push(`sp.category && $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (location) {
      whereConditions.push(`LOWER(sp.location) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (deliveryArea) {
      whereConditions.push(`$${paramIndex} = ANY(sp.delivery_areas)`);
      queryParams.push(deliveryArea);
      paramIndex++;
    }

    if (searchQuery) {
      whereConditions.push(`(
        LOWER(sp.business_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(sp.business_description) LIKE LOWER($${paramIndex + 1}) OR
        LOWER(u.first_name || ' ' || u.last_name) LIKE LOWER($${paramIndex + 2})
      )`);
      const searchTerm = `%${searchQuery}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
      paramIndex += 3;
    }

    if (hasProducts === 'true') {
      whereConditions.push(`EXISTS (SELECT 1 FROM products WHERE supplier_id = sp.id)`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM users u 
      JOIN supplier_profiles sp ON u.id = sp.id 
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture, u.is_verified, u.created_at, u.updated_at,
        sp.business_name, sp.business_description, sp.category, sp.location, sp.business_phone, sp.business_email,
        sp.address, sp.website, sp.business_hours, sp.delivery_areas, sp.minimum_order, sp.payment_methods,
        (SELECT COUNT(*) FROM products WHERE supplier_id = sp.id) as product_count
      FROM users u 
      JOIN supplier_profiles sp ON u.id = sp.id 
      WHERE ${whereClause}
      ORDER BY ${sortBy === 'business_name' ? 'sp.business_name' : 'u.' + sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const dataResult = await query(dataQuery, queryParams);

    const suppliers = await Promise.all(
      dataResult.rows.map(async (row: any) => {
        // Check if current user has contact access to this supplier
        let hasContactAccess = false;
        if (currentUser && currentUser.role === 'client') {
          const accessResult = await query(
            'SELECT id FROM contact_access WHERE client_id = $1 AND professional_id = $2',
            [currentUser.id, row.id]
          );
          hasContactAccess = accessResult.rows.length > 0;
        }

        // Public information (always visible)
        const publicInfo = {
          id: row.id,
          role: 'supplier' as const,
          firstName: row.first_name,
          lastName: row.last_name,
          profilePicture: row.profile_picture,
          businessName: row.business_name,
          businessDescription: row.business_description,
          category: row.category,
          location: row.location,
          businessHours: row.business_hours,
          deliveryAreas: row.delivery_areas,
          minimumOrder: row.minimum_order,
          paymentMethods: row.payment_methods,
          isVerified: row.is_verified,
          productCount: parseInt(row.product_count) || 0,
          hasContactAccess,
          contactFeeRequired: !hasContactAccess
        };

        // Protected information (only visible after contact fee payment)
        if (hasContactAccess) {
          return {
            ...publicInfo,
            email: row.email,
            phone: row.phone,
            contactInfo: {
              businessPhone: row.business_phone,
              businessEmail: row.business_email,
              address: row.address,
              website: row.website,
            },
            showContactInfo: true
          };
        }

        // Return only public information
        return {
          ...publicInfo,
          showContactInfo: false
        };
      })
    );

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return createSecureResponse({
      success: true,
      data: {
        suppliers,
        pagination: {
          total,
          page,
          totalPages,
          hasNext,
          hasPrev,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}