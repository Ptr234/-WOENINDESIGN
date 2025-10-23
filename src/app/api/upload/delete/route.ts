import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import AuthService from '@/lib/auth';
import CloudinaryService from '@/lib/cloudinary';
import { APIResponse } from '@/types';

const deleteImageSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        } as APIResponse,
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = deleteImageSchema.safeParse(body);
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

    const { publicId } = validation.data;

    // Delete from Cloudinary
    const success = await CloudinaryService.deleteImage(publicId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete image',
        } as APIResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Image deleted successfully',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete image',
      } as APIResponse,
      { status: 500 }
    );
  }
}