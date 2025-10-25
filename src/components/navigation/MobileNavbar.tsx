'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavbarProps {
  title?: string;
  showBackButton?: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export default function MobileNavbar({ 
  title = "WID Uganda", 
  showBackButton = false, 
  user = null 
}: MobileNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { href: '/landing', label: 'Home', icon: '🏠' },
    { href: '/designers', label: 'Designers', icon: '👨‍🎨' },
    { href: '/suppliers', label: 'Suppliers', icon: '🏪' },
    { href: user ? '/dashboard' : '/auth/login', label: user ? 'Dashboard' : 'Login', icon: user ? '📊' : '🔐' },
    { href: '/test-integration', label: 'Test', icon: '🧪' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Top Navigation Bar - Mobile Only */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-white'}
        border-b border-gray-200
        lg:hidden
      `}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Back Button or Menu */}
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={() => window.history.back()}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>

          {/* Center: Title */}
          <h1 className="text-lg font-semibold text-gray-900 truncate px-4">
            {title}
          </h1>

          {/* Right: User Menu */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 truncate max-w-20">
                  {user.email.split('@')[0]}
                </span>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Slide-out Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(item.href) 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed top nav */}
      <div className="h-16 lg:hidden"></div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center px-2 py-2 text-xs font-medium transition-colors touch-manipulation
                ${isActive(item.href)
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {isActive(item.href) && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for fixed bottom nav */}
      <div className="h-16 lg:hidden"></div>

      {/* Overlay for menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}