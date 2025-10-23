'use client';

import React, { useState, useEffect } from 'react';
import {
  X, User, Mail, Phone, MapPin, Calendar, Clock, Shield, Star,
  FileText, Image, Download, Eye, CheckCircle, XCircle, AlertCircle,
  Settings, CreditCard, MessageSquare, Briefcase, Activity, ExternalLink,
  ChevronRight, ChevronDown, Upload, Edit, Trash2, MoreVertical
} from 'lucide-react';

interface UserDetailsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UserDetails {
  user: any;
  profile: any;
  documents: any[];
  verification: any[];
  activity: any;
  subscription: any;
}

export default function UserDetailsModal({ userId, isOpen, onClose }: UserDetailsModalProps) {
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const result = await response.json();
      if (result.success) {
        setDetails(result.data);
      } else {
        setError(result.error || 'Failed to load user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'designer': return 'bg-blue-100 text-blue-800';
      case 'supplier': return 'bg-purple-100 text-purple-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-cream-200 text-gray-800';
    }
  };

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="text-green-500" size={16} />
    ) : (
      <XCircle className="text-red-500" size={16} />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-100 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-400">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-cream-200">
          <div className="flex items-center gap-4">
            <User className="text-gray-700" size={24} />
            <div>
              <h2 className="text-xl font-bold text-black">User Details</h2>
              <p className="text-sm text-gray-600">
                {details ? `${details.user.firstName} ${details.user.lastName}` : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-100px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-200 border-r border-gray-300 p-4">
            <nav className="space-y-2">
              {['profile', 'documents', 'verification', 'activity', 'subscription'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition capitalize ${
                    activeTab === tab 
                      ? 'bg-gray-400 text-white font-medium' 
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading user details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Details</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchUserDetails}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : details ? (
              <div className="p-6">
                {activeTab === 'profile' && <ProfileTab details={details} />}
                {activeTab === 'documents' && <DocumentsTab details={details} />}
                {activeTab === 'verification' && <VerificationTab details={details} />}
                {activeTab === 'activity' && <ActivityTab details={details} />}
                {activeTab === 'subscription' && <SubscriptionTab details={details} />}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ details }: { details: UserDetails }) {
  const { user, profile } = details;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User size={20} />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900 flex items-center gap-2">
                <Mail size={16} className="text-gray-700" />
                {user.email}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-gray-900 flex items-center gap-2">
                <Phone size={16} className="text-gray-700" />
                {user.phone || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1 flex items-center gap-4">
                <span className={`flex items-center gap-1 ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {getVerificationIcon(user.isVerified)}
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className={`flex items-center gap-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-gray-900 flex items-center gap-2">
                <Calendar size={16} className="text-gray-700" />
                {formatDate(user.createdAt)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Last Login</label>
              <p className="mt-1 text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-gray-700" />
                {formatDate(user.lastLoginAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific Profile */}
      {profile && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={20} />
            {profile.type === 'designer' ? 'Designer' : 'Supplier'} Profile
          </h3>
          
          {profile.type === 'designer' ? (
            <DesignerProfileSection profile={profile} />
          ) : (
            <SupplierProfileSection profile={profile} />
          )}
        </div>
      )}
    </div>
  );
}

// Designer Profile Section
function DesignerProfileSection({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Specialties</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.specialty?.map((spec: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {spec}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Experience</label>
          <p className="mt-1 text-gray-900">{profile.years_of_experience} years</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Hourly Rate</label>
          <p className="mt-1 text-gray-900">UGX {profile.hourly_rate?.toLocaleString()}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Availability</label>
          <p className="mt-1 text-gray-900">{profile.availability}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Rating</label>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="ml-1 text-gray-900">{profile.average_rating || 'No ratings'}</span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Total Projects</label>
          <p className="mt-1 text-gray-900">{profile.total_projects || 0}</p>
        </div>
      </div>
      
      {profile.biography && (
        <div>
          <label className="text-sm font-medium text-gray-700">Biography</label>
          <p className="mt-1 text-gray-900">{profile.biography}</p>
        </div>
      )}
      
      {profile.skills && profile.skills.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Skills</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.skills.map((skill: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-cream-200 text-gray-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {profile.portfolio && profile.portfolio.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Portfolio ({profile.portfolio.length} items)</label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.portfolio.slice(0, 8).map((item: any) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Supplier Profile Section  
function SupplierProfileSection({ profile }: { profile: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Business Name</label>
          <p className="mt-1 text-gray-900">{profile.business_name}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile.category?.map((cat: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Business Phone</label>
          <p className="mt-1 text-gray-900">{profile.business_phone}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Business Email</label>
          <p className="mt-1 text-gray-900">{profile.business_email}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Location</label>
          <p className="mt-1 text-gray-900">{profile.location}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Minimum Order</label>
          <p className="mt-1 text-gray-900">UGX {profile.minimum_order?.toLocaleString()}</p>
        </div>
      </div>
      
      {profile.business_description && (
        <div>
          <label className="text-sm font-medium text-gray-700">Business Description</label>
          <p className="mt-1 text-gray-900">{profile.business_description}</p>
        </div>
      )}
      
      {profile.products && profile.products.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Products ({profile.products.length} items)</label>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.products.slice(0, 6).map((product: any) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                <p className="text-sm font-medium text-green-600 mt-2">UGX {product.price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Documents Tab Component
function DocumentsTab({ details }: { details: UserDetails }) {
  const { documents } = details;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">User Documents</h3>
        <span className="text-sm text-gray-600">{documents.length} documents</span>
      </div>
      
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
          <p className="text-gray-600">This user hasn't uploaded any documents yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc: any) => (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-700" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.file_name}</h4>
                    <p className="text-sm text-gray-600">{doc.document_type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    doc.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                    doc.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.verification_status || 'pending'}
                  </span>
                  
                  <button className="p-1 hover:bg-cream-200 rounded">
                    <Eye size={16} />
                  </button>
                  
                  <button className="p-1 hover:bg-cream-200 rounded">
                    <Download size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <p>Uploaded: {formatDate(doc.upload_date)}</p>
                {doc.admin_notes && (
                  <p className="mt-1"><strong>Admin Notes:</strong> {doc.admin_notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Verification Tab Component
function VerificationTab({ details }: { details: UserDetails }) {
  const { verification } = details;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Verification History</h3>
        <span className="text-sm text-gray-600">{verification.length} requests</span>
      </div>
      
      {verification.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Verification Requests</h3>
          <p className="text-gray-600">This user hasn't submitted any verification requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verification.map((item: any) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{item.verification_type}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'approved' ? 'bg-green-100 text-green-800' :
                  item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Requested: {formatDate(item.requested_at)}</p>
                {item.completed_at && (
                  <p>Completed: {formatDate(item.completed_at)}</p>
                )}
                {item.admin_notes && (
                  <p><strong>Admin Notes:</strong> {item.admin_notes}</p>
                )}
                {item.rejection_reason && (
                  <p><strong>Rejection Reason:</strong> {item.rejection_reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ details }: { details: UserDetails }) {
  const { activity } = details;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">User Activity Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-blue-600 font-medium">Messages</p>
              <p className="text-xl font-bold text-blue-900">
                {activity.messagesSent + activity.messagesReceived}
              </p>
              <p className="text-xs text-blue-700">
                {activity.messagesSent} sent, {activity.messagesReceived} received
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Briefcase className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-purple-600 font-medium">Hiring Requests</p>
              <p className="text-xl font-bold text-purple-900">
                {activity.hiringRequestsSent + activity.hiringRequestsReceived}
              </p>
              <p className="text-xs text-purple-700">
                {activity.hiringRequestsSent} sent, {activity.hiringRequestsReceived} received
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-green-600 font-medium">Contact Payments</p>
              <p className="text-xl font-bold text-green-900">{activity.contactPaymentsMade}</p>
              <p className="text-xs text-green-700">Successful payments</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-cream-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Last Activity</h4>
        <p className="text-sm text-gray-600">
          Last login: {formatDate(activity.lastLogin)}
        </p>
      </div>
    </div>
  );
}

// Subscription Tab Component
function SubscriptionTab({ details }: { details: UserDetails }) {
  const { subscription } = details;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Subscription Information</h3>
      
      {!subscription ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600">This user is on a free plan or doesn't have an active subscription.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Plan</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{subscription.plan_name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Price</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {subscription.currency} {subscription.price?.toLocaleString()}/{subscription.interval}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.status}
              </span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Current Period</label>
              <p className="mt-1 text-gray-900">
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </p>
            </div>
            
            {subscription.cancel_at_period_end && (
              <div className="md:col-span-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <AlertCircle className="inline mr-2" size={16} />
                    This subscription will be cancelled at the end of the current period.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getRoleColor(role: string) {
  switch (role) {
    case 'designer': return 'bg-blue-100 text-blue-800';
    case 'supplier': return 'bg-purple-100 text-purple-800';
    case 'client': return 'bg-green-100 text-green-800';
    default: return 'bg-cream-200 text-gray-800';
  }
}

function getVerificationIcon(isVerified: boolean) {
  return isVerified ? (
    <CheckCircle className="text-green-500" size={16} />
  ) : (
    <XCircle className="text-red-500" size={16} />
  );
}

function formatDate(dateString: string) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}