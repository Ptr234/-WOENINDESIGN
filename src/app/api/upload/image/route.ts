import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import CloudinaryService from '@/lib/cloudinary';
import { APIResponse } from '@/types';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const publicId = formData.get('publicId') as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        } as APIResponse,
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only image files are allowed',
        } as APIResponse,
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        } as APIResponse,
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await CloudinaryService.uploadImage(buffer, {
      folder: folder || 'designer-portal/general',
      public_id: publicId,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
        message: 'Image uploaded successfully',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
      } as APIResponse,
      { status: 500 }
    );
  }
}