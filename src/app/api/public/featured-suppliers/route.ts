import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'public', 20, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    // Fetch featured suppliers for public display
    const featuredSuppliersQuery = `
      SELECT 
        u.id,
        sp.business_name,
        sp.category[1] as primary_category,
        sp.location,
        sp.business_description,
        COALESCE(
          (SELECT AVG(rating) FROM supplier_reviews WHERE supplier_id = u.id),
          4.5
        ) as rating
      FROM users u
      JOIN supplier_profiles sp ON u.id = sp.id
      WHERE u.role = 'supplier' 
      AND u.is_active = true
      AND sp.verification_status = 'verified'
      ORDER BY 
        rating DESC,
        RANDOM()
      LIMIT 12
    `;

    const result = await query(featuredSuppliersQuery);

    const featuredSuppliers = result.rows.map(row => ({
      id: row.id,
      businessName: row.business_name,
      category: row.primary_category || 'Design Supplies',
      location: row.location || 'Uganda',
      rating: parseFloat(row.rating || '4.5'),
      description: row.business_description || 'Quality supplies for your design projects'
    }));

    return createSecureResponse({
      success: true,
      data: featuredSuppliers
    });
  } catch (error) {
    console.error('Error fetching featured suppliers:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}