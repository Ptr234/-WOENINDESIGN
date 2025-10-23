'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, TrendingUp, TrendingDown, LayoutDashboard, Users, BarChart3, 
  Shield, CheckCircle, AlertCircle, Clock, UserCheck, Eye, Filter,
  ChevronDown, ArrowRight, MapPin, Calendar, MessageSquare,
  FileText, Award, Settings, Heart, Briefcase, Package
} from 'lucide-react';
import AdminAnalyticsSummary from '../analytics/AdminAnalyticsSummary';
import AdminSettingsPage from '../settings/AdminSettingsPage';
import UserDetailsModal from '../admin/UserDetailsModal';

interface PlatformStats {
  totalDesigners: number;
  totalSuppliers: number;
  totalClients: number;
  totalProjects: number;
  activeUsers: number;
  verifiedBusinesses: number;
  pendingVerifications: number;
  totalUsers: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'designer' | 'client' | 'supplier';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  location?: string;
  profilePicture?: string;
}

interface AdminDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
}

export default function WomenInDesignAdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);

  // Admin access control
  useEffect(() => {
    if (user?.email !== 'admin@womenindesignuganda.com') {
      router.push('/');
      return;
    }
  }, [user, router]);

  // Show alert messages
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        showAlert('error', 'Failed to load platform statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch users with search and filters
  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20',
          ...(roleFilter !== 'all' && { role: roleFilter }),
          ...(searchTerm && { search: searchTerm })
        });

        const response = await fetch(`/api/admin/users?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setUsers(data.data.users);
          setTotalUsers(data.data.total);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        showAlert('error', 'Failed to load users');
      } finally {
        setUserLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [currentPage, roleFilter, searchTerm]);

  // Verify user function
  const handleVerifyUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true } : u));
        showAlert('success', 'User verified successfully');
      } else {
        showAlert('error', data.error || 'Failed to verify user');
      }
    } catch (error) {
      console.error('Failed to verify user:', error);
      showAlert('error', 'Failed to verify user');
    }
  };

  // Open user details modal
  const openUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setUserDetailsModalOpen(true);
  };

  // Close user details modal
  const closeUserDetails = () => {
    setSelectedUserId(null);
    setUserDetailsModalOpen(false);
  };

  // Admin access guard
  if (user?.email !== 'admin@womenindesignuganda.com') {
    return null;
  }

  const StatCard = ({ title, value, icon, color, change, isPositive }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    change?: string;
    isPositive?: boolean;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm border border-gray-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-gray-200">
          <div className="text-gray-800">{icon}</div>
        </div>
        {change && (
          <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-200">{title}</div>
    </div>
  );

  const UserRow = ({ user: userData }: { user: User }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {userData.profilePicture ? (
              <img className="h-10 w-10 rounded-full" src={userData.profilePicture} alt="" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
                {userData.firstName[0]}{userData.lastName[0]}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">
              {userData.firstName} {userData.lastName}
            </div>
            <div className="text-sm text-gray-400">{userData.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          userData.role === 'designer' ? 'bg-blue-100 text-blue-800' :
          userData.role === 'supplier' ? 'bg-green-100 text-green-800' :
          'bg-green-100 text-green-800'
        }`}>
          {userData.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            userData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {userData.isActive ? 'Active' : 'Inactive'}
          </span>
          {userData.isVerified && (
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
        {new Date(userData.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-2">
          <button
            onClick={() => openUserDetails(userData.id)}
            className="text-white hover:text-white bg-gray-200 hover:bg-gray-600 px-3 py-1 rounded-md transition flex items-center gap-1"
          >
            <Eye size={14} />
            View Details
          </button>
          {!userData.isVerified && (userData.role === 'designer' || userData.role === 'supplier') && (
            <button
              onClick={() => handleVerifyUser(userData.id)}
              className="text-white hover:text-white bg-gray-300 hover:bg-gray-700 px-3 py-1 rounded-md transition font-medium"
            >
              Verify
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-cream-100 via-cream-200 to-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-cream-200/90 backdrop-blur-sm shadow-xl border-r border-gray-300 flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <span className="text-lg font-bold text-white block leading-tight">Women in Design</span>
            </div>
          </div>
          <div className="text-xs text-gray-200 ml-13">Admin Portal</div>
        </div>

        {/* Navigation */}
        <div className="px-4 flex-1">
          <div className="text-xs font-semibold text-gray-200 mb-3 px-2">Platform Management</div>
          
          <div className="space-y-1">
            <button 
              onClick={() => setActiveMenu('Dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Dashboard' ? 'bg-gray-300 text-white' : 'text-gray-200 hover:bg-green-800'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Users' ? 'bg-gray-300 text-white' : 'text-gray-200 hover:bg-green-800'
              }`}
            >
              <Users size={20} />
              <span className="font-medium">User Management</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Analytics' ? 'bg-gray-300 text-white' : 'text-gray-200 hover:bg-green-800'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Analytics</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Settings' ? 'bg-gray-300 text-white' : 'text-gray-200 hover:bg-green-800'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-semibold text-white">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-gray-200">Administrator</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full text-sm text-gray-200 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Women in Design Admin Dashboard</h1>
            <p className="text-gray-200 text-sm mt-1">Comprehensive platform management and oversight capabilities</p>
          </div>

          {/* Alert System */}
          {alertMessage && (
            <div className={`mb-6 p-4 rounded-lg border ${
              alertMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {alertMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                {alertMessage.message}
              </div>
            </div>
          )}

          {activeMenu === 'Dashboard' && (
            <>
              {/* Platform Statistics */}
              {loading ? (
                <div className="grid grid-cols-5 gap-6 mb-8">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-green-800 rounded-xl p-6 shadow-sm animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : stats && (
                <div className="grid grid-cols-5 gap-6 mb-8">
                  <StatCard 
                    title="Total Designers" 
                    value={stats.totalDesigners} 
                    icon={<Briefcase size={20} />}
                    color="blue"
                    change="+12% this month"
                    isPositive={true}
                  />
                  <StatCard 
                    title="Total Suppliers" 
                    value={stats.totalSuppliers} 
                    icon={<Package size={20} />}
                    color="green"
                    change="+8% this month"
                    isPositive={true}
                  />
                  <StatCard 
                    title="Total Clients" 
                    value={stats.totalClients} 
                    icon={<Users size={20} />}
                    color="green"
                    change="+15% this month"
                    isPositive={true}
                  />
                  <StatCard 
                    title="Total Projects" 
                    value={stats.totalProjects} 
                    icon={<FileText size={20} />}
                    color="orange"
                    change="+25% this month"
                    isPositive={true}
                  />
                  <StatCard 
                    title="Active Users" 
                    value={stats.activeUsers} 
                    icon={<Eye size={20} />}
                    color="red"
                    change="+5% this week"
                    isPositive={true}
                  />
                </div>
              )}

              {/* Verification Overview */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-green-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Verification Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="text-green-600" size={16} />
                        <span className="text-gray-300">Verified Businesses</span>
                      </div>
                      <span className="font-semibold text-white">{stats?.verifiedBusinesses || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="text-yellow-600" size={16} />
                        <span className="text-gray-300">Pending Verifications</span>
                      </div>
                      <span className="font-semibold text-white">{stats?.pendingVerifications || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-green-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveMenu('Users')}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
                    >
                      <UserCheck className="text-blue-600" size={16} />
                      <span className="text-sm text-gray-200">Review Verifications</span>
                    </button>
                    <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition flex items-center gap-2">
                      <MessageSquare className="text-green-600" size={16} />
                      <span className="text-sm text-gray-200">Support Tickets</span>
                    </button>
                  </div>
                </div>

                {/* Platform Health */}
                <div className="bg-green-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Platform Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">System Status</span>
                      <span className="text-green-600 font-semibold text-sm">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Uptime</span>
                      <span className="text-white font-semibold text-sm">99.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu === 'Users' && (
            <div>
              {/* User Search & Filtering */}
              <div className="bg-green-800 rounded-xl p-6 shadow-sm mb-6 border border-gray-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or email address"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-400 bg-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-white placeholder:text-gray-300 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="appearance-none bg-cream-200 border border-gray-400 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-gray-500 text-white transition-colors"
                    >
                      <option value="all">All Roles</option>
                      <option value="designer">Designers</option>
                      <option value="supplier">Suppliers</option>
                      <option value="client">Clients</option>
                    </select>
                    <Filter className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              {/* User Management Table */}
              <div className="bg-green-800 rounded-xl shadow-sm overflow-hidden border border-gray-300">
                <div className="px-6 py-4 border-b border-gray-300 bg-gray-100">
                  <h3 className="text-lg font-bold text-white">
                    User Management ({totalUsers.toLocaleString()} total users)
                  </h3>
                </div>
                
                {userLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                    <p className="text-gray-200 mt-2">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            User Profile
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Join Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-cream-50 divide-y divide-gray-300">
                        {users.map((userData) => (
                          <UserRow key={userData.id} user={userData} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!userLoading && totalUsers > 20 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage * 20 >= totalUsers}
                        className="px-3 py-1 border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {activeMenu === 'Analytics' && (
            <div>
              <AdminAnalyticsSummary />
            </div>
          )}

          {/* Settings Section */}
          {activeMenu === 'Settings' && (
            <div>
              <AdminSettingsPage />
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          isOpen={userDetailsModalOpen}
          onClose={closeUserDetails}
        />
      )}
    </div>
  );
}