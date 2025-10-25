'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Star, Users, Building, Heart, CheckCircle, Quote, ChevronRight, Eye, Phone, Globe, Clock, MapPin, LayoutDashboard } from 'lucide-react';
import MobileNavbar from '@/components/navigation/MobileNavbar';

interface FeaturedDesigner {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  completedProjects: number;
  profileImage?: string;
  sampleWork: string;
  location: string;
}

interface FeaturedSupplier {
  id: string;
  businessName: string;
  category: string;
  rating: number;
  location: string;
  sampleProduct: string;
  description: string;
}

export default function LandingPage() {
  const [featuredDesigners, setFeaturedDesigners] = useState<FeaturedDesigner[]>([]);
  const [featuredSuppliers, setFeaturedSuppliers] = useState<FeaturedSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchFeaturedContent();
    checkAuth();
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

  const fetchFeaturedContent = async () => {
    try {
      // Fetch featured designers
      const designersResponse = await fetch('/api/public/featured-designers');
      const designersData = await designersResponse.json();
      if (designersData.success) {
        setFeaturedDesigners(designersData.data);
      }

      // Fetch featured suppliers
      const suppliersResponse = await fetch('/api/public/featured-suppliers');
      const suppliersData = await suppliersResponse.json();
      if (suppliersData.success) {
        setFeaturedSuppliers(suppliersData.data);
      }
    } catch (error) {
      console.error('Failed to fetch featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDesignerClick = (designerId: string) => {
    if (confirm('To view full designer profiles and contact information, please sign in or create an account. Would you like to continue?')) {
      window.location.href = '/auth/login?redirect=/designers';
    }
  };

  const handleSupplierClick = (supplierId: string) => {
    if (confirm('To view full supplier details and contact information, please sign in or create an account. Would you like to continue?')) {
      window.location.href = '/auth/login?redirect=/suppliers';
    }
  };

  return (
    <>
      <MobileNavbar title="WID Uganda" user={user} />
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
      <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333', overflowX: 'hidden' }}>
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
          <span><strong>Location:</strong> Kampala, Uganda ➤ DEPLOYED-v2.1</span>
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
          <a href="#" style={{ color: '#556b2f', fontSize: '14px', textDecoration: 'none' }} title="Facebook">📘</a>
          <a href="https://www.instagram.com/womenindesignug" target="_blank" rel="noopener noreferrer" style={{ color: '#556b2f', fontSize: '14px', textDecoration: 'none' }} title="Instagram">📷</a>
          <a href="#" style={{ color: '#556b2f', fontSize: '14px', textDecoration: 'none' }} title="Twitter">🐦</a>
          <a href="https://www.tiktok.com/@womenindesignug?_t=ZM-90qV76PMgsS&_r=1" target="_blank" rel="noopener noreferrer" style={{ color: '#556b2f', fontSize: '14px', textDecoration: 'none' }} title="TikTok">📺</a>
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
          <Link href="/landing" style={{ color: 'white', textDecoration: 'none', fontSize: '15px', position: 'relative' }}>
            Home
            <div style={{ content: '', position: 'absolute', bottom: '-5px', left: 0, width: '100%', height: '2px', background: '#90ee90', boxShadow: '0 2px 4px rgba(144, 238, 144, 0.4)' }}></div>
          </Link>
          <Link 
            href="/landing/designers" 
            style={{ color: 'white', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
          >
            Designers
          </Link>
          <Link 
            href="/landing/suppliers" 
            style={{ color: 'white', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
          >
            Suppliers
          </Link>
          <Link 
            href="/landing/about" 
            style={{ color: 'white', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
          >
            About Us
          </Link>
          {isAuthenticated && (
            <Link 
              href="/dashboard" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '15px', 
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#90ee90'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
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

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #2d4016 0%, #556b2f 50%, #708238 100%)', 
        padding: '100px 5% 150px', 
        position: 'relative', 
        overflow: 'hidden', 
        minHeight: '600px' 
      }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '55%', 
          height: '100%', 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000'%3E%3Ccircle fill='%2390ee90' opacity='0.1' cx='200' cy='200' r='80'/%3E%3Ccircle fill='%23f5f5dc' opacity='0.15' cx='500' cy='300' r='60'/%3E%3Ccircle fill='%2390ee90' opacity='0.08' cx='700' cy='150' r='90'/%3E%3Cpath fill='%23708238' opacity='0.1' d='M100,400 Q200,350 300,400 Q400,450 500,400 L500,500 L100,500 Z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain'
        }}></div>

        <div style={{ 
          position: 'absolute', 
          right: '-100px', 
          top: 0, 
          width: '65%', 
          height: '100%', 
          background: `linear-gradient(rgba(45, 64, 22, 0.7), rgba(112, 130, 56, 0.7)), url("/images/1000579811.jpg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.8 
        }}></div>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          position: 'relative', 
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', marginBottom: '25px', letterSpacing: '0.5px' }}>
              Women in Design Uganda Ltd
            </div>
            <h1 style={{ 
              color: 'white', 
              fontSize: '56px', 
              fontWeight: 700, 
              marginBottom: '25px', 
              lineHeight: 1.2
            }}>
              Welcome To Women in Design Platform
            </h1>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontSize: '16px', 
              marginBottom: '35px', 
              lineHeight: 1.7 
            }}>
              Transform your spaces with talented women designers and verified suppliers. Women in Design opens new horizons for creative collaboration and business growth.
            </p>
            <Link href="/auth/register">
              <button style={{ 
                background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
                color: 'white', 
                padding: '16px 35px', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '12px', 
                fontSize: '14px', 
                textTransform: 'capitalize',
                boxShadow: '0 6px 20px rgba(144, 238, 144, 0.4)' 
              }}>
                Join Women in Design
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
          
          <div style={{ position: 'relative' }}>
            <img 
              src="/images/WOMEN.jpeg"
              alt="Women in Design Uganda - Empowering women designers across Uganda"
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '8px solid rgba(245,245,220,0.2)'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(144, 238, 144, 0.9)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              500+ Women Designers
            </div>
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: 'rgba(45, 64, 22, 0.9)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              15+ Cities Covered
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #90ee90, #7bcf7b)',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '8%',
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)',
          borderRadius: '50%',
          opacity: 0.15,
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '80%',
          left: '10%',
          width: '30px',
          height: '30px',
          background: '#556b2f',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'float 5s ease-in-out infinite'
        }}></div>

      </section>

      {/* Partner Logos */}
      <div style={{ 
        background: 'white', 
        padding: '60px 5% 50px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '80px', 
        flexWrap: 'wrap' 
      }}>
        <div style={{ height: '35px', opacity: 0.5, fontWeight: 'bold', fontSize: '18px', color: '#90ee90' }}>
          Designers ➤➤
        </div>
        <div style={{ color: '#556b2f', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.5, fontWeight: 'bold', fontSize: '18px' }}>
          <span style={{ fontSize: '24px' }}>🎨</span> CREATIVEHUB
        </div>
        <div style={{ color: '#708238', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.5, fontWeight: 'bold', fontSize: '18px' }}>
          <span style={{ fontSize: '24px' }}>🏠</span> DesignSpace
        </div>
        <div style={{ color: '#2d4016', opacity: 0.5, fontWeight: 'bold', fontSize: '18px' }}>
          SUPPLIERS<br/><span style={{ fontSize: '10px' }}>MARKETPLACE</span>
        </div>
        <div style={{ color: '#556b2f', opacity: 0.5, fontWeight: 'bold', fontSize: '18px' }}>
          UGANDA ✨
        </div>
      </div>

      {/* Features Section */}
      <section style={{ padding: '120px 5% 100px', background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)', position: 'relative' }}>
        {/* Decorative Arrows */}
        <div style={{ 
          position: 'absolute', 
          right: '5%', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px' 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '30px', height: '8px', background: '#90ee90', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
            <div style={{ width: '30px', height: '8px', background: '#90ee90', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
            <div style={{ width: '30px', height: '8px', background: '#90ee90', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '15px' }}>
            <div style={{ width: '30px', height: '8px', background: '#556b2f', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
            <div style={{ width: '30px', height: '8px', background: '#556b2f', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
            <div style={{ width: '30px', height: '8px', background: '#556b2f', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '30px', height: '8px', background: '#2d4016', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
            <div style={{ width: '30px', height: '8px', background: '#2d4016', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
            <div style={{ width: '30px', height: '8px', background: '#2d4016', clipPath: 'polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)' }}></div>
          </div>
        </div>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '80px', 
          alignItems: 'center' 
        }}>
          <div>
            <span style={{ 
              background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
              color: 'white', 
              padding: '8px 22px', 
              borderRadius: '20px', 
              display: 'inline-block', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              marginBottom: '25px', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(144, 238, 144, 0.3)' 
            }}>
              About Women in Design
            </span>
            <h2 style={{ fontSize: '42px', color: '#2d4016', marginBottom: '25px', lineHeight: 1.3 }}>
              We'll help you find perfect design partners
            </h2>
            <p style={{ color: '#666', lineHeight: 1.9, marginBottom: '35px', fontSize: '15px' }}>
              Women in Design platform connects you with talented women designers and verified suppliers across Uganda. Get comprehensive design services with reliable supply chain solutions.
            </p>
            <ul style={{ 
              listStyle: 'none', 
              marginBottom: '35px', 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '15px 30px' 
            }}>
              <li style={{ paddingLeft: '30px', position: 'relative', color: '#333', fontSize: '15px' }}>
                <span style={{ position: 'absolute', left: 0, color: '#90ee90', fontWeight: 'bold' }}>➤</span>
                Interior Design
              </li>
              <li style={{ paddingLeft: '30px', position: 'relative', color: '#333', fontSize: '15px' }}>
                <span style={{ position: 'absolute', left: 0, color: '#90ee90', fontWeight: 'bold' }}>➤</span>
                Architecture Services
              </li>
              <li style={{ paddingLeft: '30px', position: 'relative', color: '#333', fontSize: '15px' }}>
                <span style={{ position: 'absolute', left: 0, color: '#90ee90', fontWeight: 'bold' }}>➤</span>
                Quality Suppliers
              </li>
              <li style={{ paddingLeft: '30px', position: 'relative', color: '#333', fontSize: '15px' }}>
                <span style={{ position: 'absolute', left: 0, color: '#90ee90', fontWeight: 'bold' }}>➤</span>
                Landscape Design
              </li>
              <li style={{ paddingLeft: '30px', position: 'relative', color: '#333', fontSize: '15px' }}>
                <span style={{ position: 'absolute', left: 0, color: '#90ee90', fontWeight: 'bold' }}>➤</span>
                Fashion Design
              </li>
              <li style={{ paddingLeft: '30px', position: 'relative', color: '#333', fontSize: '15px' }}>
                <span style={{ position: 'absolute', left: 0, color: '#90ee90', fontWeight: 'bold' }}>➤</span>
                Graphic Design
              </li>
            </ul>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <Link href="/auth/register">
                <button style={{ 
                  background: 'linear-gradient(135deg, #556b2f, #2d4016)', 
                  color: 'white', 
                  padding: '14px 32px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(85, 107, 47, 0.3)' 
                }}>
                  Get Started
                </button>
              </Link>
              <div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Have Questions?</div>
                <div style={{ color: '#90ee90', fontWeight: 'bold', fontSize: '16px' }}>+256 700 123 456</div>
              </div>
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <img 
              src="/images/1000579811.jpg"
              alt="Professional women designers at work - Interior Design Workspace"
              style={{ 
                width: '100%', 
                height: '400px',
                objectFit: 'cover',
                borderRadius: '15px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}
            />
            <div style={{ 
              position: 'absolute', 
              bottom: '30px', 
              right: '30px', 
              background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
              color: 'white', 
              padding: '35px 40px', 
              borderRadius: '15px', 
              textAlign: 'center', 
              boxShadow: '0 10px 30px rgba(144, 238, 144, 0.4)' 
            }}>
              <h3 style={{ fontSize: '56px', marginBottom: 0, fontWeight: 'bold' }}>3</h3>
              <div style={{ fontSize: '14px', marginBottom: '5px' }}>Years of</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}>Experience</div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px', 
                background: 'white', 
                color: '#90ee90', 
                padding: '10px 15px', 
                borderRadius: '25px', 
                fontSize: '11px', 
                fontWeight: 'bold' 
              }}>
                <span>🇺🇬</span>
                <span>15+ Cities Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Women in Design Gallery Section */}
      <section style={{ padding: '100px 5%', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
              color: 'white', 
              padding: '8px 22px', 
              borderRadius: '20px', 
              display: 'inline-block', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              marginBottom: '25px', 
              textTransform: 'uppercase', 
              letterSpacing: '1px' 
            }}>
              Our Community
            </span>
            <h2 style={{ fontSize: '42px', color: '#8b4f9f', marginBottom: '20px' }}>
              Women in Design Uganda
            </h2>
            <p style={{ color: '#666', maxWidth: '650px', margin: '0 auto', lineHeight: 1.8, fontSize: '15px' }}>
              Celebrating talented women designers and empowering them to showcase their creativity and build successful businesses.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '30px',
            marginBottom: '40px'
          }}>
            {/* Main Hero Image */}
            <div style={{ 
              gridColumn: 'span 2',
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="/images/WOMEN.jpeg"
                alt="Women in Design Uganda - Empowering creative women across Uganda"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '20px 25px',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{ color: '#2d4016', fontWeight: 'bold', marginBottom: '8px', fontSize: '18px' }}>
                  Women in Design Uganda
                </h3>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  Empowering women designers across Uganda
                </p>
              </div>
            </div>

            {/* Design Work Showcase 1 */}
            <div style={{ 
              position: 'relative',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="/images/1000579811.jpg"
                alt="Professional women designers at work - Creative workspace"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                background: 'rgba(144, 238, 144, 0.9)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                  Creative Workspace
                </h4>
                <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.9 }}>
                  Professional design environment
                </p>
              </div>
            </div>

            {/* Design Work Showcase 2 */}
            <div style={{ 
              position: 'relative',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="/images/1000579832.jpg"
                alt="Interior design services by talented women designers"
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                background: 'rgba(85, 107, 47, 0.9)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>
                  Interior Design Excellence
                </h4>
                <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.9 }}>
                  Beautiful interior transformations
                </p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/auth/register">
              <button style={{ 
                background: 'linear-gradient(135deg, #556b2f, #2d4016)', 
                color: 'white', 
                padding: '16px 40px', 
                border: 'none', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 25px rgba(85, 107, 47, 0.3)'
              }}>
                Join Our Community <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #2d4016, #556b2f)', 
        padding: '100px 5%', 
        position: 'relative' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '60px' 
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>👩‍🎨</div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>500+</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
              Women Designers<br/>Connected
            </div>
          </div>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>🏢</div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>200+</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
              Verified<br/>Suppliers
            </div>
          </div>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>🎯</div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>15+</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
              Cities of<br/>Operation
            </div>
          </div>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '52px', marginBottom: '20px' }}>✨</div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>1,200+</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
              Successful<br/>Projects
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{ padding: '120px 5% 100px', background: 'white', position: 'relative' }}>
        {/* Decorative Dots */}
        <div style={{ 
          position: 'absolute', 
          bottom: '10%', 
          right: '5%', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 15px)', 
          gap: '8px' 
        }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#90ee90' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#90ee90' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#90ee90' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#556b2f' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#556b2f' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#556b2f' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#2d4016' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#2d4016' }}></div>
          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#2d4016' }}></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ 
            background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
            color: 'white', 
            padding: '8px 22px', 
            borderRadius: '20px', 
            display: 'inline-block', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            marginBottom: '25px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px' 
          }}>
            What We Offer
          </span>
          <h2 style={{ fontSize: '42px', color: '#8b4f9f', marginBottom: '20px' }}>
            Wide Variety of Design Services
          </h2>
          <p style={{ color: '#666', maxWidth: '650px', margin: '0 auto', lineHeight: 1.8, fontSize: '15px' }}>
            Women in Design platform connects you with professional services and quality suppliers to bring your vision to life.
          </p>
        </div>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto 60px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '35px' 
        }}>
          {/* Interior Design Card */}
          <div 
            onClick={() => handleDesignerClick('interior')}
            style={{ 
              background: 'white', 
              borderRadius: '15px', 
              overflow: 'hidden', 
              boxShadow: '0 5px 25px rgba(144, 238, 144, 0.15), 0 2px 10px rgba(85, 107, 47, 0.1)', 
              border: '1px solid rgba(144, 238, 144, 0.2)',
              position: 'relative', 
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(144, 238, 144, 0.25), 0 5px 20px rgba(85, 107, 47, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 25px rgba(144, 238, 144, 0.15), 0 2px 10px rgba(85, 107, 47, 0.1)';
            }}
          >
            <img 
              src="/images/1000579832.jpg"
              alt="Women in Design - Beautiful Interior Design Services"
              style={{ 
                width: '100%', 
                height: '280px',
                objectFit: 'cover'
              }}
            />
            <div style={{ 
              position: 'absolute', 
              top: '235px', 
              right: '35px', 
              width: '70px', 
              height: '70px', 
              background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontSize: '28px', 
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)' 
            }}>
              🏠
            </div>
            <div style={{ padding: '50px 35px 35px' }}>
              <div style={{ color: '#90ee90', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px' }}>
                SERVICE ONE
              </div>
              <h3 style={{ fontSize: '24px', color: '#8b4f9f', marginBottom: '18px', lineHeight: 1.4 }}>
                Interior Design Services
              </h3>
              <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '25px', fontSize: '14px' }}>
                Transform your spaces with our talented interior designers who create beautiful, functional environments.
              </p>
              <span style={{ 
                color: '#90ee90', 
                fontWeight: 'bold', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '14px' 
              }}>
                Explore Designers <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Architecture Card */}
          <div 
            onClick={() => handleDesignerClick('architecture')}
            style={{ 
              background: 'white', 
              borderRadius: '15px', 
              overflow: 'hidden', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.08)', 
              position: 'relative', 
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(144, 238, 144, 0.25), 0 5px 20px rgba(85, 107, 47, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 25px rgba(144, 238, 144, 0.15), 0 2px 10px rgba(85, 107, 47, 0.1)';
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
              alt="Modern Architecture Design"
              style={{ 
                width: '100%', 
                height: '280px',
                objectFit: 'cover'
              }}
            />
            <div style={{ 
              position: 'absolute', 
              top: '235px', 
              right: '35px', 
              width: '70px', 
              height: '70px', 
              background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontSize: '28px', 
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)' 
            }}>
              🏗️
            </div>
            <div style={{ padding: '50px 35px 35px' }}>
              <div style={{ color: '#90ee90', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px' }}>
                SERVICE TWO
              </div>
              <h3 style={{ fontSize: '24px', color: '#8b4f9f', marginBottom: '18px', lineHeight: 1.4 }}>
                Architecture Services
              </h3>
              <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '25px', fontSize: '14px' }}>
                Professional architectural design from concept to completion with our certified women architects.
              </p>
              <span style={{ 
                color: '#90ee90', 
                fontWeight: 'bold', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '14px' 
              }}>
                Find Architects <ArrowRight size={14} />
              </span>
            </div>
          </div>

          {/* Suppliers Card */}
          <div 
            onClick={() => handleSupplierClick('suppliers')}
            style={{ 
              background: 'white', 
              borderRadius: '15px', 
              overflow: 'hidden', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.08)', 
              position: 'relative', 
              transition: 'transform 0.3s, box-shadow 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(144, 238, 144, 0.25), 0 5px 20px rgba(85, 107, 47, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 25px rgba(144, 238, 144, 0.15), 0 2px 10px rgba(85, 107, 47, 0.1)';
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
              alt="Design Materials & Supplies"
              style={{ 
                width: '100%', 
                height: '280px',
                objectFit: 'cover'
              }}
            />
            <div style={{ 
              position: 'absolute', 
              top: '235px', 
              right: '35px', 
              width: '70px', 
              height: '70px', 
              background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontSize: '28px', 
              boxShadow: '0 5px 15px rgba(0,0,0,0.2)' 
            }}>
              📦
            </div>
            <div style={{ padding: '50px 35px 35px' }}>
              <div style={{ color: '#90ee90', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '1px' }}>
                SERVICE THREE
              </div>
              <h3 style={{ fontSize: '24px', color: '#8b4f9f', marginBottom: '18px', lineHeight: 1.4 }}>
                Quality Suppliers Network
              </h3>
              <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '25px', fontSize: '14px' }}>
                Connect with verified suppliers offering materials, furniture, and services for your design projects.
              </p>
              <span style={{ 
                color: '#90ee90', 
                fontWeight: 'bold', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '14px' 
              }}>
                Browse Suppliers <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '60px' }}>
          <button style={{ 
            width: '45px', 
            height: '45px', 
            border: '2px solid #556b2f', 
            background: 'white', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            color: '#2d4016', 
            fontWeight: 'bold', 
            fontSize: '16px' 
          }}>
            ←
          </button>
          <button style={{ 
            width: '45px', 
            height: '45px', 
            border: '2px solid #556b2f', 
            background: '#556b2f', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '16px' 
          }}>
            1
          </button>
          <button style={{ 
            width: '45px', 
            height: '45px', 
            border: '2px solid #556b2f', 
            background: 'white', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            color: '#2d4016', 
            fontWeight: 'bold', 
            fontSize: '16px' 
          }}>
            →
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '100px 5%', background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
              color: 'white', 
              padding: '8px 22px', 
              borderRadius: '20px', 
              display: 'inline-block', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              marginBottom: '25px', 
              textTransform: 'uppercase', 
              letterSpacing: '1px' 
            }}>
              Client Stories
            </span>
            <h2 style={{ fontSize: '42px', color: '#8b4f9f', marginBottom: '20px' }}>
              What Our Clients Say
            </h2>
            <p style={{ color: '#666', maxWidth: '650px', margin: '0 auto', lineHeight: 1.8, fontSize: '15px' }}>
              Real experiences from satisfied clients who found their perfect design partners through our platform.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '40px' 
          }}>
            {/* Testimonial 1 */}
            <div style={{ 
              background: 'white', 
              borderRadius: '15px', 
              padding: '40px 30px', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                alt="Sarah Nakato"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 20px',
                  border: '4px solid #90ee90'
                }}
              />
              <div style={{ marginBottom: '20px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#ffd700', fontSize: '18px' }}>★</span>
                ))}
              </div>
              <p style={{ 
                color: '#666', 
                lineHeight: 1.6, 
                marginBottom: '25px', 
                fontSize: '15px',
                fontStyle: 'italic'
              }}>
                "Women in Design helped me find the perfect interior designer for our office renovation. The quality and professionalism exceeded our expectations."
              </p>
              <h4 style={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}>Sarah Nakato</h4>
              <p style={{ color: '#8b4f9f', fontSize: '14px' }}>CEO, Modern Homes Ltd</p>
            </div>

            {/* Testimonial 2 */}
            <div style={{ 
              background: 'white', 
              borderRadius: '15px', 
              padding: '40px 30px', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                alt="James Okello"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 20px',
                  border: '4px solid #90ee90'
                }}
              />
              <div style={{ marginBottom: '20px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#ffd700', fontSize: '18px' }}>★</span>
                ))}
              </div>
              <p style={{ 
                color: '#666', 
                lineHeight: 1.6, 
                marginBottom: '25px', 
                fontSize: '15px',
                fontStyle: 'italic'
              }}>
                "The suppliers I found through this platform provided high-quality furniture at competitive prices. The process was seamless and professional."
              </p>
              <h4 style={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}>James Okello</h4>
              <p style={{ color: '#8b4f9f', fontSize: '14px' }}>Restaurant Owner</p>
            </div>

            {/* Testimonial 3 */}
            <div style={{ 
              background: 'white', 
              borderRadius: '15px', 
              padding: '40px 30px', 
              boxShadow: '0 5px 25px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                alt="Grace Mukasa"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 20px',
                  border: '4px solid #90ee90'
                }}
              />
              <div style={{ marginBottom: '20px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#ffd700', fontSize: '18px' }}>★</span>
                ))}
              </div>
              <p style={{ 
                color: '#666', 
                lineHeight: 1.6, 
                marginBottom: '25px', 
                fontSize: '15px',
                fontStyle: 'italic'
              }}>
                "From concept to completion, the designer I hired was amazing. The contact fee was worth every penny for the quality of service received."
              </p>
              <h4 style={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}>Grace Mukasa</h4>
              <p style={{ color: '#8b4f9f', fontSize: '14px' }}>Homeowner</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #2d4016, #556b2f)', 
        padding: '80px 5%',
        backgroundImage: `linear-gradient(rgba(45, 64, 22, 0.9), rgba(85, 107, 47, 0.9)), url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '20px' }}>
            Ready to Transform Your Space?
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '40px', color: 'rgba(255, 255, 255, 0.9)' }}>
            Join thousands of satisfied clients who found their perfect design partners through Women in Design platform.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register">
              <button style={{ 
                background: 'linear-gradient(135deg, #90ee90, #7bcf7b)', 
                color: 'white', 
                padding: '16px 40px', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                Get Started Today <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/landing/about">
              <button style={{ 
                background: 'transparent', 
                color: 'white', 
                padding: '16px 40px', 
                border: '2px solid white', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '16px'
              }}>
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer with Social Media */}
      <footer style={{ 
        background: 'linear-gradient(135deg, #2d4016, #556b2f)', 
        padding: '60px 5% 40px', 
        color: 'white' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Company Info */}
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#90ee90' }}>
                Women in Design Uganda
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, marginBottom: '25px' }}>
                Empowering women designers and connecting them with clients and suppliers across Uganda for creative collaboration and business growth.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <MapPin size={16} />
                <span>Kampala, Uganda</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ fontSize: '18px', marginBottom: '20px', color: '#90ee90' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}>
                  <Link href="/landing/designers" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>
                    Find Designers
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href="/landing/suppliers" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>
                    Browse Suppliers
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href="/landing/about" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>
                    About Us
                  </Link>
                </li>
                <li style={{ marginBottom: '12px' }}>
                  <Link href="/auth/register" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', transition: 'color 0.2s' }}>
                    Join Platform
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Social Media */}
            <div>
              <h4 style={{ fontSize: '18px', marginBottom: '20px', color: '#90ee90' }}>
                Connect With Us
              </h4>
              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <Phone size={16} />
                  <span>+256 700 123 456</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <Globe size={16} />
                  <span>info@womenindesignuganda.com</span>
                </div>
              </div>
              
              <div>
                <h5 style={{ fontSize: '16px', marginBottom: '15px', color: '#90ee90' }}>
                  Follow Us
                </h5>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <a 
                    href="https://www.instagram.com/womenindesignug" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '45px',
                      height: '45px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title="Follow us on Instagram"
                  >
                    <span style={{ fontSize: '20px' }}>📷</span>
                  </a>
                  <a 
                    href="https://www.tiktok.com/@womenindesignug?_t=ZM-90qV76PMgsS&_r=1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '45px',
                      height: '45px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title="Follow us on TikTok"
                  >
                    <span style={{ fontSize: '20px' }}>🎵</span>
                  </a>
                  <a 
                    href="#" 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '45px',
                      height: '45px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title="Follow us on Facebook"
                  >
                    <span style={{ fontSize: '20px' }}>📘</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
            paddingTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              © 2024 Women in Design Uganda Ltd. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
              <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>
                Terms of Service
              </Link>
              <Link href="#" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}>
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>

        {/* Additional decorative elements */}
        <div style={{
          position: 'fixed',
          top: '10%',
          right: '2%',
          width: '8px',
          height: '8px',
          background: '#90ee90',
          borderRadius: '50%',
          opacity: 0.3,
          animation: 'pulse 3s ease-in-out infinite',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '2%',
          width: '6px',
          height: '6px',
          background: '#556b2f',
          borderRadius: '50%',
          opacity: 0.4,
          animation: 'pulse 4s ease-in-out infinite',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'fixed',
          bottom: '20%',
          right: '3%',
          width: '10px',
          height: '10px',
          background: '#2d4016',
          borderRadius: '50%',
          opacity: 0.2,
          animation: 'float 7s ease-in-out infinite',
          zIndex: 1
        }}></div>
      </div>
    </>
  );
}