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
    // Fetch featured designers for public display
    const featuredDesignersQuery = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as name,
        dp.specialty,
        dp.location,
        COALESCE(
          (SELECT AVG(rating) FROM project_reviews WHERE designer_id = u.id),
          4.5
        ) as rating,
        COALESCE(
          (SELECT COUNT(*) FROM hiring_requests WHERE designer_id = u.id AND status = 'completed'),
          0
        ) as completed_projects,
        u.profile_picture,
        'Sample Interior Design' as sample_work
      FROM users u
      JOIN designer_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'designer' 
      AND u.is_active = true
      AND dp.verification_status = 'verified'
      ORDER BY 
        rating DESC,
        completed_projects DESC,
        RANDOM()
      LIMIT 12
    `;

    const result = await query(featuredDesignersQuery);

    const featuredDesigners = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      specialty: row.specialty || 'General Design',
      location: row.location || 'Uganda',
      rating: parseFloat(row.rating || '4.5'),
      completedProjects: parseInt(row.completed_projects || '0'),
      profileImage: row.profile_picture,
      sampleWork: row.sample_work
    }));

    return createSecureResponse({
      success: true,
      data: featuredDesigners
    });
  } catch (error) {
    console.error('Error fetching featured designers:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}