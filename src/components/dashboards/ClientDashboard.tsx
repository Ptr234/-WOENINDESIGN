'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, LayoutDashboard, FileText, Users, BarChart3, Heart, MessageSquare, HelpCircle, Calendar, ChevronDown, ArrowRight, Briefcase, MapPin, Award, Package, Eye, Star, Clock, Filter } from 'lucide-react';

interface ClientDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
}

export default function ClientDashboard({ user, onLogout }: ClientDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats', { headers });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }

        // Fetch projects
        const projectsResponse = await fetch('/api/dashboard/projects?limit=3', { headers });
        const projectsData = await projectsResponse.json();
        if (projectsData.success) {
          setProjects(projectsData.data.projects);
        }

        // Fetch recommended designers
        const designersResponse = await fetch('/api/dashboard/designers?limit=3&available=true', { headers });
        const designersData = await designersResponse.json();
        if (designersData.success) {
          setDesigners(designersData.data.designers);
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, change, isPositive, icon }: {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400 text-sm">{title}</div>
        <div className="text-gray-200">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {change}
        </div>
      </div>
    </div>
  );

  const DesignerCard = ({ name, specialty, rating, hourlyRate, location, avatar, isAvailable }: {
    name: string;
    specialty: string;
    rating: number;
    hourlyRate: string;
    location: string;
    avatar: string;
    isAvailable: boolean;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-semibold text-lg">
            {avatar}
          </div>
          {isAvailable && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{name}</h3>
            <button className="text-gray-200 hover:text-green-500 transition">
              <Heart size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-300 mb-2">{specialty}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 fill-current" size={14} />
              <span>{rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{hourlyRate}/hour</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                View Profile
              </button>
              <button className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProjectCard = ({ title, designer, status, deadline, budget, progress, statusColor }: {
    title: string;
    designer: string;
    status: string;
    deadline: string;
    budget: string;
    progress: number;
    statusColor: string;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="text-sm text-gray-300">{status}</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Designer:</span>
          <span className="font-medium text-white">{designer}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Deadline:</span>
          <span className="font-medium text-white">{deadline}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Budget:</span>
          <span className="font-medium text-white">{budget}</span>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">Progress:</span>
            <span className="font-medium text-white">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            View Details
          </button>
          <button className="flex-1 px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
            Message
          </button>
        </div>
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
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xl font-bold text-white block leading-tight">Design Marketplace</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 ml-13">Client Portal</div>
        </div>

        {/* Navigation */}
        <div className="px-4 flex-1">
          <div className="text-xs font-semibold text-gray-200 mb-3 px-2">My Dashboard</div>
          
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
              onClick={() => setActiveMenu('Designers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Designers' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <Users size={20} />
              <span className="font-medium">Find Designers</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Favorites')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Favorites' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <Heart size={20} />
              <span className="font-medium">Saved Designers</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Analytics' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Project Analytics</span>
            </button>
          </div>

          {/* Communication Section */}
          <div className="text-xs font-semibold text-gray-200 mb-3 px-2 mt-8">Communication</div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition relative">
              <MessageSquare size={20} />
              <span className="font-medium">Messages</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">3</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition">
              <HelpCircle size={20} />
              <span className="font-medium">Support</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition">
              <Calendar size={20} />
              <span className="font-medium">Meetings</span>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-semibold">
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
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-400 text-sm mt-1">Find amazing designers and manage your projects</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200" size={20} />
            <input
              type="text"
              placeholder="Search designers, projects..."
              className="pl-12 pr-4 py-2 w-80 bg-green-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Stats */}
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
              title="Active Projects" 
              value={stats?.activeProjects?.toString() || "0"} 
              change={`+${stats?.recentProjects || 0} recent`} 
              isPositive={true}
              icon={<Briefcase size={20} />}
            />
            <StatCard 
              title="Total Spent" 
              value={`$${stats?.totalSpent || 0}`} 
              change={`+$${stats?.monthlySpent || 0} this month`} 
              isPositive={true}
              icon={<BarChart3 size={20} />}
            />
            <StatCard 
              title="Designers Worked With" 
              value={stats?.designersWorkedWith?.toString() || "0"} 
              change="+3 this week" 
              isPositive={true}
              icon={<Heart size={20} />}
            />
            <StatCard 
              title="Completed Projects" 
              value={stats?.completedProjects?.toString() || "0"} 
              change="+2 this month" 
              isPositive={true}
              icon={<Award size={20} />}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Current Projects */}
          <div className="col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Current Projects</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                <Briefcase size={16} />
                New Project
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProjectCard 
                title="Brand Identity Design"
                designer="Sarah Mukasa"
                status="In Progress"
                deadline="Dec 15, 2025"
                budget="$1,200"
                progress={75}
                statusColor="bg-blue-500"
              />
              <ProjectCard 
                title="Website Redesign"
                designer="James Okello"
                status="Review"
                deadline="Jan 20, 2026"
                budget="$2,000"
                progress={95}
                statusColor="bg-yellow-500"
              />
              <ProjectCard 
                title="Marketing Materials"
                designer="Grace Nabwire"
                status="Starting"
                deadline="Feb 10, 2026"
                budget="$800"
                progress={15}
                statusColor="bg-green-500"
              />
            </div>
          </div>

          {/* Quick Actions & Activity */}
          <div className="col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="bg-green-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-left">
                  <Users className="text-green-600" size={20} />
                  <div>
                    <div className="font-medium text-white">Browse Designers</div>
                    <div className="text-sm text-gray-400">Find the perfect match</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-100 hover:bg-green-200 rounded-lg transition text-left">
                  <Briefcase className="text-green-700" size={20} />
                  <div>
                    <div className="font-medium text-white">Post a Project</div>
                    <div className="text-sm text-gray-400">Get custom proposals</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left">
                  <MessageSquare className="text-blue-600" size={20} />
                  <div>
                    <div className="font-medium text-white">Message Designer</div>
                    <div className="text-sm text-gray-400">Start a conversation</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-green-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-white">Project update received</div>
                    <div className="text-xs text-gray-400">Sarah shared new designs • 2h ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-white">Payment processed</div>
                    <div className="text-xs text-gray-400">$400 milestone payment • 1d ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-white">New proposal received</div>
                    <div className="text-xs text-gray-400">3 designers submitted proposals • 2d ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Designers */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recommended for You</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 bg-green-800 border border-gray-200 rounded-lg hover:bg-cream-200 transition">
                <Filter size={16} />
                Filters
              </button>
              <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-semibold">
                View all <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DesignerCard 
              name="Sarah Mukasa"
              specialty="Brand & Identity Design"
              rating={4.9}
              hourlyRate="$45"
              location="Kampala"
              avatar="SM"
              isAvailable={true}
            />
            <DesignerCard 
              name="James Okello"
              specialty="Web & UI/UX Design"
              rating={4.8}
              hourlyRate="$55"
              location="Entebbe"
              avatar="JO"
              isAvailable={true}
            />
            <DesignerCard 
              name="Grace Nabwire"
              specialty="Print & Marketing Design"
              rating={4.7}
              hourlyRate="$40"
              location="Jinja"
              avatar="GN"
              isAvailable={false}
            />
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Your Design Journey</h3>
              <p className="text-sm" style={{color: '#f5f5dc'}}>Track your progress and achievements</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm" style={{color: '#f5f5dc'}}>Projects completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm" style={{color: '#f5f5dc'}}>Designers worked with</div>
              </div>
              <div>
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm" style={{color: '#f5f5dc'}}>Average project rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}