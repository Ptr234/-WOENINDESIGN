'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, MessageSquare, Briefcase, BarChart3, 
  Calendar, RefreshCw, ExternalLink 
} from 'lucide-react';

interface AnalyticsData {
  platformStats: {
    totalUsers: number;
    totalDesigners: number;
    totalSuppliers: number;
    totalClients: number;
    totalMessages: number;
    totalHiringRequests: number;
    activeUsers: number;
  };
  engagement: {
    messagesSent: number;
    profileViews: number;
    searchQueries: number;
    hiringRequests: number;
  };
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export default function AdminAnalyticsSummary() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics?timeRange=7d', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Analytics error:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Analytics Overview</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-cream-200 rounded-lg p-4 h-24 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cream-100 rounded-lg p-6 border border-red-200">
        <div className="text-center">
          <BarChart3 className="mx-auto text-red-400 mb-2" size={32} />
          <h3 className="text-lg font-medium text-red-900">Analytics Unavailable</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
          >
            <RefreshCw size={14} className="inline mr-1" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Analytics Overview</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 hover:bg-cream-200 rounded-lg transition"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          <a
            href="/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-lg transition flex items-center gap-1"
          >
            <ExternalLink size={14} />
            Full Analytics
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{data.platformStats.totalUsers}</p>
              <p className="text-blue-100 text-xs mt-1">
                {data.platformStats.activeUsers} active
              </p>
            </div>
            <Users size={24} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Designers</p>
              <p className="text-2xl font-bold">{data.platformStats.totalDesigners}</p>
              <p className="text-purple-100 text-xs mt-1">
                {Math.round((data.platformStats.totalDesigners / data.platformStats.totalUsers) * 100)}% of users
              </p>
            </div>
            <BarChart3 size={24} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Messages</p>
              <p className="text-2xl font-bold">{data.engagement.messagesSent}</p>
              <p className="text-green-100 text-xs mt-1">Last 7 days</p>
            </div>
            <MessageSquare size={24} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Hiring Requests</p>
              <p className="text-2xl font-bold">{data.platformStats.totalHiringRequests}</p>
              <p className="text-orange-100 text-xs mt-1">
                {data.engagement.hiringRequests} this week
              </p>
            </div>
            <Briefcase size={24} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {data.topCategories.length > 0 && (
        <div className="bg-green-800 rounded-lg p-6 border border-green-700">
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} />
            Top Design Categories
          </h4>
          <div className="space-y-3">
            {data.topCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-400' :
                    index === 1 ? 'bg-green-300' :
                    index === 2 ? 'bg-green-200' :
                    index === 3 ? 'bg-green-100' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm font-medium text-white">{category.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{category.count}</span>
                  <span className="text-xs text-gray-300 ml-2">{category.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-white">
          <Calendar size={14} className="inline mr-1" />
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}