import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rateLimitResult = await rateLimitMiddleware(request, 'public', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const { id } = params;

    // Get detailed supplier profile
    const supplierQuery = `
      SELECT 
        u.id,
        sp.business_name,
        sp.category,
        sp.location,
        sp.business_description,
        sp.years_in_business,
        u.profile_picture as business_image,
        u.is_verified,
        u.email,
        u.phone,
        COALESCE(
          (SELECT AVG(rating) FROM supplier_reviews WHERE supplier_id = u.id),
          4.5
        ) as rating,
        COALESCE(
          (SELECT COUNT(*) FROM orders WHERE supplier_id = u.id AND status = 'completed'),
          0
        ) as total_orders
      FROM users u 
      JOIN supplier_profiles sp ON u.id = sp.user_id 
      WHERE u.id = $1 AND u.is_active = true AND u.role = 'supplier'
    `;
    
    const result = await query(supplierQuery, [id]);

    if (result.rows.length === 0) {
      return createSecureResponse({ 
        success: false, 
        error: 'Supplier not found' 
      }, 404);
    }

    const row = result.rows[0];
    
    // Mock products (you can add a products table later)
    const products = [
      {
        id: '1',
        name: 'Modern Sofa Set',
        category: 'Furniture',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        price: 'UGX 2,500,000'
      },
      {
        id: '2',
        name: 'Designer Lighting',
        category: 'Lighting',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        price: 'UGX 450,000'
      },
      {
        id: '3',
        name: 'Premium Textiles',
        category: 'Textiles',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        price: 'UGX 180,000'
      }
    ];

    const services = [
      'Custom Furniture',
      'Bulk Supply',
      'Installation Service',
      'Design Consultation',
      'Delivery Service',
      'After-sales Support'
    ];

    const supplier = {
      id: row.id,
      businessName: row.business_name || 'Design Materials Supplier',
      category: Array.isArray(row.category) ? row.category : (row.category ? [row.category] : ['Furniture', 'Decor']),
      location: row.location || 'Uganda',
      rating: parseFloat(row.rating || '4.5'),
      totalOrders: parseInt(row.total_orders || '0'),
      yearsInBusiness: parseInt(row.years_in_business || '1'),
      description: row.business_description || 'Quality supplier of design materials and furniture.',
      services: services,
      products: products,
      businessImage: row.business_image,
      isVerified: row.is_verified || false,
      deliveryAreas: ['Kampala', 'Entebbe', 'Wakiso', 'Mukono'],
      businessHours: 'Mon-Fri 8AM-6PM, Sat 9AM-4PM',
      minimumOrder: 500000,
      paymentMethods: ['Cash', 'Mobile Money', 'Bank Transfer', 'Credit Card']
    };

    return createSecureResponse({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier profile:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}