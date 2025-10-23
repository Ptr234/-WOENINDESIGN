'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AuthUser } from '@/types';

export function Navbar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getNavLinks = () => {
    if (!user) return [];

    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/messages', label: 'Messages' },
      { href: '/profile', label: 'Profile' }
    ];

    switch (user.role) {
      case 'designer':
        return [
          ...baseLinks,
          { href: '/portfolio', label: 'Portfolio' },
          { href: '/projects', label: 'Projects' }
        ];
      case 'client':
        return [
          ...baseLinks,
          { href: '/designers', label: 'Find Designers' },
          { href: '/suppliers', label: 'Find Suppliers' },
          { href: '/projects', label: 'My Projects' }
        ];
      case 'supplier':
        return [
          ...baseLinks,
          { href: '/products', label: 'Products' },
          { href: '/inquiries', label: 'Inquiries' }
        ];
      default:
        return baseLinks;
    }
  };

  const navLinks = getNavLinks();

  if (loading) {
    return (
      <nav style={{ 
        background: 'linear-gradient(135deg, #2d4016, #556b2f)', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        borderBottom: '1px solid rgba(144, 238, 144, 0.2)' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
                Women in Design
              </Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                animation: 'pulse 2s infinite', 
                background: '#90ee90', 
                height: '2rem', 
                width: '5rem', 
                borderRadius: '4px',
                opacity: 0.7
              }}></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav style={{ 
      background: 'linear-gradient(135deg, #2d4016, #556b2f)', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
      borderBottom: '1px solid rgba(144, 238, 144, 0.2)' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link 
              href={user ? "/dashboard" : "/"} 
              style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}
            >
              Women in Design
            </Link>
          </div>

          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{ 
                      color: pathname === link.href ? '#90ee90' : 'white',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'color 0.2s',
                      borderBottom: pathname === link.href ? '2px solid #90ee90' : 'none',
                      paddingBottom: '2px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
                    onMouseLeave={(e) => e.currentTarget.style.color = pathname === link.href ? '#90ee90' : 'white'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '14px', color: 'white' }}>
                  {user.firstName} {user.lastName}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{ color: 'white', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                >
                  <svg style={{ height: '24px', width: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && user && (
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
                  color: pathname === link.href ? '#90ee90' : 'white',
                  backgroundColor: pathname === link.href ? 'rgba(144, 238, 144, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#90ee90';
                  e.currentTarget.style.backgroundColor = 'rgba(144, 238, 144, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = pathname === link.href ? '#90ee90' : 'white';
                  e.currentTarget.style.backgroundColor = pathname === link.href ? 'rgba(144, 238, 144, 0.1)' : 'transparent';
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: '16px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
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
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}