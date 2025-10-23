import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import AuthService from '@/lib/auth';
import { APIResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
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

    const { email, password } = validation.data;

    // Authenticate user
    const user = await AuthService.authenticateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        } as APIResponse,
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          token,
        },
        message: 'Login successful',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}