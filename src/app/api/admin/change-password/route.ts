import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'admin_password_change', 3, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many password change attempts' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Admin access control
    if (user.email !== 'admin@womenindesignuganda.com') {
      return createSecureResponse({ error: 'Admin access required' }, 403);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return createSecureResponse({ 
        error: 'Current password and new password are required' 
      }, 400);
    }

    // Validate new password strength
    const passwordValidation = AuthService.isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return createSecureResponse({ 
        error: 'Password does not meet requirements',
        errors: passwordValidation.errors 
      }, 400);
    }

    // Get current password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id]
    );

    if (userResult.rows.length === 0) {
      return createSecureResponse({ error: 'User not found' }, 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await AuthService.verifyPassword(
      currentPassword, 
      userResult.rows[0].password_hash
    );

    if (!isCurrentPasswordValid) {
      return createSecureResponse({ error: 'Current password is incorrect' }, 400);
    }

    // Hash new password
    const newPasswordHash = await AuthService.hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, user.id]
    );

    // Log password change
    console.log(`Admin password changed for user: ${user.email}`);

    return createSecureResponse({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing admin password:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}