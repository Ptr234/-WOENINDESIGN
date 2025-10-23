'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, Star, MapPin, Package, Phone, Mail, Globe, 
  ChevronDown, Heart, Eye, Clock, DollarSign, Truck, Store,
  CheckCircle, AlertCircle, ArrowLeft, Users, Building
} from 'lucide-react';

interface Supplier {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  businessName: string;
  businessDescription: string;
  category: string[];
  location: string;
  businessHours?: string;
  deliveryAreas?: string[];
  minimumOrder?: number;
  paymentMethods?: string[];
  isVerified: boolean;
  productCount: number;
  hasContactAccess: boolean;
  contactFeeRequired: boolean;
  showContactInfo: boolean;
  contactInfo?: {
    businessPhone?: string;
    businessEmail?: string;
    address?: string;
    website?: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    'Paper & Materials',
    'Drawing Tools',
    'Canvas & Boards', 
    'Digital Tools',
    'Printing Services',
    'Framing & Display',
    'Furniture & Equipment',
    'Craft Supplies',
    'Software & Apps',
    'Educational Resources'
  ];

  const locations = [
    'Kampala',
    'Entebbe', 
    'Jinja',
    'Mbarara',
    'Gulu',
    'Lira',
    'Mbale',
    'Fort Portal',
    'Hoima',
    'Soroti'
  ];

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchSuppliers();
      } else {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, selectedCategories, selectedLocation]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder,
        ...(searchQuery && { q: searchQuery }),
        ...(selectedLocation && { location: selectedLocation }),
        ...(selectedCategories.length > 0 && { 
          category: selectedCategories.join(',') 
        })
      });

      const response = await fetch(`/api/suppliers?${params}`);
      const data = await response.json();

      if (data.success) {
        setSuppliers(data.data.suppliers);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedLocation('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleContactAccess = async (supplierId: string) => {
    try {
      const response = await fetch(`/api/contact/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalId: supplierId,
          professionalType: 'supplier'
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/payment/contact-fee?professionalId=${supplierId}&type=supplier`);
      }
    } catch (error) {
      console.error('Contact access error:', error);
    }
  };

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <div className="bg-cream-100 rounded-xl p-6 shadow-sm border border-gray-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          {supplier.profilePicture ? (
            <img 
              src={supplier.profilePicture} 
              alt={supplier.businessName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold text-lg">
              {supplier.businessName.charAt(0)}
            </div>
          )}
          {supplier.isVerified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="text-white" size={12} />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-black">{supplier.businessName}</h3>
            <button className="text-gray-700 hover:text-black transition">
              <Heart size={20} />
            </button>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">
            {supplier.firstName} {supplier.lastName}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="text-gray-600" size={14} />
            <span className="text-sm text-gray-700">{supplier.location}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
        {supplier.businessDescription}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {supplier.category.slice(0, 3).map((cat, index) => (
          <span key={index} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
            {cat}
          </span>
        ))}
        {supplier.category.length > 3 && (
          <span className="text-xs text-gray-600">+{supplier.category.length - 3} more</span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <Package size={14} />
          <span>{supplier.productCount} products</span>
        </div>
        {supplier.minimumOrder && (
          <div className="flex items-center gap-2">
            <DollarSign size={14} />
            <span>Min: UGX {supplier.minimumOrder.toLocaleString()}</span>
          </div>
        )}
      </div>

      {supplier.deliveryAreas && supplier.deliveryAreas.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
          <Truck size={14} />
          <span>Delivers to: {supplier.deliveryAreas.slice(0, 2).join(', ')}</span>
          {supplier.deliveryAreas.length > 2 && <span>+{supplier.deliveryAreas.length - 2} more</span>}
        </div>
      )}

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-cream-200 hover:bg-cream-300 text-black rounded-lg transition border border-gray-400">
          <Eye size={16} className="inline mr-2" />
          View Profile
        </button>
        
        {supplier.contactFeeRequired ? (
          <button 
            onClick={() => handleContactAccess(supplier.id)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
          >
            <Phone size={16} className="inline mr-2" />
            Contact (UGX 10,000)
          </button>
        ) : (
          <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition">
            <Phone size={16} className="inline mr-2" />
            Contact
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-200 to-gray-100">
      {/* Header */}
      <div className="bg-cream-200/90 backdrop-blur-sm border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Suppliers Directory</h1>
              <p className="text-gray-700 mt-1">Find quality suppliers for your design projects</p>
            </div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-cream-100 rounded-xl p-6 shadow-sm border border-gray-300 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
              <input
                type="text"
                placeholder="Search suppliers, businesses, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-400 bg-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-black placeholder:text-gray-600 transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
            >
              <Filter size={16} />
              Filters
              <ChevronDown 
                size={16} 
                className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-3 border border-gray-400 bg-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="business_name-asc">Name A-Z</option>
              <option value="business_name-desc">Name Z-A</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-400 bg-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Categories Filter */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 py-1 text-sm rounded-full transition ${
                          selectedCategories.includes(category)
                            ? 'bg-gray-700 text-white'
                            : 'bg-cream-200 text-gray-700 hover:bg-cream-300 border border-gray-400'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  {selectedCategories.length > 0 && (
                    <span>{selectedCategories.length} categories selected</span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-700 hover:text-black transition"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {pagination && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-700">
              Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} suppliers
            </p>
            <div className="flex items-center gap-2">
              <Building className="text-gray-600" size={16} />
              <span className="text-sm text-gray-700">{pagination.total} suppliers available</span>
            </div>
          </div>
        )}

        {/* Suppliers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-cream-200 rounded-xl p-6 animate-pulse">
                <div className="h-32 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-black mb-2">No suppliers found</h3>
            <p className="text-gray-700 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map(supplier => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-400 bg-cream-200 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream-300 transition"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-400 bg-cream-200 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cream-300 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}