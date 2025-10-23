'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CreditCard, Phone, CheckCircle, AlertCircle, Clock, 
  ArrowLeft, Shield, DollarSign 
} from 'lucide-react';

interface PaymentSession {
  sessionId: string;
  amount: number;
  currency: string;
  professionalName: string;
  projectTitle: string;
  expiresAt: string;
}

function ContactFeePaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('mtn_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid payment session');
      setLoading(false);
      return;
    }

    fetchPaymentSession();
  }, [sessionId]);

  const fetchPaymentSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payment/contact-fee?session_id=${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setPaymentSession(data.data);
      } else {
        setError(data.error || 'Failed to load payment session');
        if (data.redirect) {
          setTimeout(() => router.push(data.redirect), 3000);
        }
      }
    } catch (error) {
      setError('Failed to load payment session');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment/contact-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          paymentMethod,
          phoneNumber
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(data.error || 'Payment failed');
      }
    } catch (error) {
      setError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              You can now contact the professional directly. Redirecting to dashboard...
            </p>
            <div className="animate-pulse text-sm text-gray-500">Redirecting in 3 seconds...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentSession) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
            <p className="text-gray-600 mb-6">Payment session not found or expired</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/50 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contact Fee Payment</h1>
              <p className="text-gray-600">Pay to access professional contact information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Details</h2>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('mtn_money')}
                      className={`p-4 border-2 rounded-lg transition ${
                        paymentMethod === 'mtn_money'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <Phone className="text-white" size={24} />
                        </div>
                        <div className="font-medium">MTN Mobile Money</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('airtel_money')}
                      className={`p-4 border-2 rounded-lg transition ${
                        paymentMethod === 'airtel_money'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-red-500 rounded-lg flex items-center justify-center">
                          <Phone className="text-white" size={24} />
                        </div>
                        <div className="font-medium">Airtel Money</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., 0781234567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the phone number registered with {paymentMethod === 'mtn_money' ? 'MTN MoMo' : 'Airtel Money'}
                  </p>
                </div>

                {/* Payment Button */}
                <button
                  onClick={processPayment}
                  disabled={processing || !phoneNumber}
                  className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Pay UGX {paymentSession.amount.toLocaleString()}
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="text-gray-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-1">Secure Payment</div>
                      <div>Your payment is processed securely. We use industry-standard encryption to protect your information.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Professional</div>
                    <div className="font-medium">{paymentSession.professionalName}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Project</div>
                    <div className="font-medium">{paymentSession.projectTitle}</div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Contact Fee</span>
                      <span className="font-medium">UGX {paymentSession.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>UGX {paymentSession.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Session Expiry */}
                <div className="mt-6 p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Session expires soon</span>
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    Complete payment before session expires
                  </div>
                </div>

                {/* What You Get */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">What you get:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Direct email contact</li>
                    <li>• Phone number access</li>
                    <li>• Platform messaging</li>
                    <li>• Professional collaboration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactFeePaymentPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <ContactFeePaymentPage />
    </Suspense>
  );
}