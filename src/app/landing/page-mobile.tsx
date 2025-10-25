'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Star, Users, Building, Heart, CheckCircle, Quote, ChevronRight, Eye, Phone, Globe, Clock, MapPin, LayoutDashboard, Menu, X } from 'lucide-react';

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

export default function MobileLandingPage() {
  const [featuredDesigners, setFeaturedDesigners] = useState<FeaturedDesigner[]>([]);
  const [featuredSuppliers, setFeaturedSuppliers] = useState<FeaturedSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchFeaturedContent();
    checkAuth();
  }, []);

  const getDashboardLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Admin Dashboard';
      case 'client': return 'Client Dashboard';
      case 'designer': return 'Designer Dashboard';
      case 'supplier': return 'Supplier Dashboard';
      default: return 'Dashboard';
    }
  };

  const fetchFeaturedContent = async () => {
    try {
      setError(null);
      
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
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/landing');
    } catch (error) {
      console.error('Logout failed:', error);
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
      {/* Mobile Styles Import */}
      <link rel="stylesheet" href="/styles/mobile-responsive.css" />
      
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Mobile Top Bar */}
        <div className="bg-gradient-to-r from-cream-100 to-gray-100 px-4 py-2 text-xs border-b border-gray-200">
          <div className="mobile-container mobile-flex mobile-justify-between mobile-items-center">
            <div className="mobile-flex mobile-items-center mobile-gap-md">
              <span className="text-gray-600">📧 info@womenindesign.community</span>
              <span className="hidden sm:inline text-gray-600">📞 +256 700 123 456</span>
            </div>
            <div className="mobile-flex mobile-items-center mobile-gap-sm">
              <a href="https://www.instagram.com/womenindesignug" target="_blank" rel="noopener noreferrer" 
                 className="touch-target text-green-600 hover:text-green-700" title="Instagram">
                📷
              </a>
              <a href="https://www.tiktok.com/@womenindesignug" target="_blank" rel="noopener noreferrer"
                 className="touch-target text-green-600 hover:text-green-700" title="TikTok">
                📺
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <header className="mobile-nav-fixed bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
          <div className="mobile-container">
            <div className="mobile-flex mobile-justify-between mobile-items-center h-16">
              {/* Logo */}
              <Link href="/landing" className="mobile-flex mobile-items-center mobile-gap-sm">
                <Image 
                  src="/images/WOMEN.jpeg" 
                  alt="WID Logo" 
                  width={32} 
                  height={32}
                  className="rounded-md"
                />
                <div className="mobile-heading-3 text-white font-bold">
                  WID Uganda
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex mobile-items-center mobile-gap-lg">
                <Link href="/landing" className="touch-target text-white hover:text-green-200 transition-colors">
                  Home
                </Link>
                <Link href="/landing/designers" className="touch-target text-white hover:text-green-200 transition-colors">
                  Designers
                </Link>
                <Link href="/landing/suppliers" className="touch-target text-white hover:text-green-200 transition-colors">
                  Suppliers
                </Link>
                <Link href="/landing/about" className="touch-target text-white hover:text-green-200 transition-colors">
                  About
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden touch-target text-white"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Auth Section - Desktop */}
              <div className="hidden lg:flex mobile-items-center mobile-gap-md">
                {isAuthenticated ? (
                  <div className="mobile-flex mobile-items-center mobile-gap-md">
                    <span className="mobile-small">Welcome, {user?.firstName}</span>
                    <button 
                      onClick={handleLogout}
                      className="mobile-btn mobile-btn-secondary"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mobile-flex mobile-items-center mobile-gap-md">
                    <Link href="/auth/login" className="mobile-btn mobile-btn-secondary">
                      Login
                    </Link>
                    <Link href="/auth/register" className="mobile-btn mobile-btn-primary">
                      Join Us
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="lg:hidden mobile-animate-slide-up bg-white rounded-b-lg shadow-xl border-t border-gray-200 py-4">
                <nav className="mobile-flex mobile-flex-col mobile-gap-sm">
                  <Link 
                    href="/landing" 
                    className="mobile-flex mobile-items-center mobile-gap-sm p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🏠</span> Home
                  </Link>
                  <Link 
                    href="/landing/designers" 
                    className="mobile-flex mobile-items-center mobile-gap-sm p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🎨</span> Designers
                  </Link>
                  <Link 
                    href="/landing/suppliers" 
                    className="mobile-flex mobile-items-center mobile-gap-sm p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🏪</span> Suppliers
                  </Link>
                  <Link 
                    href="/landing/about" 
                    className="mobile-flex mobile-items-center mobile-gap-sm p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>ℹ️</span> About
                  </Link>
                  
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    {isAuthenticated ? (
                      <div className="mobile-flex mobile-flex-col mobile-gap-sm">
                        <div className="px-3 text-gray-600 mobile-small">
                          Welcome, {user?.firstName}
                        </div>
                        <button 
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="mobile-btn mobile-btn-secondary w-full"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="mobile-flex mobile-flex-col mobile-gap-sm">
                        <Link 
                          href="/auth/login" 
                          className="mobile-btn mobile-btn-secondary w-full"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link 
                          href="/auth/register" 
                          className="mobile-btn mobile-btn-primary w-full"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Join Us
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Hero Section */}
        <section className="mobile-section bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white relative overflow-hidden pt-20">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-green-300"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-green-200"></div>
          </div>

          <div className="mobile-container relative z-10">
            <div className="mobile-grid lg:grid-cols-2 mobile-gap-xl mobile-items-center">
              {/* Hero Content */}
              <div className="mobile-text-center lg:text-left mobile-animate-fade-in">
                <h1 className="mobile-heading-1 text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  Empowering Women <br />
                  <span className="text-green-200">Designers</span> in Uganda
                </h1>
                <p className="mobile-body text-lg mb-8 text-green-100 max-w-lg mx-auto lg:mx-0">
                  Connect with talented female designers, discover quality suppliers, 
                  and bring your creative vision to life with Uganda's premier design platform.
                </p>
                <div className="mobile-flex mobile-flex-col sm:flex-row mobile-gap-md mobile-justify-center lg:justify-start">
                  <Link href="/auth/register" className="mobile-btn mobile-btn-primary mobile-w-full sm:w-auto">
                    Join Our Community
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/landing/designers" className="mobile-btn mobile-btn-secondary mobile-w-full sm:w-auto">
                    Browse Designers
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <div className="mobile-animate-fade-in">
                <div className="relative">
                  <img 
                    src="/images/WOMEN.jpeg"
                    alt="Women in Design Uganda Community"
                    className="mobile-image-hero shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-12"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="mobile-heading-3 font-bold mb-2">Our Community</h3>
                    <p className="mobile-small">500+ talented women designers across Uganda</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Statistics Section */}
        <section className="mobile-section bg-white">
          <div className="mobile-container">
            <div className="mobile-grid mobile-grid-responsive mobile-text-center">
              <div className="mobile-card mobile-animate-fade-in">
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <div className="mobile-heading-3 text-gray-800 mb-2">Designers</div>
                <p className="mobile-small text-gray-600">Talented women designers ready to transform your space</p>
              </div>
              <div className="mobile-card mobile-animate-fade-in">
                <div className="text-4xl font-bold text-green-600 mb-2">200+</div>
                <div className="mobile-heading-3 text-gray-800 mb-2">Suppliers</div>
                <p className="mobile-small text-gray-600">Quality suppliers for all your design needs</p>
              </div>
              <div className="mobile-card mobile-animate-fade-in">
                <div className="text-4xl font-bold text-green-600 mb-2">1,200+</div>
                <div className="mobile-heading-3 text-gray-800 mb-2">Projects</div>
                <p className="mobile-small text-gray-600">Successfully completed design projects</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Services Section */}
        <section className="mobile-section bg-gray-50">
          <div className="mobile-container">
            <div className="mobile-text-center mobile-mb-xl">
              <h2 className="mobile-heading-1 text-gray-800 mb-4">Our Services</h2>
              <p className="mobile-body text-gray-600 max-w-2xl mx-auto">
                Discover the full range of design services and supplier partnerships available through our platform
              </p>
            </div>

            <div className="mobile-grid mobile-grid-responsive">
              {/* Interior Design Service */}
              <div className="mobile-card mobile-animate-fade-in group hover:shadow-xl transition-all duration-300">
                <img 
                  src="/images/1000579832.jpg"
                  alt="Interior Design Services"
                  className="mobile-image-card mb-4"
                />
                <h3 className="mobile-heading-3 text-gray-800 mb-3">Interior Design</h3>
                <p className="mobile-body text-gray-600 mb-4">
                  Transform your living and working spaces with our talented interior designers who understand Ugandan aesthetics and modern trends.
                </p>
                <Link href="/landing/designers" className="mobile-btn mobile-btn-primary mobile-w-full">
                  Find Designers
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Architecture Service */}
              <div className="mobile-card mobile-animate-fade-in group hover:shadow-xl transition-all duration-300">
                <img 
                  src="/images/1000579811.jpg"
                  alt="Architecture Services"
                  className="mobile-image-card mb-4"
                />
                <h3 className="mobile-heading-3 text-gray-800 mb-3">Architecture</h3>
                <p className="mobile-body text-gray-600 mb-4">
                  Design and plan your dream buildings with certified female architects who bring innovation and sustainability to every project.
                </p>
                <Link href="/landing/designers" className="mobile-btn mobile-btn-primary mobile-w-full">
                  View Architects
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Suppliers Service */}
              <div className="mobile-card mobile-animate-fade-in group hover:shadow-xl transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=200&fit=crop"
                  alt="Design Suppliers"
                  className="mobile-image-card mb-4"
                />
                <h3 className="mobile-heading-3 text-gray-800 mb-3">Quality Suppliers</h3>
                <p className="mobile-body text-gray-600 mb-4">
                  Source the best materials, furniture, and design elements from our network of verified local and international suppliers.
                </p>
                <Link href="/landing/suppliers" className="mobile-btn mobile-btn-primary mobile-w-full">
                  Browse Suppliers
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Featured Designers */}
        {!loading && featuredDesigners.length > 0 && (
          <section className="mobile-section bg-white">
            <div className="mobile-container">
              <div className="mobile-text-center mobile-mb-xl">
                <h2 className="mobile-heading-1 text-gray-800 mb-4">Featured Designers</h2>
                <p className="mobile-body text-gray-600">
                  Meet some of our most talented and experienced designers
                </p>
              </div>

              <div className="mobile-grid mobile-grid-responsive">
                {featuredDesigners.slice(0, 6).map((designer) => (
                  <div 
                    key={designer.id} 
                    className="mobile-card mobile-animate-fade-in cursor-pointer group hover:shadow-xl transition-all duration-300"
                    onClick={() => handleDesignerClick(designer.id)}
                  >
                    <div className="mobile-flex mobile-items-center mobile-gap-md mobile-mb-md">
                      <img 
                        src={designer.profileImage || "/images/WOMEN.jpeg"}
                        alt={designer.name}
                        className="mobile-image-profile"
                      />
                      <div>
                        <h3 className="mobile-heading-3 text-gray-800">{designer.name}</h3>
                        <p className="mobile-small text-green-600 font-medium">{designer.specialty}</p>
                        <div className="mobile-flex mobile-items-center mobile-gap-sm mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="mobile-small text-gray-600">{designer.rating}</span>
                          <span className="mobile-small text-gray-500">• {designer.completedProjects} projects</span>
                        </div>
                      </div>
                    </div>
                    <img 
                      src={designer.sampleWork}
                      alt={`${designer.name} portfolio`}
                      className="mobile-image-card mb-3"
                    />
                    <p className="mobile-small text-gray-600 mb-3">{designer.location}</p>
                    <button className="mobile-btn mobile-btn-secondary mobile-w-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                      View Profile
                      <Eye size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mobile-text-center mt-8">
                <Link href="/landing/designers" className="mobile-btn mobile-btn-primary">
                  View All Designers
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Mobile Testimonials */}
        <section className="mobile-section bg-gray-50">
          <div className="mobile-container">
            <div className="mobile-text-center mobile-mb-xl">
              <h2 className="mobile-heading-1 text-gray-800 mb-4">What Our Clients Say</h2>
              <p className="mobile-body text-gray-600">
                Real experiences from real clients
              </p>
            </div>

            <div className="mobile-grid mobile-grid-responsive">
              <div className="mobile-card mobile-text-center mobile-animate-fade-in">
                <Quote className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <p className="mobile-body text-gray-700 mb-4 italic">
                  "The designers on this platform are incredibly talented. They transformed our home beyond our expectations!"
                </p>
                <div className="mobile-flex mobile-items-center mobile-justify-center mobile-gap-md">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face"
                    alt="Sarah Nakato"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Sarah Nakato</div>
                    <div className="mobile-small text-gray-600">Kampala</div>
                  </div>
                </div>
              </div>

              <div className="mobile-card mobile-text-center mobile-animate-fade-in">
                <Quote className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <p className="mobile-body text-gray-700 mb-4 italic">
                  "Professional service, amazing results. I highly recommend this platform to anyone looking for quality design."
                </p>
                <div className="mobile-flex mobile-items-center mobile-justify-center mobile-gap-md">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                    alt="James Okello"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">James Okello</div>
                    <div className="mobile-small text-gray-600">Entebbe</div>
                  </div>
                </div>
              </div>

              <div className="mobile-card mobile-text-center mobile-animate-fade-in">
                <Quote className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <p className="mobile-body text-gray-700 mb-4 italic">
                  "Finding quality suppliers through this platform made our renovation project so much easier and affordable."
                </p>
                <div className="mobile-flex mobile-items-center mobile-justify-center mobile-gap-md">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
                    alt="Grace Mukasa"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Grace Mukasa</div>
                    <div className="mobile-small text-gray-600">Jinja</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Footer */}
        <footer className="bg-gradient-to-r from-green-800 to-green-700 text-white">
          <div className="mobile-container mobile-section">
            <div className="mobile-grid lg:grid-cols-4 mobile-gap-xl">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="mobile-flex mobile-items-center mobile-gap-sm mobile-mb-md">
                  <Image 
                    src="/images/WOMEN.jpeg" 
                    alt="WID Logo" 
                    width={40} 
                    height={40}
                    className="rounded-md"
                  />
                  <h3 className="mobile-heading-2 font-bold">WID Uganda</h3>
                </div>
                <p className="mobile-body text-green-100 mb-6 max-w-md">
                  Empowering women designers across Uganda and connecting them with clients who value quality, creativity, and local talent.
                </p>
                <div className="mobile-flex mobile-gap-md">
                  <a href="https://www.instagram.com/womenindesignug" target="_blank" rel="noopener noreferrer" 
                     className="touch-target bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
                    📷
                  </a>
                  <a href="https://www.tiktok.com/@womenindesignug" target="_blank" rel="noopener noreferrer"
                     className="touch-target bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
                    📺
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="mobile-heading-3 font-semibold mb-4">Quick Links</h4>
                <nav className="mobile-flex mobile-flex-col mobile-gap-sm">
                  <Link href="/landing" className="text-green-100 hover:text-white transition-colors">Home</Link>
                  <Link href="/landing/designers" className="text-green-100 hover:text-white transition-colors">Designers</Link>
                  <Link href="/landing/suppliers" className="text-green-100 hover:text-white transition-colors">Suppliers</Link>
                  <Link href="/landing/about" className="text-green-100 hover:text-white transition-colors">About Us</Link>
                </nav>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="mobile-heading-3 font-semibold mb-4">Contact Us</h4>
                <div className="mobile-flex mobile-flex-col mobile-gap-sm text-green-100">
                  <div className="mobile-flex mobile-items-center mobile-gap-sm">
                    <Phone size={16} />
                    <span>+256 700 123 456</span>
                  </div>
                  <div className="mobile-flex mobile-items-center mobile-gap-sm">
                    <Globe size={16} />
                    <span>info@womenindesign.community</span>
                  </div>
                  <div className="mobile-flex mobile-items-center mobile-gap-sm">
                    <MapPin size={16} />
                    <span>Kampala, Uganda</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-green-600 mt-8 pt-8 mobile-text-center">
              <p className="mobile-small text-green-100">
                © 2024 Women in Design Uganda. All rights reserved. Built with 💚 for Ugandan women designers.
              </p>
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden mobile-nav-bottom">
          <div className="mobile-container">
            <div className="mobile-grid grid-cols-5 mobile-gap-sm">
              <Link href="/landing" className="mobile-nav-item active">
                <span className="text-xl">🏠</span>
                <span className="mobile-nav-label">Home</span>
              </Link>
              <Link href="/landing/designers" className="mobile-nav-item">
                <span className="text-xl">🎨</span>
                <span className="mobile-nav-label">Designers</span>
              </Link>
              <Link href="/landing/suppliers" className="mobile-nav-item">
                <span className="text-xl">🏪</span>
                <span className="mobile-nav-label">Suppliers</span>
              </Link>
              <Link href="/auth/login" className="mobile-nav-item">
                <span className="text-xl">👤</span>
                <span className="mobile-nav-label">Account</span>
              </Link>
              <Link href="/landing/about" className="mobile-nav-item">
                <span className="text-xl">ℹ️</span>
                <span className="mobile-nav-label">About</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Safe Area Bottom Padding */}
        <div className="mobile-safe-bottom lg:hidden h-20"></div>
      </div>
    </>
  );
}