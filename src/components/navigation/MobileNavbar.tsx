'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Users, Building, User, LogIn, Settings, ArrowLeft } from 'lucide-react';

interface MobileNavbarProps {
  title?: string;
  showBackButton?: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
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
    { href: '/landing', label: 'Home', icon: Home, color: 'text-green-600' },
    { href: '/landing/designers', label: 'Designers', icon: Users, color: 'text-purple-600' },
    { href: '/landing/suppliers', label: 'Suppliers', icon: Building, color: 'text-blue-600' },
    { href: '/landing/about', label: 'About', icon: Settings, color: 'text-gray-600' },
    { href: user ? '/dashboard' : '/auth/login', label: user ? 'Dashboard' : 'Login', icon: user ? User : LogIn, color: user ? 'text-orange-600' : 'text-red-600' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Top Navigation Bar - Mobile/Tablet */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'}
        border-b border-gray-200
        xl:hidden
      `}>
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Left: Back Button or Menu */}
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={() => window.history.back()}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            ) : (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            )}
          </div>

          {/* Center: Logo and Title */}
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo.webp" 
              alt="WID Uganda Logo" 
              width={32} 
              height={32}
              className="rounded-md"
              priority
            />
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 truncate max-w-20 hidden sm:block">
                  {user.firstName || user.email.split('@')[0]}
                </span>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                  <span className="text-white text-sm font-medium">
                    {(user.firstName ? user.firstName.charAt(0) : user.email.charAt(0)).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg transition-colors touch-manipulation"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Slide-out Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 touch-manipulation
                      ${isActive(item.href) 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent className={`w-5 h-5 mr-3 ${item.color}`} />
                    <span>{item.label}</span>
                    {isActive(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
              
              {/* User Section in Menu */}
              {user && (
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    Welcome, {user.firstName || user.email.split('@')[0]}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed top nav */}
      <div className="h-16 xl:hidden"></div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 safe-area-pb">
        <div className={`grid h-16 ${navigationItems.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
          {navigationItems.slice(0, 4).map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center px-2 py-2 text-xs font-medium transition-all duration-200 touch-manipulation relative
                  ${isActive(item.href)
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                  }
                `}
              >
                <IconComponent className={`w-5 h-5 mb-1 ${isActive(item.href) ? item.color : 'text-current'}`} />
                <span className="truncate leading-tight">{item.label}</span>
                {isActive(item.href) && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-purple-600 rounded-b-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed bottom nav */}
      <div className="h-16 md:hidden safe-area-pb"></div>

      {/* Overlay for menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 xl:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          onTouchStart={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}