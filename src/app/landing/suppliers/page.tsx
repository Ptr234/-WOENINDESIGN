'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, Eye, Search, ChevronRight, Building, Package, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PublicSupplier {
  id: string;
  businessName: string;
  category: string[];
  location: string;
  rating: number;
  businessDescription: string;
  deliveryAreas: string[];
  minimumOrder: number;
  paymentMethods: string[];
  businessHours: string;
  isVerified: boolean;
  productCount: number;
  sampleProducts: string[];
}

export default function PublicSuppliersPage() {
  const [suppliers, setSuppliers] = useState<PublicSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const categories = [
    'Furniture',
    'Lighting',
    'Textiles & Fabrics',
    'Construction Materials',
    'Decor & Accessories',
    'Kitchen & Bath Fixtures',
    'Flooring',
    'Paint & Finishes',
    'Hardware',
    'Outdoor & Garden'
  ];

  const locations = [
    'Kampala',
    'Entebbe', 
    'Mukono',
    'Jinja',
    'Mbale',
    'Mbarara',
    'Gulu',
    'Fort Portal'
  ];

  useEffect(() => {
    fetchSuppliers();
  }, [selectedCategory, selectedLocation]);

  const fetchSuppliers = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLocation) params.append('location', selectedLocation);
      if (searchTerm) params.append('q', searchTerm);

      const response = await fetch(`/api/public/suppliers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(data.data);
      } else {
        // Fallback to static data if API fails
        const { staticSuppliers } = await import('../../../../lib/staticData');
        setSuppliers(staticSuppliers);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      // Fallback to static data on error
      try {
        const { staticSuppliers } = await import('../../../../lib/staticData');
        setSuppliers(staticSuppliers);
      } catch (fallbackError) {
        console.error('Failed to load fallback data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSuppliers();
  };

  const handleSupplierClick = (supplierId: string) => {
    window.location.href = `/landing/suppliers/${supplierId}`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f5dc, #e8e8e8)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2d4016, #556b2f)',
        color: 'white'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '4rem 1rem', 
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building size={32} style={{ color: '#90ee90' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>Verified Suppliers</h1>
          </div>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'rgba(255, 255, 255, 0.9)', 
            maxWidth: '48rem', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Connect with trusted suppliers offering quality materials and services for your design projects
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div style={{
          background: 'linear-gradient(135deg, #556b2f, #2d4016)',
          borderRadius: '15px',
          boxShadow: '0 10px 40px rgba(85, 107, 47, 0.15)',
          border: '1px solid rgba(144, 238, 144, 0.2)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem'
          }}>
            {/* Search */}
            <div className="relative">
              <Search style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#556b2f' 
              }} size={20} />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: 'white',
                  color: 'black'
                }}
                onFocus={(e) => e.target.style.borderColor = '#90ee90'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f5f5f5',
                color: 'black'
              }}
              onFocus={(e) => e.target.style.borderColor = '#90ee90'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f5f5f5',
                color: 'black'
              }}
              onFocus={(e) => e.target.style.borderColor = '#90ee90'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Search Button */}
            <button 
              onClick={handleSearch} 
              style={{
                width: '100%',
                background: '#f5f5dc',
                color: 'black',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8e8dc';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5dc';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-300 animate-pulse">
                <div className="h-40 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">
                {suppliers.length} Supplier{suppliers.length !== 1 ? 's' : ''} Found
              </h2>
              <div className="text-sm text-gray-600">
                Click any supplier to learn more
              </div>
            </div>

            {suppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <div 
                    key={supplier.id}
                    onClick={() => handleSupplierClick(supplier.id)}
                    style={{
                      position: 'relative',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      border: '2px solid #90ee90',
                      boxShadow: '0 8px 25px rgba(144, 238, 144, 0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0)',
                      height: '400px',
                      background: 'linear-gradient(135deg, #90ee90, #7bcf7b)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(144, 238, 144, 0.25)';
                      e.currentTarget.style.borderColor = '#7bcf7b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(144, 238, 144, 0.15)';
                      e.currentTarget.style.borderColor = '#90ee90';
                    }}
                  >
                    {/* Background gradient with company initials */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, #90ee90, #7bcf7b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '6rem',
                      fontWeight: 'bold',
                      color: 'rgba(255,255,255,0.3)'
                    }}>
                      {supplier.businessName.split(' ').map(word => word[0]).join('').toUpperCase()}
                    </div>

                    {/* Dark overlay for better text readability */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)'
                    }} />
                    
                    {/* Top overlay with business name and verified badge */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      {/* Business name */}
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'white',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        backdropFilter: 'blur(4px)',
                        maxWidth: '70%'
                      }}>
                        {supplier.businessName}
                      </h3>

                      {/* Verified badge */}
                      {supplier.isVerified && (
                        <div style={{
                          background: 'rgba(34, 197, 94, 0.9)',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          backdropFilter: 'blur(4px)'
                        }}>
                          ✓ Verified
                        </div>
                      )}
                    </div>

                    {/* Business icon */}
                    <div style={{
                      position: 'absolute',
                      top: '2rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: 'white',
                      opacity: 0.9
                    }}>
                      <Building size={48} />
                    </div>

                    {/* Content overlay at bottom */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '1.5rem',
                      color: 'white'
                    }}>
                      {/* Location Info */}
                      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '0.875rem'
                        }}>
                          <MapPin size={14} style={{ marginRight: '0.25rem' }} />
                          {supplier.location}
                        </div>
                      </div>

                      {/* Categories */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        {supplier.category.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            style={{
                              backgroundColor: 'rgba(220, 252, 231, 0.9)',
                              color: '#166534',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                        {supplier.category.length > 2 && (
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#6b7280',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backdropFilter: 'blur(4px)'
                          }}>
                            +{supplier.category.length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(8px)'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            marginBottom: '0.25rem'
                          }}>
                            <Star style={{ color: '#fbbf24', fill: 'currentColor' }} size={16} />
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{supplier.rating}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Rating</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.25rem',
                            color: '#1f2937'
                          }}>
                            {supplier.productCount}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Products</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.25rem',
                            color: '#1f2937'
                          }}>
                            {supplier.deliveryAreas.length}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Areas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-black mb-2">No suppliers found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedLocation('');
                    fetchSuppliers();
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </>
        )}

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Quality Products</h3>
            <p className="text-gray-600 text-sm">All suppliers are verified and offer high-quality materials and services</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Direct Contact</h3>
            <p className="text-gray-600 text-sm">Connect directly with suppliers for custom quotes and bulk orders</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-300">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Trusted Reviews</h3>
            <p className="text-gray-600 text-sm">Read reviews from other clients to make informed decisions</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Source Quality Materials?</h3>
          <p className="text-purple-100 mb-6">
            Join our platform to access full supplier catalogs, pricing, and direct contact information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-cream-100 font-semibold">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}