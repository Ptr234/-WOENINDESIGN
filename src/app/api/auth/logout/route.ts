import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/types';

export async function POST(_request: NextRequest) {
  try {
    // Since we're using JWT tokens, logout is handled client-side by removing the token
    // This endpoint exists for consistency and could be used for additional cleanup
    // such as blacklisting tokens in the future
    
    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}