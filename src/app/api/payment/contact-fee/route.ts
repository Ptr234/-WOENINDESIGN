import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { createSecureResponse } from '@/lib/security/headers';
import { rateLimitMiddleware } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimitMiddleware(request, 'payment', 10, 15 * 60 * 1000);
  if (!rateLimitResult.success) {
    return createSecureResponse({ error: 'Too many payment requests' }, 429);
  }

  try {
    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { sessionId, paymentMethod, phoneNumber, transactionReference } = body;

    if (!sessionId || !paymentMethod) {
      return createSecureResponse({ 
        error: 'Missing required fields: sessionId, paymentMethod' 
      }, 400);
    }

    // Validate payment method
    if (!['mtn_money', 'airtel_money'].includes(paymentMethod)) {
      return createSecureResponse({ 
        error: 'Invalid payment method. Use mtn_money or airtel_money' 
      }, 400);
    }

    // Find the transaction
    const transactionResult = await query(
      `SELECT 
        pt.id, pt.hiring_request_id, pt.client_id, pt.designer_id, pt.supplier_id,
        pt.amount, pt.currency, pt.status, pt.expires_at,
        hr.project_title
      FROM project_transactions pt
      JOIN hiring_requests hr ON pt.hiring_request_id = hr.id
      WHERE pt.payment_session_id = $1 AND pt.client_id = $2 AND pt.type = 'contact_fee'`,
      [sessionId, user.id]
    );

    if (transactionResult.rows.length === 0) {
      return createSecureResponse({ 
        error: 'Payment session not found or expired' 
      }, 404);
    }

    const transaction = transactionResult.rows[0];

    // Check if already paid
    if (transaction.status === 'paid') {
      return createSecureResponse({ 
        error: 'Payment already completed' 
      }, 400);
    }

    // Check if expired
    if (new Date() > new Date(transaction.expires_at)) {
      await query(
        'UPDATE project_transactions SET status = \'failed\' WHERE id = $1',
        [transaction.id]
      );
      return createSecureResponse({ 
        error: 'Payment session expired' 
      }, 400);
    }

    // Simulate mobile money payment processing
    // In production, this would integrate with MTN/Airtel APIs
    const isPaymentSuccessful = await simulateMobileMoneyPayment(
      paymentMethod, 
      phoneNumber, 
      transaction.amount,
      transaction.currency
    );

    if (!isPaymentSuccessful) {
      await query(
        'UPDATE project_transactions SET status = \'failed\', payment_method = $1, updated_at = NOW() WHERE id = $2',
        [paymentMethod, transaction.id]
      );
      return createSecureResponse({ 
        error: 'Payment failed. Please try again.' 
      }, 400);
    }

    // Update transaction as paid
    await query(
      `UPDATE project_transactions 
       SET status = 'paid', payment_method = $1, transaction_reference = $2, updated_at = NOW() 
       WHERE id = $3`,
      [paymentMethod, transactionReference || `ref_${Date.now()}`, transaction.id]
    );

    // Update hiring request contact fee status
    await query(
      'UPDATE hiring_requests SET contact_fee_status = \'paid\', updated_at = NOW() WHERE id = $1',
      [transaction.hiring_request_id]
    );

    // Grant contact access
    const professionalId = transaction.designer_id || transaction.supplier_id;
    const professionalType = transaction.designer_id ? 'designer' : 'supplier';

    await query(
      `INSERT INTO contact_access (client_id, professional_id, professional_type, transaction_id, access_granted_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (client_id, professional_id) DO NOTHING`,
      [user.id, professionalId, professionalType, transaction.id]
    );

    // Get professional contact information
    const professionalInfo = await query(
      'SELECT first_name, last_name, email, phone FROM users WHERE id = $1',
      [professionalId]
    );

    const professional = professionalInfo.rows[0];

    return createSecureResponse({
      success: true,
      message: 'Payment successful! You can now contact the professional.',
      data: {
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethod,
        contactInfo: {
          name: `${professional.first_name} ${professional.last_name}`,
          email: professional.email,
          phone: professional.phone
        },
        projectTitle: transaction.project_title
      }
    });

  } catch (error) {
    console.error('Error processing contact fee payment:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}

// Simulate mobile money payment processing
async function simulateMobileMoneyPayment(
  method: string, 
  phoneNumber: string, 
  amount: number, 
  currency: string
): Promise<boolean> {
  // In production, this would call MTN MoMo API or Airtel Money API
  console.log(`Simulating ${method} payment: ${phoneNumber} - ${amount} ${currency}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate 95% success rate
  return Math.random() > 0.05;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return createSecureResponse({ error: 'Session ID required' }, 400);
    }

    const user = await AuthService.authenticateRequest(request);
    if (!user) {
      return createSecureResponse({ error: 'Unauthorized' }, 401);
    }

    // Get transaction details for payment form
    const transactionResult = await query(
      `SELECT 
        pt.id, pt.amount, pt.currency, pt.status, pt.expires_at,
        hr.project_title,
        u.first_name, u.last_name
      FROM project_transactions pt
      JOIN hiring_requests hr ON pt.hiring_request_id = hr.id
      JOIN users u ON (pt.designer_id = u.id OR pt.supplier_id = u.id)
      WHERE pt.payment_session_id = $1 AND pt.client_id = $2 AND pt.type = 'contact_fee'`,
      [sessionId, user.id]
    );

    if (transactionResult.rows.length === 0) {
      return createSecureResponse({ 
        error: 'Payment session not found' 
      }, 404);
    }

    const transaction = transactionResult.rows[0];

    if (transaction.status === 'paid') {
      return createSecureResponse({ 
        error: 'Payment already completed',
        redirect: '/dashboard'
      }, 400);
    }

    if (new Date() > new Date(transaction.expires_at)) {
      return createSecureResponse({ 
        error: 'Payment session expired'
      }, 400);
    }

    return createSecureResponse({
      success: true,
      data: {
        sessionId,
        amount: transaction.amount,
        currency: transaction.currency,
        professionalName: `${transaction.first_name} ${transaction.last_name}`,
        projectTitle: transaction.project_title,
        expiresAt: transaction.expires_at
      }
    });

  } catch (error) {
    console.error('Error getting payment session:', error);
    return createSecureResponse({ error: 'Internal server error' }, 500);
  }
}