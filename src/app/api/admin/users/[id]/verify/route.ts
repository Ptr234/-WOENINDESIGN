import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { APIResponse } from '@/types';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  try {
    // Authenticate admin user
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as APIResponse,
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.email !== 'admin@womenindesignuganda.com') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' } as APIResponse,
        { status: 403 }
      );
    }

    const userId = params.id;

    // Verify the user
    const result = await query(
      'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING id, first_name, last_name, email',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as APIResponse,
        { status: 404 }
      );
    }

    const verifiedUser = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: `User ${verifiedUser.first_name} ${verifiedUser.last_name} has been verified`,
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin verify user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as APIResponse,
      { status: 500 }
    );
  }
}