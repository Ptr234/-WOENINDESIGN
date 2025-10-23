import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { validateRequest, userUpdateSchema } from '@/lib/security/validation';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'profile', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    return createSecureResponse({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'profile', 10, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    
    const validation = validateRequest(userUpdateSchema)(body);
    if (!validation.success) {
      return createSecureResponse({ 
        error: 'Invalid input data',
        details: validation.error.errors 
      }, 400);
    }

    const { firstName, lastName, email, phone } = validation.data;

    if (email && email !== user.email) {
      const existingUser = await DatabaseService.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), user.id]
      );

      if (existingUser.rows.length > 0) {
        return createSecureResponse({ 
          error: 'Email already in use' 
        }, 400);
      }
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      updateValues.push(firstName);
    }
    
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      updateValues.push(lastName);
    }
    
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email.toLowerCase());
    }
    
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone || null);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(user.id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, role, first_name, last_name, phone, profile_picture, created_at, updated_at
    `;

    const result = await DatabaseService.query(updateQuery, updateValues, {
      monitoring: {
        name: 'update_user_profile',
        metadata: { userId: user.id }
      }
    });

    if (result.rows.length === 0) {
      return createSecureResponse({ error: 'User not found' }, 404);
    }

    const updatedUser = result.rows[0];
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phone: updatedUser.phone,
      profilePicture: updatedUser.profile_picture,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    };

    return createSecureResponse({ 
      success: true, 
      data: userResponse,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}