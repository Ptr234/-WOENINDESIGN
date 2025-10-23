import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/connection';
import { APIResponse } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  try {
    const designerId = params.id;

    // Get designer profile with user data
    const designerQuery = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture, u.is_verified, u.created_at, u.updated_at,
        dp.specialty, dp.years_of_experience, dp.biography, dp.location, dp.hourly_rate, dp.availability,
        dp.skills, dp.education, dp.certifications, dp.website, dp.instagram, dp.linkedin, dp.behance, dp.dribbble,
        dp.average_rating, dp.total_projects
      FROM users u 
      JOIN designer_profiles dp ON u.id = dp.id 
      WHERE u.id = $1 AND u.is_active = true AND u.role = 'designer'
    `;

    const designerResult = await query(designerQuery, [designerId]);

    if (designerResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Designer not found',
        } as APIResponse,
        { status: 404 }
      );
    }

    const row = designerResult.rows[0];

    // Get portfolio items
    const portfolioQuery = `
      SELECT id, title, description, images, project_type, completed_at, client_name, featured, created_at, updated_at
      FROM portfolio_items 
      WHERE designer_id = $1 
      ORDER BY featured DESC, created_at DESC
    `;
    const portfolioResult = await query(portfolioQuery, [designerId]);

    // Get reviews
    const reviewsQuery = `
      SELECT id, client_name, rating, comment, created_at
      FROM reviews 
      WHERE designer_id = $1 
      ORDER BY created_at DESC
      LIMIT 20
    `;
    const reviewsResult = await query(reviewsQuery, [designerId]);

    const designer = {
      id: row.id,
      email: row.email,
      role: 'designer' as const,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      profilePicture: row.profile_picture,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      specialty: row.specialty,
      yearsOfExperience: row.years_of_experience,
      biography: row.biography,
      location: row.location,
      hourlyRate: row.hourly_rate,
      availability: row.availability,
      skills: row.skills,
      education: row.education,
      certifications: row.certifications,
      website: row.website,
      averageRating: parseFloat(row.average_rating),
      totalProjects: row.total_projects,
      isVerified: row.is_verified,
      portfolio: portfolioResult.rows.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        images: p.images,
        projectType: p.project_type,
        completedAt: p.completed_at,
        clientName: p.client_name,
        featured: p.featured,
      })),
      reviews: reviewsResult.rows.map((r: any) => ({
        id: r.id,
        clientId: '', // Not exposed for privacy
        clientName: r.client_name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
      })),
      socialMedia: {
        instagram: row.instagram,
        linkedin: row.linkedin,
        behance: row.behance,
        dribbble: row.dribbble,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: designer,
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get designer error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}