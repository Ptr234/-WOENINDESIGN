import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'dashboard', 60, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'client') {
      return createSecureResponse({ error: 'Access denied' }, 403);
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '8');
    const type = url.searchParams.get('type'); // 'designer' or 'supplier'

    // Get client's previous project preferences for better recommendations
    const clientPreferencesQuery = `
      SELECT 
        design_specialty,
        COUNT(*) as frequency
      FROM hiring_requests 
      WHERE client_id = $1 AND design_specialty IS NOT NULL
      GROUP BY design_specialty
      ORDER BY frequency DESC
      LIMIT 3
    `;
    const preferencesResult = await query(clientPreferencesQuery, [user.id]);
    const preferredSpecialties = preferencesResult.rows.map(row => row.design_specialty);

    let recommendations: any[] = [];

    // Get designer recommendations
    if (!type || type === 'designer') {
      const designersQuery = `
        SELECT 
          u.id,
          u.first_name || ' ' || u.last_name as name,
          'designer' as type,
          dp.specialty,
          dp.hourly_rate,
          dp.location,
          dp.availability_status as is_available,
          COALESCE(
            (SELECT AVG(rating) FROM project_reviews WHERE designer_id = u.id),
            4.5
          ) as rating,
          COALESCE(
            (SELECT COUNT(*) FROM hiring_requests WHERE designer_id = u.id AND status = 'completed'),
            0
          ) as completed_projects,
          CASE 
            WHEN dp.specialty = ANY($2) THEN 1
            ELSE 0
          END as specialty_match
        FROM users u
        JOIN designer_profiles dp ON u.id = dp.user_id
        WHERE u.role = 'designer' 
        AND dp.verification_status = 'verified'
        AND u.id NOT IN (
          SELECT designer_id FROM hiring_requests 
          WHERE client_id = $1 AND designer_id IS NOT NULL
        )
        ORDER BY 
          specialty_match DESC,
          rating DESC,
          completed_projects DESC,
          RANDOM()
        LIMIT $3
      `;
      
      const designersResult = await query(designersQuery, [
        user.id,
        preferredSpecialties.length > 0 ? preferredSpecialties : ['general'],
        Math.ceil(limit / 2)
      ]);

      recommendations = recommendations.concat(
        designersResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type,
          specialty: row.specialty || 'General Design',
          rating: parseFloat(row.rating || '4.5'),
          hourlyRate: parseFloat(row.hourly_rate || '0'),
          location: row.location || 'Uganda',
          profileImage: '', // Will be handled by frontend with initials
          isAvailable: row.is_available === 'available',
          completedProjects: parseInt(row.completed_projects || '0')
        }))
      );
    }

    // Get supplier recommendations
    if (!type || type === 'supplier') {
      const suppliersQuery = `
        SELECT 
          u.id,
          u.first_name || ' ' || u.last_name as name,
          'supplier' as type,
          sp.business_type as specialty,
          sp.location,
          sp.business_status as is_available,
          COALESCE(
            (SELECT AVG(rating) FROM supplier_reviews WHERE supplier_id = u.id),
            4.5
          ) as rating,
          COALESCE(
            (SELECT COUNT(DISTINCT client_id) FROM supplier_orders WHERE supplier_id = u.id AND status = 'completed'),
            0
          ) as completed_projects
        FROM users u
        JOIN supplier_profiles sp ON u.id = sp.user_id
        WHERE u.role = 'supplier' 
        AND sp.verification_status = 'verified'
        AND u.id NOT IN (
          SELECT supplier_id FROM supplier_orders 
          WHERE client_id = $1 AND supplier_id IS NOT NULL
        )
        ORDER BY 
          rating DESC,
          completed_projects DESC,
          RANDOM()
        LIMIT $2
      `;
      
      const suppliersResult = await query(suppliersQuery, [
        user.id,
        Math.floor(limit / 2)
      ]);

      recommendations = recommendations.concat(
        suppliersResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type,
          specialty: row.specialty || 'Design Supplies',
          rating: parseFloat(row.rating || '4.5'),
          hourlyRate: null,
          location: row.location || 'Uganda',
          profileImage: '', // Will be handled by frontend with initials
          isAvailable: row.is_available === 'active',
          completedProjects: parseInt(row.completed_projects || '0')
        }))
      );
    }

    // Shuffle and limit final results
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    const limitedRecommendations = shuffled.slice(0, limit);

    return createSecureResponse({
      success: true,
      data: limitedRecommendations
    });
  } catch (error) {
    console.error('Error fetching client recommendations:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}