import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'contact_access', 30, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');

    if (!professionalId) {
      return createSecureResponse({ error: 'Professional ID required' }, 400);
    }

    // Check if client has contact access to this professional
    const accessResult = await query(
      `SELECT 
        ca.access_granted_at,
        ca.professional_type,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM contact_access ca
      JOIN users u ON ca.professional_id = u.id
      WHERE ca.client_id = $1 AND ca.professional_id = $2`,
      [user.id, professionalId]
    );

    if (accessResult.rows.length === 0) {
      return createSecureResponse({
        success: true,
        data: {
          hasAccess: false,
          contactFeeRequired: true,
          contactFeeAmount: 10000,
          currency: 'UGX'
        }
      });
    }

    const access = accessResult.rows[0];

    return createSecureResponse({
      success: true,
      data: {
        hasAccess: true,
        contactFeeRequired: false,
        accessGrantedAt: access.access_granted_at,
        professionalType: access.professional_type,
        contactInfo: {
          name: `${access.first_name} ${access.last_name}`,
          email: access.email,
          phone: access.phone
        }
      }
    });

  } catch (error) {
    console.error('Error checking contact access:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}