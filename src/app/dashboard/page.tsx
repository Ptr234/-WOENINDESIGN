'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, PlatformStats } from '@/types';
import WomenInDesignAdminDashboard from '@/components/dashboards/WomenInDesignAdminDashboard';
import EnhancedClientDashboard from '@/components/dashboards/EnhancedClientDashboard';
import DesignerDashboard from '@/components/dashboards/DesignerDashboard';
import SupplierDashboard from '@/components/dashboards/SupplierDashboard';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/landing');
          return;
        }
        
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (!data.success) {
          router.push('/landing');
          return;
        }
        
        setUser(data.data.user);
        
        const statsResponse = await fetch('/api/dashboard/stats');
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch (error) {
        router.push('/landing');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await fetch('/api/auth/logout', { method: 'POST' });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    router.push('/landing');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{ 
          width: '8rem', 
          height: '8rem', 
          border: '4px solid #90ee90', 
          borderTop: '4px solid transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Route to role-specific dashboard components
  switch (user.role) {
    case 'admin':
      return <WomenInDesignAdminDashboard user={user} onLogout={handleLogout} />;
    case 'client':
      return <EnhancedClientDashboard user={user} onLogout={handleLogout} />;
    case 'designer':
      return <DesignerDashboard user={user} onLogout={handleLogout} />;
    case 'supplier':
      return <SupplierDashboard user={user} onLogout={handleLogout} />;
    default:
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#2d4016', 
              marginBottom: '0.5rem' 
            }}>
              Unknown User Role
            </h1>
            <p style={{ 
              color: '#556b2f', 
              marginBottom: '1rem' 
            }}>
              Your account role is not recognized.
            </p>
            <button 
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #556b2f, #2d4016)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 4px 15px rgba(85, 107, 47, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      );
  }
}