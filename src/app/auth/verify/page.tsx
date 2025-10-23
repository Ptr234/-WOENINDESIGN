'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

function VerifyContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Email verified successfully! You can now sign in.');
        setTimeout(() => router.push('/auth/login'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Email verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const resendVerification = async () => {
    if (!email) return;

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setMessage(data.message || 'Verification email sent');
    } catch (error) {
      setMessage('Failed to resend verification email');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className={status === 'success' ? 'text-green-600' : 'text-red-600'}>
              {status === 'success' ? '✓ Verification Successful' : '✗ Verification Failed'}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Redirecting to login page...
                </p>
                <Button onClick={() => router.push('/auth/login')}>
                  Go to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {email && (
                  <Button 
                    onClick={resendVerification}
                    variant="primary"
                    className="w-full"
                  >
                    Resend Verification Email
                  </Button>
                )}
                <Button 
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>}>
      <VerifyContent />
    </Suspense>
  );
}