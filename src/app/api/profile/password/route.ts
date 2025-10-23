import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { DatabaseService } from '@/lib/database';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';
import { validateRequest, passwordChangeSchema } from '@/lib/security/validation';

export async function PATCH(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'password_change', 5, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many password change attempts' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    
    const validation = validateRequest(passwordChangeSchema)(body);
    if (!validation.success) {
      return createSecureResponse({ 
        error: 'Invalid input data',
        details: validation.error.errors 
      }, 400);
    }

    const { currentPassword, newPassword } = validation.data;

    if (currentPassword === newPassword) {
      return createSecureResponse({ 
        error: 'New password must be different from current password' 
      }, 400);
    }

    const userResult = await DatabaseService.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id],
      {
        monitoring: {
          name: 'get_user_password_hash',
          metadata: { userId: user.id }
        }
      }
    );

    if (userResult.rows.length === 0) {
      return createSecureResponse({ error: 'User not found' }, 404);
    }

    const currentPasswordHash = userResult.rows[0].password_hash;
    const isCurrentPasswordValid = await AuthService.verifyPassword(currentPassword, currentPasswordHash);

    if (!isCurrentPasswordValid) {
      return createSecureResponse({ 
        error: 'Current password is incorrect' 
      }, 400);
    }

    const passwordValidation = AuthService.isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return createSecureResponse({ 
        error: 'New password does not meet requirements',
        details: passwordValidation.errors 
      }, 400);
    }

    const newPasswordHash = await AuthService.hashPassword(newPassword);

    await DatabaseService.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, user.id],
      {
        monitoring: {
          name: 'update_user_password',
          metadata: { userId: user.id }
        }
      }
    );

    return createSecureResponse({ 
      success: true,
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}