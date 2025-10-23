import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

const CONTACT_FEE_AMOUNT = 10000; // 10,000 UGX

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'hiring_create', 5, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many hiring requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    if (user.role !== 'client') {
      return createSecureResponse({ error: 'Only clients can create hiring requests' }, 403);
    }

    const body = await request.json();
    const {
      designerId,
      supplierId,
      projectTitle,
      projectDescription,
      budget,
      timeline,
      designSpecialty,
      priority = 'medium',
      contactPreferences = { email: true, phone: false, video: false }
    } = body;

    // Validate required fields
    if (!projectTitle || !projectDescription || !budget) {
      return createSecureResponse({ 
        error: 'Missing required fields: projectTitle, projectDescription, budget' 
      }, 400);
    }

    // Must specify either designer or supplier
    if (!designerId && !supplierId) {
      return createSecureResponse({ 
        error: 'Must specify either designerId or supplierId' 
      }, 400);
    }

    const professionalId = designerId || supplierId;
    const professionalType = designerId ? 'designer' : 'supplier';

    // Check if professional exists and is active
    const professionalCheck = await query(
      'SELECT id, first_name, last_name, email, role, is_active FROM users WHERE id = $1 AND role = $2',
      [professionalId, professionalType]
    );

    if (professionalCheck.rows.length === 0) {
      return createSecureResponse({ 
        error: `${professionalType} not found` 
      }, 404);
    }

    const professional = professionalCheck.rows[0];
    if (!professional.is_active) {
      return createSecureResponse({ 
        error: `${professionalType} is not currently available` 
      }, 400);
    }

    // Check if client already has contact access to this professional
    const accessCheck = await query(
      'SELECT id FROM contact_access WHERE client_id = $1 AND professional_id = $2',
      [user.id, professionalId]
    );

    const hasContactAccess = accessCheck.rows.length > 0;
    const contactFeeStatus = hasContactAccess ? 'paid' : 'pending';

    // Create hiring request
    const hiringRequestResult = await query(
      `INSERT INTO hiring_requests (
        id, client_id, designer_id, supplier_id, project_title, project_description,
        budget, timeline, design_specialty, status, priority, contact_fee_status,
        contact_preferences, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11, NOW(), NOW()
      ) RETURNING id`,
      [
        user.id,
        designerId || null,
        supplierId || null,
        projectTitle,
        projectDescription,
        parseFloat(budget),
        timeline,
        designSpecialty,
        priority,
        contactFeeStatus,
        JSON.stringify(contactPreferences)
      ]
    );

    const hiringRequestId = hiringRequestResult.rows[0].id;

    // If contact access already exists, return success immediately
    if (hasContactAccess) {
      return createSecureResponse({
        success: true,
        message: 'Hiring request created successfully',
        data: {
          hiringRequestId,
          contactFeeRequired: false,
          contactFeeStatus: 'paid'
        }
      });
    }

    // Create contact fee transaction
    const paymentSession = await query(
      `INSERT INTO project_transactions (
        id, hiring_request_id, client_id, designer_id, supplier_id, type,
        amount, currency, status, payment_session_id, expires_at, created_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, 'contact_fee', $5, 'UGX', 'pending', 
        $6, NOW() + INTERVAL '30 minutes', NOW()
      ) RETURNING id, payment_session_id`,
      [
        hiringRequestId,
        user.id,
        designerId || null,
        supplierId || null,
        CONTACT_FEE_AMOUNT,
        `contact_fee_${Date.now()}_${user.id.slice(0, 8)}`
      ]
    );

    const transactionId = paymentSession.rows[0].id;
    const sessionId = paymentSession.rows[0].payment_session_id;

    // Log notification
    const clientName = `${user.firstName} ${user.lastName}`;
    const professionalName = `${professional.first_name} ${professional.last_name}`;
    console.log(`Hiring request created: ${professionalName} contacted by ${clientName} for project: ${projectTitle}`);

    return createSecureResponse({
      success: true,
      message: 'Hiring request created. Payment required to access contact information.',
      data: {
        hiringRequestId,
        transactionId,
        contactFeeRequired: true,
        contactFeeAmount: CONTACT_FEE_AMOUNT,
        currency: 'UGX',
        contactFeeStatus: 'pending',
        paymentUrl: `/payment/contact-fee?session_id=${sessionId}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating hiring request:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}