import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import CloudinaryService from '@/lib/cloudinary';
import { APIResponse } from '@/types';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_UPLOAD || '10');

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
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string;
    const publicIdPrefix = formData.get('publicIdPrefix') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No files provided',
        } as APIResponse,
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          success: false,
          error: `Maximum ${MAX_FILES} files allowed per upload`,
        } as APIResponse,
        { status: 400 }
      );
    }

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Only image files are allowed',
          } as APIResponse,
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          } as APIResponse,
          { status: 400 }
        );
      }
    }

    // Convert files to buffers
    const fileBuffers = await Promise.all(
      files.map(async (file) => Buffer.from(await file.arrayBuffer()))
    );

    // Upload to Cloudinary
    const results = await CloudinaryService.uploadMultipleImages(fileBuffers, {
      folder: folder || 'designer-portal/general',
      public_id: publicIdPrefix,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          urls: results.map(r => r.secure_url),
          publicIds: results.map(r => r.public_id),
        },
        message: `${results.length} images uploaded successfully`,
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Multiple images upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload images',
      } as APIResponse,
      { status: 500 }
    );
  }
}