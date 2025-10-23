import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { APIResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
        } as APIResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { user },
        message: 'Token is valid',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
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
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token is required',
        } as APIResponse,
        { status: 400 }
      );
    }

    const user = await AuthService.getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
        } as APIResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { user },
        message: 'Token is valid',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}