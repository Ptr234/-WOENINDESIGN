'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, LayoutDashboard, FileText, Users, BarChart3, FileStack, MessageSquare, HelpCircle, Calendar, ChevronDown, ArrowRight, Briefcase, MapPin, Award, Package, Settings, UserPlus, Shield } from 'lucide-react';

interface AdminDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, change, isPositive, target }: {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    target?: string;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="text-gray-400 text-sm mb-2">{title}</div>
      <div className="flex items-end justify-between mb-1">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {change}
        </div>
      </div>
      {target && <div className="text-xs text-gray-400">Target: {target}</div>}
    </div>
  );

  const RequestItem = ({ icon, label, count }: {
    icon: React.ReactNode;
    label: string;
    count: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <span className="text-gray-200">{label}</span>
      </div>
      <span className="font-semibold text-white">{count}</span>
    </div>
  );

  const UserItem = ({ name, role, status, statusColor, location }: {
    name: string;
    role: string;
    status: string;
    statusColor: string;
    location: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600"></div>
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-xs text-gray-400">{location}</div>
        </div>
      </div>
      <div className="text-gray-300 text-sm">{role}</div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
        <span className="text-sm text-gray-200">{status}</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-green-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-800/80 backdrop-blur-sm shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xl font-bold text-white block leading-tight">Design Marketplace</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 ml-13">Admin Portal</div>
        </div>

        {/* Navigation */}
        <div className="px-4 flex-1">
          <div className="text-xs font-semibold text-gray-400 mb-3 px-2">Platform Management</div>
          
          <div className="space-y-1">
            <button 
              onClick={() => setActiveMenu('Dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Dashboard' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Users' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <Users size={20} />
              <span className="font-medium">Users</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Designers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Designers' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <Briefcase size={20} />
              <span className="font-medium">Designers</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Analytics' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Analytics</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Settings' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>
          </div>

          {/* Community Section */}
          <div className="text-xs font-semibold text-gray-400 mb-3 px-2 mt-8">Community</div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-50 transition relative">
              <MessageSquare size={20} />
              <span className="font-medium">Messages</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">24</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-50 transition">
              <HelpCircle size={20} />
              <span className="font-medium">Support</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-50 transition">
              <Calendar size={20} />
              <span className="font-medium">Events</span>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-semibold text-white">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-gray-400">Administrator</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full text-sm text-gray-300 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Platform Management & Analytics</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users, analytics..."
              className="pl-12 pr-4 py-2 w-80 bg-green-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-green-800 rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Users" 
              value={stats?.totalUsers?.toString() || "0"} 
              change={`+${stats?.newUsersThisMonth || 0} this month`} 
              isPositive={true}
              target="1500+ by Q2"
            />
            <StatCard 
              title="Active Designers" 
              value={stats?.totalDesigners?.toString() || "0"} 
              change="+18%" 
              isPositive={true}
              target="400+ by Q2"
            />
            <StatCard 
              title="Active Clients" 
              value={stats?.totalClients?.toString() || "0"} 
              change="+32%" 
              isPositive={true}
              target="800+ by Q2"
            />
            <StatCard 
              title="Total Projects" 
              value={stats?.totalProjects?.toString() || "0"} 
              change={`+${stats?.newProjectsThisMonth || 0} this month`} 
              isPositive={true}
              target="500+ projects"
            />
          </div>
        )}

        {/* Middle Section */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* User Role Distribution */}
          <div className="col-span-3 bg-green-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-6">User Distribution</h3>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#E5E7EB" strokeWidth="30" />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#EC4899" 
                  strokeWidth="30"
                  strokeDasharray="201 377"
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#A855F7" 
                  strokeWidth="30"
                  strokeDasharray="94 377"
                  strokeDashoffset="-201"
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#F472B6" 
                  strokeWidth="30"
                  strokeDasharray="132 377"
                  strokeDashoffset="-295"
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span className="text-gray-300">Clients</span>
                </div>
                <span className="font-semibold">{stats?.totalClients || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Designers</span>
                </div>
                <span className="font-semibold">{stats?.totalDesigners || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-gray-300">Suppliers</span>
                </div>
                <span className="font-semibold">{stats?.totalSuppliers || 0}</span>
              </div>
            </div>
          </div>

          {/* Platform Activity */}
          <div className="col-span-5 bg-green-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Platform Activity</h3>
              <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                Last week <ChevronDown size={16} />
              </button>
            </div>
            <div className="h-48 flex items-end justify-between gap-2 mb-4">
              {[
                { registrations: 32, logins: 145, day: 'Mon' },
                { registrations: 41, logins: 138, day: 'Tue' },
                { registrations: 35, logins: 152, day: 'Wed' },
                { registrations: 48, logins: 141, day: 'Thu' },
                { registrations: 38, logins: 148, day: 'Fri' },
                { registrations: 28, logins: 95, day: 'Sat' },
                { registrations: 22, logins: 78, day: 'Sun' }
              ].map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-1 items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${item.registrations * 3}px` }}
                    ></div>
                    <div 
                      className="w-full bg-green-200 rounded-b"
                      style={{ height: `${item.logins * 1}px` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{item.day}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-300">New Registrations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-200"></div>
                <span className="text-gray-300">Daily Logins</span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="col-span-4 bg-green-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4">Pending Admin Actions</h3>
            <div>
              <RequestItem icon={<UserPlus size={18} />} label="User verifications" count="12" />
              <RequestItem icon={<Shield size={18} />} label="Security reports" count="3" />
              <RequestItem icon={<FileText size={18} />} label="Content reviews" count="8" />
              <RequestItem icon={<MessageSquare size={18} />} label="Support tickets" count="15" />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Geographic Distribution */}
          <div className="bg-green-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">User Geographic Distribution</h3>
              <MapPin className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              {[
                { region: 'Central Region', count: 542, percentage: 43 },
                { region: 'Eastern Region', count: 234, percentage: 19 },
                { region: 'Western Region', count: 198, percentage: 16 },
                { region: 'Northern Region', count: 167, percentage: 13 },
                { region: 'International', count: 106, percentage: 9 }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-200">{item.region}</span>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-green-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent User Activity</h3>
              <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-semibold">
                View all <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-3 text-xs font-semibold text-gray-400 pb-2 border-b">
                <div>User</div>
                <div>Role</div>
                <div>Status</div>
              </div>
              <UserItem 
                name="Sarah Mukasa" 
                role="Designer" 
                status="Active" 
                statusColor="bg-green-500"
                location="Kampala"
              />
              <UserItem 
                name="John Okello" 
                role="Client" 
                status="New" 
                statusColor="bg-blue-500"
                location="Entebbe"
              />
              <UserItem 
                name="Grace Nabwire" 
                role="Supplier" 
                status="Pending" 
                statusColor="bg-yellow-500"
                location="Jinja"
              />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Platform Performance</h3>
              <p className="text-sm" style={{ color: '#f5f5dc' }} text-sm">System health and growth metrics</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl font-bold">99.8%</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }} text-sm">Platform uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold">1.2s</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }} text-sm">Avg response time</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.8/5</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }} text-sm">User satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}