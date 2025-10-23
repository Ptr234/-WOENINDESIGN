'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, TrendingDown, LayoutDashboard, FileText, Users, BarChart3, Heart, 
  MessageSquare, HelpCircle, Calendar, ChevronDown, ArrowRight, Briefcase, MapPin, Award, 
  Package, Eye, Star, Clock, Filter, CreditCard, DollarSign, User, Bell, CheckCircle, 
  AlertCircle, XCircle, Zap, Target, Bookmark, Send, Calculator, Settings, Plus, Phone, 
  Mail, Video, ChevronRight, TrendingDown as Trending, Users2, Building, ShoppingCart
} from 'lucide-react';
import SubscriptionDashboard from '../subscription/SubscriptionDashboard';
import MessagingCenter from '../messaging/MessagingCenter';

interface ClientDashboardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
}

interface ClientDashboardStats {
  activeHiringRequests: number;
  pendingResponses: number;
  completedProjects: number;
  totalSpent: number;
  savedDesigners: number;
  savedSuppliers: number;
  unreadMessages: number;
}

interface HiringRequest {
  id: string;
  projectTitle: string;
  designerName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  budget: number;
  deadline: string;
  progress: number;
  lastUpdate: string;
  priority: 'low' | 'medium' | 'high';
}

interface RecommendedProfessional {
  id: string;
  name: string;
  type: 'designer' | 'supplier';
  specialty: string;
  rating: number;
  hourlyRate?: number;
  location: string;
  profileImage: string;
  isAvailable: boolean;
  completedProjects: number;
}

