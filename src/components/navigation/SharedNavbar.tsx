'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Clock, LayoutDashboard } from 'lucide-react';

export function SharedNavbar() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (when token is removed/added)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setUser(data.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    router.push('/landing');
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    switch (user.role) {
      case 'admin': return 'Admin Dashboard';
      case 'client': return 'Client Dashboard';
      case 'designer': return 'Designer Dashboard';
      case 'supplier': return 'Supplier Dashboard';
      default: return 'Dashboard';
    }
  };

  const isActiveLink = (href: string) => {
    if (href === '/landing') {
      return pathname === '/landing';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Bar */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)', 
        padding: '10px 5%', 
        fontSize: '12px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        color: '#556b2f' 
      }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <Clock size={14} />
          <span><strong>Opening Hours:</strong> Mon-Fri 8am-6pm - Closed on Weekends</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span><strong>Location:</strong> Kampala, Uganda ➤</span>
          <span style={{ 
            background: 'linear-gradient(135deg, #556b2f, #2d4016)', 
            color: 'white', 
            padding: '10px 15px', 
            fontSize: '13px', 
            fontWeight: 'bold', 
            textTransform: 'uppercase',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(85, 107, 47, 0.3)' 
          }}>
            CONTACT US
          </span>
          <a href="#" style={{ color: '#556b2f', fontSize: '14px' }}>📘</a>
          <a href="#" style={{ color: '#556b2f', fontSize: '14px' }}>📷</a>
          <a href="#" style={{ color: '#556b2f', fontSize: '14px' }}>🐦</a>
          <a href="#" style={{ color: '#556b2f', fontSize: '14px' }}>📺</a>
        </div>
      </div>

      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(135deg, #2d4016, #556b2f)', 
        padding: '20px 5%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position: 'relative', 
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(45, 64, 22, 0.3)' 
      }}>
        <Link href="/landing" style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          textDecoration: 'none'
        }}>
          <Image 
            src="/logo.webp" 
            alt="Women in Design Logo" 
            width={32} 
            height={32}
            style={{ borderRadius: '4px' }}
          />
          W<div style={{ width: '10px', height: '10px', background: '#90ee90', borderRadius: '50%', boxShadow: '0 0 8px rgba(144, 238, 144, 0.6)' }}></div>men in Design
        </Link>

        <nav style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
          <Link 
            href="/landing" 
            style={{ 
              color: isActiveLink('/landing') ? '#90ee90' : 'white', 
              textDecoration: 'none', 
              fontSize: '15px', 
              position: 'relative',
              transition: 'color 0.2s',
              borderBottom: isActiveLink('/landing') ? '2px solid #90ee90' : 'none',
              paddingBottom: '2px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
            onMouseLeave={(e) => e.currentTarget.style.color = isActiveLink('/landing') ? '#90ee90' : 'white'}
          >
            Home
          </Link>
          <Link 
            href="/landing/designers" 
            style={{ 
              color: isActiveLink('/landing/designers') ? '#90ee90' : 'white', 
              textDecoration: 'none', 
              fontSize: '15px', 
              transition: 'color 0.2s',
              borderBottom: isActiveLink('/landing/designers') ? '2px solid #90ee90' : 'none',
              paddingBottom: '2px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
            onMouseLeave={(e) => e.currentTarget.style.color = isActiveLink('/landing/designers') ? '#90ee90' : 'white'}
          >
            Designers
          </Link>
          <Link 
            href="/landing/suppliers" 
            style={{ 
              color: isActiveLink('/landing/suppliers') ? '#90ee90' : 'white', 
              textDecoration: 'none', 
              fontSize: '15px', 
              transition: 'color 0.2s',
              borderBottom: isActiveLink('/landing/suppliers') ? '2px solid #90ee90' : 'none',
              paddingBottom: '2px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
            onMouseLeave={(e) => e.currentTarget.style.color = isActiveLink('/landing/suppliers') ? '#90ee90' : 'white'}
          >
            Suppliers
          </Link>
          <Link 
            href="/landing/about" 
            style={{ 
              color: isActiveLink('/landing/about') ? '#90ee90' : 'white', 
              textDecoration: 'none', 
              fontSize: '15px', 
              transition: 'color 0.2s',
              borderBottom: isActiveLink('/landing/about') ? '2px solid #90ee90' : 'none',
              paddingBottom: '2px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
            onMouseLeave={(e) => e.currentTarget.style.color = isActiveLink('/landing/about') ? '#90ee90' : 'white'}
          >
            About Us
          </Link>
          {isAuthenticated && (
            <Link 
              href="/dashboard" 
              style={{ 
                color: isActiveLink('/dashboard') ? '#90ee90' : 'white', 
                textDecoration: 'none', 
                fontSize: '15px', 
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderBottom: isActiveLink('/dashboard') ? '2px solid #90ee90' : 'none',
                paddingBottom: '2px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActiveLink('/dashboard') ? '#90ee90' : 'white'}
            >
              <LayoutDashboard size={16} />
              {getDashboardLabel()}
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '45px', 
              height: '45px', 
              background: 'white', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '20px' 
            }}>
              <Globe style={{ color: '#556b2f' }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>Call Us Anytime</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>+256 700 123 456</div>
            </div>
          </div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: 'white', fontSize: '14px' }}>
                Welcome, {user?.firstName || 'User'}
              </span>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  fontSize: '12px', 
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Link href="/auth/login">
                <button style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  fontSize: '12px', 
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s'
                }}>
                  Sign In
                </button>
              </Link>
              <Link href="/auth/register">
                <button style={{ 
                  background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
                  color: 'white', 
                  padding: '14px 28px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase', 
                  fontSize: '12px', 
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 15px rgba(144, 238, 144, 0.4)' 
                }}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}