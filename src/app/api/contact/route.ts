import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { APIResponse } from '@/types';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = contactSchema.safeParse(body);
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

    const { name, email, subject, message } = validation.data;

    // Log contact form submission (email functionality removed)
    console.log('Contact form submission:', { name, email, subject, message });

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
      } as APIResponse,
      { status: 500 }
    );
  }
}