export default function EnhancedClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [hiringRequests, setHiringRequests] = useState<HiringRequest[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessaging, setShowMessaging] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch client stats
      const statsResponse = await fetch('/api/dashboard/client/stats', { headers });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch hiring requests
      const hiringResponse = await fetch('/api/dashboard/client/hiring-requests', { headers });
      const hiringData = await hiringResponse.json();
      if (hiringData.success) {
        setHiringRequests(hiringData.data);
      }

      // Fetch recommendations
      const recsResponse = await fetch('/api/dashboard/client/recommendations', { headers });
      const recsData = await recsResponse.json();
      if (recsData.success) {
        setRecommendations(recsData.data);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, isPositive, icon, color = 'blue' }: {
    title: string;
    value: string | number;
    change?: string;
    isPositive?: boolean;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm border border-gray-300 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
        {change && (
          <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-300">{title}</div>
    </div>
  );

  const ClientWelcomeCard = () => (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.firstName}!</h1>
          <p className="text-cream-100" style={{ color: '#f5f5dc' }}>
            You have {stats?.activeHiringRequests || 0} active projects and {stats?.pendingResponses || 0} pending responses
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats?.completedProjects || 0}</div>
            <div className="text-sm" style={{ color: '#f5f5dc' }}>Completed Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">UGX {(stats?.totalSpent || 0).toLocaleString()}</div>
            <div className="text-sm" style={{ color: '#f5f5dc' }}>Total Investment</div>
          </div>
        </div>
      </div>
    </div>
  );

  const QuickActionsWidget = () => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => window.location.href = '/designers'}
          className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition group"
        >
          <Users className="text-green-600 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-sm font-medium text-white">Find Designers</span>
        </button>
        <button 
          onClick={() => window.location.href = '/suppliers'}
          className="flex flex-col items-center gap-2 p-4 bg-green-100 hover:bg-green-200 rounded-lg transition group"
        >
          <Building className="text-green-700 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-sm font-medium text-white">Find Suppliers</span>
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition group">
          <MessageSquare className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-sm font-medium text-white">Messages</span>
          {stats?.unreadMessages && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {stats.unreadMessages}
            </span>
          )}
        </button>
        <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition group">
          <Heart className="text-green-600 group-hover:scale-110 transition-transform" size={24} />
          <span className="text-sm font-medium text-white">Saved Pros</span>
        </button>
      </div>
    </div>
  );

  const ActiveProjectsWidget = () => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Active Projects</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-semibold flex items-center gap-1">
          View All <ArrowRight size={14} />
        </button>
      </div>
      
      {hiringRequests.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-400">No active projects yet</p>
          <button className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
            Start Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {hiringRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{request.projectTitle}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  request.status === 'completed' ? 'bg-green-100 text-green-700' :
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-200'
                }`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-400">Designer:</span>
                  <span className="ml-1 font-medium">{request.designerName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Budget:</span>
                  <span className="ml-1 font-medium">UGX {request.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Deadline:</span>
                  <span className="ml-1 font-medium">{request.deadline}</span>
                </div>
                <div>
                  <span className="text-gray-400">Progress:</span>
                  <span className="ml-1 font-medium">{request.progress}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${request.progress}%` }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const HiringRequestsOverview = () => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Hiring Requests Status</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
          Manage All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-600" size={20} />
            <span className="font-medium text-white">Pending Responses</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats?.pendingResponses || 0}</div>
          <div className="text-sm text-gray-300">Awaiting designer replies</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="font-medium text-white">Active Projects</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats?.activeHiringRequests || 0}</div>
          <div className="text-sm text-gray-300">Currently in progress</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-green-700" size={20} />
            <span className="font-medium text-white">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{stats?.completedProjects || 0}</div>
          <div className="text-sm text-gray-300">Successfully finished</div>
        </div>
      </div>
    </div>
  );

  const RecommendationsWidget = () => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Recommended for You</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.slice(0, 4).map((pro) => (
          <div key={pro.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
                  {pro.name.split(' ').map(n => n[0]).join('')}
                </div>
                {pro.isAvailable && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-white">{pro.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    pro.type === 'designer' ? 'bg-green-100 text-green-700' : 'bg-green-200 text-green-800'
                  }`}>
                    {pro.type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{pro.specialty}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current" size={12} />
                    <span className="font-medium">{pro.rating}</span>
                    <span className="text-gray-400">({pro.completedProjects})</span>
                  </div>
                  {pro.hourlyRate && (
                    <span className="font-medium text-white">UGX {pro.hourlyRate}/hr</span>
                  )}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                    View Profile
                  </button>
                  <button className="flex-1 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ClientActivityFeed = () => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {[
          {
            type: 'response',
            title: 'New Response from Sarah Mukasa',
            description: 'Responded to your Interior Design project request',
            time: '2 hours ago',
            icon: <Bell className="text-blue-500" size={16} />,
            action: 'View Response'
          },
          {
            type: 'message',
            title: 'Message from James Okello',
            description: 'Sent project updates and milestone delivery',
            time: '4 hours ago',
            icon: <MessageSquare className="text-green-500" size={16} />,
            action: 'Reply'
          },
          {
            type: 'view',
            title: 'Profile Views',
            description: '3 designers viewed your project brief',
            time: '1 day ago',
            icon: <Eye className="text-green-500" size={16} />,
            action: 'See Who'
          },
          {
            type: 'recommendation',
            title: 'New Recommendations',
            description: '5 new designers match your preferences',
            time: '2 days ago',
            icon: <Users className="text-green-500" size={16} />,
            action: 'Explore'
          }
        ].map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-300 last:border-0">
            <div className="flex-shrink-0 mt-1">{activity.icon}</div>
            <div className="flex-1">
              <h4 className="font-medium text-white">{activity.title}</h4>
              <p className="text-sm text-gray-300">{activity.description}</p>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
            <button className="text-xs text-green-600 hover:text-green-700 font-medium">
              {activity.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const BudgetTrackingWidget = () => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-white mb-6">Budget & Payments</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-cream-200 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Total Spent</h4>
            <p className="text-sm text-gray-300">All-time project investment</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white">UGX {(stats?.totalSpent || 0).toLocaleString()}</div>
            <div className="text-sm text-green-500">+12% this month</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">UGX 45K</div>
            <div className="text-xs text-gray-300">Contact Fees Paid</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">UGX 180K</div>
            <div className="text-xs text-gray-300">Project Budgets</div>
          </div>
        </div>

        <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2">
          <Calculator size={16} />
          Budget Calculator
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-green-100">
        <div className="w-64 bg-green-800/80 backdrop-blur-sm shadow-lg"></div>
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-green-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-800/80 backdrop-blur-sm shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xl font-bold text-white block leading-tight">Women in Design</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 ml-13">Client Portal</div>
        </div>

        {/* Navigation */}
        <div className="px-4 flex-1">
          <div className="text-xs font-semibold text-gray-300 mb-3 px-2">My Dashboard</div>
          
          <div className="space-y-1">
            <button 
              onClick={() => setActiveMenu('Dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Dashboard' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Projects' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <Briefcase size={20} />
              <span className="font-medium">My Projects</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Professionals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Professionals' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <Users size={20} />
              <span className="font-medium">Find Professionals</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Saved')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Saved' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <Heart size={20} />
              <span className="font-medium">Saved Pros</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Analytics' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Analytics</span>
            </button>
            <button 
              onClick={() => setShowMessaging(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-300 hover:bg-cream-200"
            >
              <MessageSquare size={20} />
              <span className="font-medium">Messages</span>
              {stats?.unreadMessages && stats.unreadMessages > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                  {stats.unreadMessages}
                </span>
              )}
            </button>
          </div>

          {/* Tools Section */}
          <div className="text-xs font-semibold text-gray-300 mb-3 px-2 mt-8">Tools</div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition relative">
              <MessageSquare size={20} />
              <span className="font-medium">Messages</span>
              {stats?.unreadMessages && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {stats.unreadMessages}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveMenu('Subscription')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Subscription' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <CreditCard size={20} />
              <span className="font-medium">Subscription</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition">
              <DollarSign size={20} />
              <span className="font-medium">Payment History</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition">
              <HelpCircle size={20} />
              <span className="font-medium">Support</span>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-semibold text-white">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-gray-400">Client</div>
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
      <div className="flex-1 overflow-auto">
        {activeMenu === 'Subscription' ? (
          <SubscriptionDashboard userType="client" />
        ) : (
          <div className="p-8">
            <ClientWelcomeCard />

            {/* Client Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Active Requests" 
                value={stats?.activeHiringRequests || 0} 
                change="+2 this week" 
                isPositive={true}
                icon={<Briefcase size={20} />}
                color="blue"
              />
              <StatCard 
                title="Pending Responses" 
                value={stats?.pendingResponses || 0} 
                change="+1 today" 
                isPositive={true}
                icon={<Clock size={20} />}
                color="yellow"
              />
              <StatCard 
                title="Saved Professionals" 
                value={(stats?.savedDesigners || 0) + (stats?.savedSuppliers || 0)} 
                change="+3 this week" 
                isPositive={true}
                icon={<Heart size={20} />}
                color="green"
              />
              <StatCard 
                title="Total Investment" 
                value={`UGX ${(stats?.totalSpent || 0).toLocaleString()}`} 
                change="+12% growth" 
                isPositive={true}
                icon={<DollarSign size={20} />}
                color="green"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6 mb-8">
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <QuickActionsWidget />
                <ActiveProjectsWidget />
                <HiringRequestsOverview />
                <RecommendationsWidget />
              </div>

              {/* Right Column */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <BudgetTrackingWidget />
                <ClientActivityFeed />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messaging Center */}
      <MessagingCenter 
        user={{
          id: user.id || '',
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'client'
        }}
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
      />
    </div>
  );
}