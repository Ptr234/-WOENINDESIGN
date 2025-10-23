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
    const specialty = searchParams.get('specialty');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build WHERE clause
    const whereConditions = ['u.is_active = true', 'u.role = $1'];
    const queryParams: any[] = ['designer'];
    let paramIndex = 2;

    if (specialty) {
      whereConditions.push(`$${paramIndex} = ANY(dp.specialty)`);
      queryParams.push(specialty);
      paramIndex++;
    }

    if (location) {
      whereConditions.push(`LOWER(dp.location) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        LOWER(u.first_name || ' ' || u.last_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(dp.biography) LIKE LOWER($${paramIndex + 1})
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
      paramIndex += 2;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get public designer data
    const designersQuery = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as name,
        dp.specialty,
        dp.location,
        dp.years_of_experience,
        u.profile_picture,
        u.is_verified,
        COALESCE(
          (SELECT AVG(rating) FROM project_reviews WHERE designer_id = u.id),
          4.5
        ) as rating,
        COALESCE(
          (SELECT COUNT(*) FROM hiring_requests WHERE designer_id = u.id AND status = 'completed'),
          0
        ) as completed_projects,
        SUBSTRING(dp.biography, 1, 150) as biography,
        'Featured Design Work' as sample_work_title,
        'Beautiful interior design showcasing creativity and skill' as sample_work_description
      FROM users u 
      JOIN designer_profiles dp ON u.id = dp.user_id 
      WHERE ${whereClause}
      ORDER BY 
        rating DESC,
        completed_projects DESC,
        RANDOM()
      LIMIT $${paramIndex}
    `;
    
    queryParams.push(limit);
    const result = await query(designersQuery, queryParams);

    const designers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      specialty: row.specialty || ['General Design'],
      location: row.location || 'Uganda',
      rating: parseFloat(row.rating || '4.5'),
      completedProjects: parseInt(row.completed_projects || '0'),
      yearsOfExperience: parseInt(row.years_of_experience || '1'),
      profileImage: row.profile_picture,
      isVerified: row.is_verified,
      biography: row.biography || 'Passionate designer creating beautiful spaces.',
      sampleWorkTitle: row.sample_work_title,
      sampleWorkDescription: row.sample_work_description
    }));

    return createSecureResponse({
      success: true,
      data: designers
    });
  } catch (error) {
    console.error('Error fetching public designers:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}