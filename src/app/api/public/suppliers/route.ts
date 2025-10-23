import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'public', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const searchQuery = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build WHERE clause
    const whereConditions = ['u.is_active = true', 'u.role = $1'];
    const queryParams: any[] = ['supplier'];
    let paramIndex = 2;

    if (category) {
      whereConditions.push(`$${paramIndex} = ANY(sp.category)`);
      queryParams.push(category);
      paramIndex++;
    }

    if (location) {
      whereConditions.push(`LOWER(sp.location) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (searchQuery) {
      whereConditions.push(`(
        LOWER(sp.business_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(sp.business_description) LIKE LOWER($${paramIndex + 1})
      )`);
      const searchTerm = `%${searchQuery}%`;
      queryParams.push(searchTerm, searchTerm);
      paramIndex += 2;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get public supplier data
    const suppliersQuery = `
      SELECT 
        u.id,
        sp.business_name,
        sp.category,
        sp.location,
        sp.business_description,
        sp.delivery_areas,
        sp.minimum_order,
        sp.payment_methods,
        sp.business_hours,
        u.is_verified,
        COALESCE(
          (SELECT AVG(rating) FROM supplier_reviews WHERE supplier_id = u.id),
          4.5
        ) as rating,
        COALESCE(
          (SELECT COUNT(*) FROM products WHERE supplier_id = sp.id),
          0
        ) as product_count,
        ARRAY['Quality Materials', 'Professional Service', 'Timely Delivery'] as sample_products
      FROM users u 
      JOIN supplier_profiles sp ON u.id = sp.id 
      WHERE ${whereClause}
      ORDER BY 
        rating DESC,
        product_count DESC,
        RANDOM()
      LIMIT $${paramIndex}
    `;
    
    queryParams.push(limit);
    const result = await query(suppliersQuery, queryParams);

    const suppliers = result.rows.map(row => ({
      id: row.id,
      businessName: row.business_name,
      category: row.category || ['General Supplies'],
      location: row.location || 'Uganda',
      rating: parseFloat(row.rating || '4.5'),
      businessDescription: row.business_description || 'Quality supplies for your design projects.',
      deliveryAreas: row.delivery_areas || [],
      minimumOrder: parseFloat(row.minimum_order || '0'),
      paymentMethods: row.payment_methods || [],
      businessHours: row.business_hours || 'Mon-Fri 8AM-6PM',
      isVerified: row.is_verified,
      productCount: parseInt(row.product_count || '0'),
      sampleProducts: row.sample_products || []
    }));

    return createSecureResponse({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching public suppliers:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}