import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import AuthService from '@/lib/auth';
import { APIResponse } from '@/types';

const confirmResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = confirmResetSchema.safeParse(body);
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

    const { token, newPassword } = validation.data;

    // Additional password validation
    const passwordValidation = AuthService.isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password does not meet requirements',
          errors: { password: passwordValidation.errors },
        } as APIResponse,
        { status: 400 }
      );
    }

    // Reset password
    const success = await AuthService.resetPassword(token, newPassword);
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
        } as APIResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Password confirmation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}