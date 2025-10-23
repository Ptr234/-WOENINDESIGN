import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { APIResponse } from '@/types';

const createDesignerSchema = z.object({
  specialty: z.array(z.string()).min(1, 'At least one specialty is required'),
  yearsOfExperience: z.number().min(0, 'Years of experience must be non-negative'),
  biography: z.string().optional(),
  location: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  website: z.string().url().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  behance: z.string().optional(),
  dribbble: z.string().optional(),
});

export async function GET(request: NextRequest) {
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Parse filters
    const specialty = searchParams.getAll('specialty');
    const location = searchParams.get('location');
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const availability = searchParams.get('availability');
    const minExperience = searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')!) : undefined;
    const maxExperience = searchParams.get('maxExperience') ? parseInt(searchParams.get('maxExperience')!) : undefined;
    const minRate = searchParams.get('minRate') ? parseFloat(searchParams.get('minRate')!) : undefined;
    const maxRate = searchParams.get('maxRate') ? parseFloat(searchParams.get('maxRate')!) : undefined;

    // Build WHERE clause
    const whereConditions = ['u.is_active = true', 'u.role = $1'];
    const queryParams: (string | number | string[])[] = ['designer'];
    let paramIndex = 2;

    if (specialty.length > 0) {
      whereConditions.push(`dp.specialty && $${paramIndex}`);
      queryParams.push(specialty);
      paramIndex++;
    }

    if (location) {
      whereConditions.push(`LOWER(dp.location) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (minRating !== undefined) {
      whereConditions.push(`dp.average_rating >= $${paramIndex}`);
      queryParams.push(minRating);
      paramIndex++;
    }

    if (availability) {
      whereConditions.push(`dp.availability = $${paramIndex}`);
      queryParams.push(availability);
      paramIndex++;
    }

    if (minExperience !== undefined) {
      whereConditions.push(`dp.years_of_experience >= $${paramIndex}`);
      queryParams.push(minExperience);
      paramIndex++;
    }

    if (maxExperience !== undefined) {
      whereConditions.push(`dp.years_of_experience <= $${paramIndex}`);
      queryParams.push(maxExperience);
      paramIndex++;
    }

    if (minRate !== undefined) {
      whereConditions.push(`dp.hourly_rate >= $${paramIndex}`);
      queryParams.push(minRate);
      paramIndex++;
    }

    if (maxRate !== undefined) {
      whereConditions.push(`dp.hourly_rate <= $${paramIndex}`);
      queryParams.push(maxRate);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM users u 
      JOIN designer_profiles dp ON u.id = dp.id 
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, u.profile_picture, u.is_verified, u.created_at, u.updated_at,
        dp.specialty, dp.years_of_experience, dp.biography, dp.location, dp.hourly_rate, dp.availability,
        dp.skills, dp.education, dp.certifications, dp.website, dp.instagram, dp.linkedin, dp.behance, dp.dribbble,
        dp.average_rating, dp.total_projects
      FROM users u 
      JOIN designer_profiles dp ON u.id = dp.id 
      WHERE ${whereClause}
      ORDER BY ${sortBy === 'average_rating' ? 'dp.average_rating' : sortBy === 'experience' ? 'dp.years_of_experience' : 'u.' + sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const dataResult = await query(dataQuery, queryParams);

    const designers = await Promise.all(
      dataResult.rows.map(async (row: any) => {
        // Check if current user has contact access to this designer
        let hasContactAccess = false;
        if (currentUser && currentUser.role === 'client') {
          const accessResult = await query(
            'SELECT id FROM contact_access WHERE client_id = $1 AND professional_id = $2',
            [currentUser.id, row.id]
          );
          hasContactAccess = accessResult.rows.length > 0;
        }

        // Get limited portfolio preview (3 images max)
        const portfolioPreview = await query(
          'SELECT id, title, images FROM portfolio_items WHERE designer_id = $1 ORDER BY created_at DESC LIMIT 3',
          [row.id]
        );

        const portfolioImages = portfolioPreview.rows.map(item => ({
          id: item.id,
          title: item.title,
          thumbnail: item.images ? (Array.isArray(item.images) ? item.images[0] : item.images.split(',')[0]) : null
        }));

        // Public information (always visible)
        const publicInfo = {
          id: row.id,
          role: 'designer' as const,
          firstName: row.first_name,
          lastName: row.last_name,
          profilePicture: row.profile_picture,
          specialty: row.specialty,
          yearsOfExperience: row.years_of_experience,
          biography: row.biography,
          location: row.location,
          hourlyRate: row.hourly_rate,
          availability: row.availability,
          averageRating: parseFloat(row.average_rating || '0'),
          totalProjects: row.total_projects || 0,
          isVerified: row.is_verified,
          portfolioPreview: portfolioImages,
          hasContactAccess,
          contactFeeRequired: !hasContactAccess
        };

        // Protected information (only visible after contact fee payment)
        if (hasContactAccess) {
          return {
            ...publicInfo,
            email: row.email,
            phone: row.phone,
            website: row.website,
            socialMedia: {
              instagram: row.instagram,
              linkedin: row.linkedin,
              behance: row.behance,
              dribbble: row.dribbble,
            },
            skills: row.skills,
            education: row.education,
            certifications: row.certifications,
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

    return NextResponse.json(
      {
        success: true,
        data: {
          items: designers,
          total,
          page,
          totalPages,
          hasNext,
          hasPrev,
        },
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Get designers error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await AuthService.authenticateRequest(request);
    if (!user || user.role !== 'designer') {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required or insufficient permissions',
        } as APIResponse,
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = createDesignerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.error.flatten().fieldErrors,
        } as APIResponse,
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update designer profile
    const updateQuery = `
      UPDATE designer_profiles 
      SET 
        specialty = $1, 
        years_of_experience = $2, 
        biography = $3, 
        location = $4, 
        hourly_rate = $5,
        skills = $6,
        education = $7,
        certifications = $8,
        website = $9,
        instagram = $10,
        linkedin = $11,
        behance = $12,
        dribbble = $13,
        updated_at = NOW()
      WHERE id = $14
      RETURNING *
    `;

    const result = await query(updateQuery, [
      data.specialty,
      data.yearsOfExperience,
      data.biography || '',
      data.location || '',
      data.hourlyRate,
      data.skills || [],
      data.education || [],
      data.certifications || [],
      data.website,
      data.instagram,
      data.linkedin,
      data.behance,
      data.dribbble,
      user.id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Designer profile not found',
        } as APIResponse,
        { status: 404 }
      );
    }

    // Get updated user data
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [user.id]
    );

    const updatedUser = userResult.rows[0];
    const updatedProfile = result.rows[0];

    const designer = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: 'designer' as const,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phone: updatedUser.phone,
      profilePicture: updatedUser.profile_picture,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
      specialty: updatedProfile.specialty,
      yearsOfExperience: updatedProfile.years_of_experience,
      biography: updatedProfile.biography,
      location: updatedProfile.location,
      hourlyRate: updatedProfile.hourly_rate,
      availability: updatedProfile.availability,
      skills: updatedProfile.skills,
      education: updatedProfile.education,
      certifications: updatedProfile.certifications,
      website: updatedProfile.website,
      averageRating: parseFloat(updatedProfile.average_rating),
      totalProjects: updatedProfile.total_projects,
      isVerified: updatedUser.is_verified,
      portfolio: [],
      reviews: [],
      socialMedia: {
        instagram: updatedProfile.instagram,
        linkedin: updatedProfile.linkedin,
        behance: updatedProfile.behance,
        dribbble: updatedProfile.dribbble,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: designer,
        message: 'Designer profile updated successfully',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Create/update designer error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}