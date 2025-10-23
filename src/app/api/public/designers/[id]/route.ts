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

    // Get detailed designer profile
    const designerQuery = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as name,
        dp.specialty,
        dp.location,
        dp.years_of_experience,
        dp.biography,
        u.profile_picture,
        u.is_verified,
        u.email,
        u.phone,
        COALESCE(
          (SELECT AVG(rating) FROM project_reviews WHERE designer_id = u.id),
          4.5
        ) as rating,
        COALESCE(
          (SELECT COUNT(*) FROM hiring_requests WHERE designer_id = u.id AND status = 'completed'),
          0
        ) as completed_projects
      FROM users u 
      JOIN designer_profiles dp ON u.id = dp.user_id 
      WHERE u.id = $1 AND u.is_active = true AND u.role = 'designer'
    `;
    
    const result = await query(designerQuery, [id]);

    if (result.rows.length === 0) {
      return createSecureResponse({ 
        success: false, 
        error: 'Designer not found' 
      }, 404);
    }

    const row = result.rows[0];
    
    // Get portfolio/work samples (you can add a portfolio table later)
    const portfolio = [
      {
        id: '1',
        title: 'Modern Living Space',
        category: 'Residential',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '2', 
        title: 'Corporate Office Design',
        category: 'Commercial',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      },
      {
        id: '3',
        title: 'Boutique Hotel Lobby',
        category: 'Hospitality',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
      }
    ];

    const services = [
      'Interior Design',
      'Space Planning', 
      'Color Consultation',
      'Furniture Selection',
      'Lighting Design',
      'Project Management'
    ];

    const designer = {
      id: row.id,
      name: row.name,
      specialty: Array.isArray(row.specialty) ? row.specialty.join(' & ') : (row.specialty || 'Interior Design'),
      location: row.location || 'Uganda',
      rating: parseFloat(row.rating || '4.5'),
      completedProjects: parseInt(row.completed_projects || '0'),
      experience: parseInt(row.years_of_experience || '1'),
      bio: row.biography || 'Passionate designer creating beautiful, functional spaces.',
      services: services,
      portfolio: portfolio,
      profileImage: row.profile_picture,
      isVerified: row.is_verified || false
    };

    return createSecureResponse({
      success: true,
      data: designer
    });
  } catch (error) {
    console.error('Error fetching designer profile:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}