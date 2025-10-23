'use client';

import { useState, useEffect } from 'react';
import { DesignerProfile, SearchFilters, SearchResults, DesignSpecialty } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function DesignersPage() {
  const [designers, setDesigners] = useState<SearchResults<DesignerProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const specialties: DesignSpecialty[] = [
    'Interior Design',
    'Architecture',
    'Landscape Design',
    'Graphic Design',
    'Industrial Design',
    'Fashion Design',
    'Product Design',
    'UX/UI Design'
  ];

  useEffect(() => {
    fetchDesigners();
  }, [filters]);

  const fetchDesigners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.specialty?.length) {
        params.append('specialty', filters.specialty.join(','));
      }
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.minRating) {
        params.append('minRating', filters.minRating.toString());
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/designers?${params}`);
      const data = await response.json();

      if (data.success) {
        setDesigners(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch designers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDesigners();
  };

  const handleSpecialtyFilter = (specialty: DesignSpecialty) => {
    setFilters(prev => {
      const currentSpecialties = prev.specialty || [];
      const isSelected = currentSpecialties.includes(specialty);
      
      return {
        ...prev,
        specialty: isSelected
          ? currentSpecialties.filter(s => s !== specialty)
          : [...currentSpecialties, specialty]
      };
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Find Designers</h1>
            <p className="mt-2 text-gray-600">
              Browse our network of talented designers and find the perfect match for your project
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      label="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search designers..."
                    />
                    <Button 
                      className="mt-2 w-full" 
                      onClick={handleSearch}
                      size="sm"
                    >
                      Search
                    </Button>
                  </div>

                  <div>
                    <Input
                      label="Location"
                      value={filters.location || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City or region"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialties
                    </label>
                    <div className="space-y-2">
                      {specialties.map((specialty) => (
                        <label key={specialty} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.specialty?.includes(specialty) || false}
                            onChange={() => handleSpecialtyFilter(specialty)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.minRating || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        minRating: e.target.value ? Number(e.target.value) : undefined 
                      }))}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Any rating</option>
                      <option value="4">4+ stars</option>
                      <option value="4.5">4.5+ stars</option>
                      <option value="5">5 stars</option>
                    </select>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {designers && designers.items.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      {designers.total} designer{designers.total !== 1 ? 's' : ''} found
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {designers.items.map((designer) => (
                      <Card key={designer.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {designer.profilePicture ? (
                                <img
                                  src={designer.profilePicture}
                                  alt={`${designer.firstName} ${designer.lastName}`}
                                  className="h-16 w-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {designer.firstName[0]}{designer.lastName[0]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {designer.firstName} {designer.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{designer.location}</p>
                              <div className="mt-1 flex items-center">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(designer.averageRating)
                                          ? 'text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                  <span className="ml-1 text-sm text-gray-600">
                                    ({designer.averageRating.toFixed(1)})
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {designer.biography}
                                </p>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-1">
                                {designer.specialty.slice(0, 2).map((spec) => (
                                  <span
                                    key={spec}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {spec}
                                  </span>
                                ))}
                                {designer.specialty.length > 2 && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{designer.specialty.length - 2} more
                                  </span>
                                )}
                              </div>
                              <div className="mt-4 flex justify-between items-center">
                                <div>
                                  {designer.hourlyRate && (
                                    <p className="text-sm font-medium text-gray-900">
                                      ${designer.hourlyRate}/hour
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {designer.yearsOfExperience} years experience
                                  </p>
                                </div>
                                <Button size="sm">
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {designers.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-2">
                        {designers.hasPrev && (
                          <Button variant="outline" size="sm">
                            Previous
                          </Button>
                        )}
                        <span className="px-3 py-2 text-sm text-gray-600">
                          Page {designers.page} of {designers.totalPages}
                        </span>
                        {designers.hasNext && (
                          <Button variant="outline" size="sm">
                            Next
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No designers found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}