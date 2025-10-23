'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings } from 'lucide-react';
import AdminSettingsPage from '@/components/settings/AdminSettingsPage';

function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Verify user is admin
      const authResponse = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!authResponse.ok) {
        router.push('/auth/login');
        return;
      }

      const authData = await authResponse.json();
      if (!authData.success || authData.data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/auth/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-gradient">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-gray-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>
                  <p className="text-sm text-gray-600">Women in Design Administration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminSettingsPage />
      </div>
    </div>
  );
}

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    }>
      <SettingsPage />
    </Suspense>
  );
}