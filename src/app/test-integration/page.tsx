'use client';

import { useState, useEffect } from 'react';
import MobileNavbar from '@/components/navigation/MobileNavbar';

interface TestResult {
  message: string;
  success: boolean;
  timestamp: string;
  backend?: {
    status: string;
    environment: string;
    deployment: string;
    version: string;
  };
  supabase?: {
    status: string;
    connection: boolean;
    features: {
      database: boolean;
      storage: boolean;
      realtime: boolean;
      auth: boolean;
    };
    storage?: {
      status: string;
      buckets: string[];
    };
  };
  database?: {
    tables: string[];
    userCount: number;
    projectCount: number;
    sampleUsers?: Array<{
      id: string;
      email: string;
      role: string;
      created_at: string;
    }>;
    sampleProjects?: Array<{
      id: string;
      title: string;
      status: string;
      created_at: string;
    }>;
  };
  overall?: string;
}

interface FrontendTestResult {
  message: string;
  backend_url: string;
  frontend_origin: string;
  cors_enabled: boolean;
  timestamp: string;
  headers: {
    'user-agent': string;
    'referer': string;
    'origin': string;
  };
}

export default function TestIntegrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [frontendTest, setFrontendTest] = useState<FrontendTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    // Get the API URL from environment variables
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    setApiUrl(url);
  }, []);

  const runFullStackTest = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);
    setFrontendTest(null);

    try {
      // Test full stack integration
      console.log('Testing API URL:', `${apiUrl}/test`);
      
      const response = await fetch(`${apiUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult(data);

      // Test frontend connectivity
      const frontendResponse = await fetch(`${apiUrl}/test/frontend`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (frontendResponse.ok) {
        const frontendData = await frontendResponse.json();
        setFrontendTest(frontendData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Test error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseWrite = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/test/database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Database write test successful! Created user: ${data.created_user.email}`);
        // Refresh the main test
        await runFullStackTest();
      } else {
        alert(`Database write test failed: ${data.error}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database write test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'available':
      case 'fully_operational':
        return 'text-green-600';
      case 'unhealthy':
      case 'unavailable':
        return 'text-red-600';
      case 'supabase_only':
      case 'supabase_connected':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <MobileNavbar title="Integration Test" showBackButton={true} />
      <main id="main-content" className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="container max-w-4xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
            🧪 WID Uganda Platform - Full Stack Test
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold text-blue-900 mb-2">Test Configuration</h2>
            <div className="text-sm md:text-base text-blue-800 space-y-1">
              <div><strong>Frontend:</strong> <span className="break-all">{typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</span></div>
              <div><strong>Backend API:</strong> <span className="break-all">{apiUrl}</span></div>
              <div><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <button
              onClick={runFullStackTest}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 md:px-6 py-3 md:py-2 rounded-lg font-medium text-sm md:text-base transition-colors touch-manipulation"
            >
              {isLoading ? '🔄 Testing...' : '🚀 Run Full Stack Test'}
            </button>
            
            <button
              onClick={testDatabaseWrite}
              disabled={isLoading || !testResult?.supabase?.connection}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 md:px-6 py-3 md:py-2 rounded-lg font-medium text-sm md:text-base transition-colors touch-manipulation"
            >
              📝 Test Database Write
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-900">❌ Error</h3>
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {testResult && (
            <div className="space-y-4 md:space-y-6">
              {/* Overall Status */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="text-lg md:text-xl font-bold mb-2">📊 Overall Status</h3>
                <p className={`text-base md:text-lg font-semibold ${getStatusColor(testResult.overall || 'unknown')}`}>
                  {testResult.overall?.toUpperCase().replace('_', ' ')} 
                  {testResult.success ? ' ✅' : ' ❌'}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Last tested: {new Date(testResult.timestamp).toLocaleString()}</p>
              </div>

              {/* Backend Status */}
              {testResult.backend && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">🖥️ Backend Status</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Status:</strong> <span className={getStatusColor(testResult.backend.status)}>{testResult.backend.status}</span>
                    </div>
                    <div>
                      <strong>Environment:</strong> {testResult.backend.environment}
                    </div>
                    <div>
                      <strong>Deployment:</strong> {testResult.backend.deployment}
                    </div>
                    <div>
                      <strong>Version:</strong> {testResult.backend.version}
                    </div>
                  </div>
                </div>
              )}

              {/* Supabase Status */}
              {testResult.supabase && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">🗄️ Supabase Status</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Status:</strong> <span className={getStatusColor(testResult.supabase.status)}>{testResult.supabase.status}</span>
                    </div>
                    <div>
                      <strong>Connection:</strong> {testResult.supabase.connection ? '✅ Connected' : '❌ Disconnected'}
                    </div>
                    <div>
                      <strong>Features:</strong>
                      <ul className="ml-4 mt-1">
                        <li>Database: {testResult.supabase.features.database ? '✅' : '❌'}</li>
                        <li>Storage: {testResult.supabase.features.storage ? '✅' : '❌'}</li>
                        <li>Real-time: {testResult.supabase.features.realtime ? '✅' : '❌'}</li>
                        <li>Auth: {testResult.supabase.features.auth ? '✅' : '❌'}</li>
                      </ul>
                    </div>
                    {testResult.supabase.storage && (
                      <div>
                        <strong>Storage Buckets:</strong> {testResult.supabase.storage.buckets.join(', ') || 'None'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Database Status */}
              {testResult.database && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">💾 Database Status</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Tables:</strong> {testResult.database.tables.join(', ') || 'None'}
                    </div>
                    <div>
                      <strong>User Count:</strong> {testResult.database.userCount}
                    </div>
                    <div>
                      <strong>Project Count:</strong> {testResult.database.projectCount}
                    </div>
                    
                    {testResult.database.sampleUsers && testResult.database.sampleUsers.length > 0 && (
                      <div>
                        <strong>Sample Users:</strong>
                        <ul className="ml-4 mt-1">
                          {testResult.database.sampleUsers.map((user, idx) => (
                            <li key={idx}>
                              {user.email} ({user.role}) - {new Date(user.created_at).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {testResult.database.sampleProjects && testResult.database.sampleProjects.length > 0 && (
                      <div>
                        <strong>Sample Projects:</strong>
                        <ul className="ml-4 mt-1">
                          {testResult.database.sampleProjects.map((project, idx) => (
                            <li key={idx}>
                              {project.title} ({project.status}) - {new Date(project.created_at).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Frontend Connectivity */}
              {frontendTest && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">🌐 Frontend Connectivity</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Backend URL:</strong> {frontendTest.backend_url}
                    </div>
                    <div>
                      <strong>Frontend Origin:</strong> {frontendTest.frontend_origin}
                    </div>
                    <div>
                      <strong>CORS Enabled:</strong> {frontendTest.cors_enabled ? '✅' : '❌'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!testResult && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Click "Run Full Stack Test" to verify your platform integration</p>
            </div>
          )}
          </div>
        </div>
      </main>
    </>
  );
}