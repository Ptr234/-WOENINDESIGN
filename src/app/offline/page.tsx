'use client';

import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to home when back online
      window.location.href = '/landing';
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      // Check connection manually
      fetch('/api/health', { mode: 'no-cors' })
        .then(() => {
          window.location.href = '/landing';
        })
        .catch(() => {
          alert('Still offline. Please check your internet connection.');
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Offline Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M8.47 8.47l7.07 7.07"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You're Offline
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {isOnline 
              ? "Connection restored! The page will reload automatically."
              : "Check your internet connection and try again. Some cached content may still be available."
            }
          </p>

          {/* Status Indicator */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isOnline ? 'Back Online' : 'Offline'}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/landing'}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors touch-manipulation"
            >
              Go to Home
            </button>
          </div>

          {/* Cached Content Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Available Offline
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Previously viewed designer profiles</li>
              <li>• Cached portfolio images</li>
              <li>• Basic navigation</li>
              <li>• Saved drafts (if any)</li>
            </ul>
          </div>

          {/* Tips */}
          <div className="mt-6 text-xs text-gray-500">
            <p>💡 <strong>Tip:</strong> Install the WID Uganda app for better offline experience</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            WID Uganda Platform - Connecting designers across Uganda
          </p>
        </div>
      </div>
    </div>
  );
}