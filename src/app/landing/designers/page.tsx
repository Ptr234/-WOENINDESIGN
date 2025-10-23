'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, Eye, Filter, Search, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PublicDesigner {
  id: string;
  name: string;
  specialty: string[];
  location: string;
  rating: number;
  completedProjects: number;
  yearsOfExperience: number;
  profileImage?: string;
  isVerified: boolean;
  sampleWorkTitle: string;
  sampleWorkDescription: string;
}

export default function PublicDesignersPage() {
  const [designers, setDesigners] = useState<PublicDesigner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const specialties = [
    'Interior Design',
    'Architecture', 
    'Landscape Design',
    'Graphic Design',
    'Fashion Design',
    'Product Design',
    'Industrial Design',
    'UX/UI Design'
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
    fetchDesigners();
  }, [selectedSpecialty, selectedLocation]);

  const fetchDesigners = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append('specialty', selectedSpecialty);
      if (selectedLocation) params.append('location', selectedLocation);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/public/designers?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDesigners(data.data);
      } else {
        // Fallback to static data if API fails
        const { staticDesigners } = await import('../../../../lib/staticData');
        setDesigners(staticDesigners);
      }
    } catch (error) {
      console.error('Failed to fetch designers:', error);
      // Fallback to static data on error
      try {
        const { staticDesigners } = await import('../../../../lib/staticData');
        setDesigners(staticDesigners);
      } catch (fallbackError) {
        console.error('Failed to load fallback data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDesigners();
  };

  const handleDesignerClick = (designerId: string) => {
    window.location.href = `/landing/designers/${designerId}`;
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
            <Heart size={32} style={{ color: '#90ee90' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>Talented Women Designers</h1>
          </div>
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'rgba(255, 255, 255, 0.9)', 
            maxWidth: '48rem', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover creative professionals ready to transform your spaces with innovative design solutions
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
                placeholder="Search designers..."
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

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
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
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
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
                <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
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
                {designers.length} Designer{designers.length !== 1 ? 's' : ''} Found
              </h2>
              <div className="text-sm text-gray-600">
                Click any designer to learn more
              </div>
            </div>

            {designers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designers.map((designer) => (
                  <div 
                    key={designer.id}
                    onClick={() => handleDesignerClick(designer.id)}
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
                      backgroundImage: designer.profileImage ? `url(${designer.profileImage})` : 'linear-gradient(135deg, #90ee90, #7bcf7b)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
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
                    {/* Background Image */}
                    {!designer.profileImage && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, #90ee90, #7bcf7b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {designer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}

                    {/* Dark overlay for better text readability */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)'
                    }} />
                    
                    {/* Top overlay with name and verified badge */}
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
                      {/* Designer name */}
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'white',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {designer.name}
                      </h3>

                      {/* Verified badge */}
                      {designer.isVerified && (
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
                          {designer.location}
                        </div>
                      </div>

                      {/* Specialties */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        {designer.specialty.slice(0, 2).map((spec) => (
                          <span
                            key={spec}
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
                            {spec}
                          </span>
                        ))}
                        {designer.specialty.length > 2 && (
                          <span style={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: '#6b7280',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backdropFilter: 'blur(4px)'
                          }}>
                            +{designer.specialty.length - 2} more
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
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{designer.rating}</span>
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
                            {designer.completedProjects}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Projects</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '0.25rem',
                            color: '#1f2937'
                          }}>
                            {designer.yearsOfExperience}y
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Experience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-black mb-2">No designers found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                    setSelectedLocation('');
                    fetchDesigners();
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h3>
          <p className="text-pink-100 mb-6">
            Join our platform to access full designer profiles, portfolios, and start collaborating
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