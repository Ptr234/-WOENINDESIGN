'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, Briefcase,
  Calendar, Filter, Download, RefreshCw, Eye, Search, Target, DollarSign,
  ArrowLeft, Settings, Activity, PieChart, LineChart
} from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  totalDesigners: number;
  totalSuppliers: number;
  totalClients: number;
  totalMessages: number;
  totalHiringRequests: number;
  activeUsers: number;
}

interface UserGrowthData {
  date: string;
  users: number;
  designers: number;
  suppliers: number;
}

interface TopCategory {
  category: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

interface EngagementMetrics {
  messagesSent: number;
  profileViews: number;
  searchQueries: number;
  hiringRequests: number;
}

interface AnalyticsData {
  platformStats: PlatformStats;
  userGrowth: UserGrowthData[];
  topCategories: TopCategory[];
  recentActivity: RecentActivity[];
  engagement: EngagementMetrics;
}

function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [timeRange]);

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Verify user is admin
      const authResponse = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!authResponse.ok) {
        router.push('/auth/login');
        return;
      }

      const authData = await authResponse.json();
      if (!authData.success || authData.data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      await fetchAnalyticsData();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/auth/login');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Activity size={48} className="mx-auto mb-2" />
            <h2 className="text-xl font-bold">Error Loading Analytics</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-cream-gradient">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Platform Analytics</h1>
                <p className="text-sm text-gray-600">Women in Design Platform Insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 bg-cream-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="365d">Last year</option>
              </select>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>
              
              <button className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition">
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{data.platformStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp size={12} />
                  {data.platformStats.activeUsers} active
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Designers</p>
                <p className="text-2xl font-bold text-gray-900">{data.platformStats.totalDesigners.toLocaleString()}</p>
                <p className="text-sm text-gray-700">
                  {Math.round((data.platformStats.totalDesigners / data.platformStats.totalUsers) * 100)}% of users
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <PieChart className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{data.platformStats.totalSuppliers.toLocaleString()}</p>
                <p className="text-sm text-gray-700">
                  {Math.round((data.platformStats.totalSuppliers / data.platformStats.totalUsers) * 100)}% of users
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hiring Requests</p>
                <p className="text-2xl font-bold text-gray-900">{data.platformStats.totalHiringRequests.toLocaleString()}</p>
                <p className="text-sm text-gray-700">
                  {data.engagement.hiringRequests} this period
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Briefcase className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
              <LineChart size={20} className="text-gray-700" />
            </div>
            
            <div className="space-y-4">
              {data.userGrowth.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(day.date)}</p>
                    <p className="text-sm text-gray-600">{day.users} new users</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{day.designers} designers</p>
                    <p className="text-sm text-gray-600">{day.suppliers} suppliers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Categories</h3>
              <BarChart3 size={20} className="text-gray-700" />
            </div>
            
            <div className="space-y-4">
              {data.topCategories.slice(0, 6).map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-purple-500' :
                      index === 2 ? 'bg-green-500' :
                      index === 3 ? 'bg-orange-500' :
                      index === 4 ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{category.count}</p>
                    <p className="text-xs text-gray-700">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Metrics & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Engagement Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Engagement Metrics</h3>
              <Activity size={20} className="text-gray-700" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <MessageSquare className="text-blue-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900">{data.engagement.messagesSent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Messages Sent</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Eye className="text-green-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900">{data.engagement.profileViews.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Profile Views</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Search className="text-purple-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900">{data.engagement.searchQueries.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Search Queries</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Briefcase className="text-orange-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-900">{data.engagement.hiringRequests.toLocaleString()}</p>
                <p className="text-sm text-gray-600">New Hires</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <Calendar size={20} className="text-gray-700" />
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'signup' ? 'bg-green-100' :
                    activity.type === 'message' ? 'bg-blue-100' :
                    activity.type === 'hire' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'signup' && <Users size={12} className="text-green-600" />}
                    {activity.type === 'message' && <MessageSquare size={12} className="text-blue-600" />}
                    {activity.type === 'hire' && <Briefcase size={12} className="text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-700">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AnalyticsPage />
    </Suspense>
  );
}