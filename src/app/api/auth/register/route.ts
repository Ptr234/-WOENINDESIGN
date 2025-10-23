import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { APIResponse } from '@/types';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['designer', 'client', 'supplier'], {
    errorMap: () => ({ message: 'Role must be designer, client, or supplier' }),
  }),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
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

    const { email, password, firstName, lastName, role, phone } = validation.data;

    // Additional password validation
    const passwordValidation = AuthService.isValidPassword(password);
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

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        } as APIResponse,
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user
    const userResult = await query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role, first_name, last_name, phone, created_at, updated_at`,
      [email.toLowerCase(), hashedPassword, role, firstName, lastName, phone]
    );

    const user = userResult.rows[0];

    // Create role-specific profile if needed
    if (role === 'designer') {
      await query(
        `INSERT INTO designer_profiles (id, specialty, years_of_experience, biography, location)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, [], 0, '', '']
      );
    } else if (role === 'supplier') {
      await query(
        `INSERT INTO supplier_profiles (id, business_name, business_description, category, location, business_phone, business_email, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, '', '', [], '', phone || '', email.toLowerCase(), '']
      );
    }

    // Log welcome email (email functionality removed)
    console.log(`Welcome email would be sent to: ${email.toLowerCase()} for ${firstName}`);

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const responseUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          user: responseUser,
          token,
        },
        message: 'User registered successfully',
      } as APIResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}