'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Menu, X, LayoutDashboard } from 'lucide-react';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
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

    // Check auth on mount
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

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUser(null);
    // Dispatch custom event to notify other components
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

  const navLinks = [
    { href: '/landing', label: 'Home' },
    { href: '/landing/designers', label: 'Designers' },
    { href: '/landing/suppliers', label: 'Suppliers' },
    { href: '/landing/about', label: 'About Us' }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/landing') {
      return pathname === '/landing';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav style={{ 
      background: 'linear-gradient(135deg, #2d4016, #556b2f)', 
      boxShadow: '0 4px 20px rgba(45, 64, 22, 0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/landing" style={{ 
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
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Women in Design</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ 
                  color: isActiveLink(link.href) ? '#90ee90' : 'white',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                  borderBottom: isActiveLink(link.href) ? '2px solid #90ee90' : 'none',
                  paddingBottom: '2px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
                onMouseLeave={(e) => e.currentTarget.style.color = isActiveLink(link.href) ? '#90ee90' : 'white'}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Dashboard Link for Authenticated Users */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                style={{ 
                  color: pathname === '/dashboard' ? '#90ee90' : 'white',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                  borderBottom: pathname === '/dashboard' ? '2px solid #90ee90' : 'none',
                  paddingBottom: '2px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
                onMouseLeave={(e) => e.currentTarget.style.color = pathname === '/dashboard' ? '#90ee90' : 'white'}
              >
                <LayoutDashboard size={16} />
                {getDashboardLabel()}
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'white', fontSize: '14px' }}>
                  Welcome, {user?.firstName || 'User'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  style={{ color: 'white' }}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" style={{ color: 'white' }}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm" style={{ background: 'linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%)', color: 'white' }}>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ 
                color: 'white', 
                padding: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div style={{ borderTop: '1px solid rgba(144, 238, 144, 0.2)' }}>
          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: isActiveLink(link.href) ? '#90ee90' : 'white',
                  backgroundColor: isActiveLink(link.href) ? 'rgba(144, 238, 144, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#90ee90';
                  e.currentTarget.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isActiveLink(link.href) ? '#90ee90' : 'white';
                  e.currentTarget.style.backgroundColor = isActiveLink(link.href) ? 'rgba(144, 238, 144, 0.1)' : 'transparent';
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Dashboard Link for Authenticated Users */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: pathname === '/dashboard' ? '#90ee90' : 'white',
                  backgroundColor: pathname === '/dashboard' ? 'rgba(144, 238, 144, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#90ee90';
                  e.currentTarget.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = pathname === '/dashboard' ? '#90ee90' : 'white';
                  e.currentTarget.style.backgroundColor = pathname === '/dashboard' ? 'rgba(144, 238, 144, 0.1)' : 'transparent';
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard size={16} />
                {getDashboardLabel()}
              </Link>
            )}
            
            {/* Mobile Auth Buttons */}
            <div style={{ paddingTop: '16px', paddingBottom: '8px', borderTop: '1px solid rgba(144, 238, 144, 0.2)', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {isAuthenticated ? (
                <>
                  <div style={{ padding: '8px 12px', color: 'white', fontSize: '14px' }}>
                    Welcome, {user?.firstName || 'User'}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: 'transparent',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#90ee90';
                      e.currentTarget.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: 'white',
                      backgroundColor: 'transparent',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#90ee90';
                      e.currentTarget.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      background: 'linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #2d4016 0%, #556b2f 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #90ee90 0%, #7bcf7b 100%)';
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}