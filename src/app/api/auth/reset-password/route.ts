import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import AuthService from '@/lib/auth';
import { APIResponse } from '@/types';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
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

    const { email } = validation.data;

    // Generate password reset token
    const token = await AuthService.generatePasswordResetToken(email);
    
    if (!token) {
      // Don't reveal whether the email exists or not for security
      return NextResponse.json(
        {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent',
        } as APIResponse,
        { status: 200 }
      );
    }

    // Log password reset email (email functionality removed)
    console.log(`Password reset email would be sent to: ${email} with token: ${token}`);

    return NextResponse.json(
      {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent',
        // Remove this in production - only for development
        data: process.env.NODE_ENV === 'development' ? { token } : undefined,
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}