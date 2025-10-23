'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, LayoutDashboard, FileText, Users, BarChart3, Palette, MessageSquare, HelpCircle, Calendar, ChevronDown, ArrowRight, Briefcase, MapPin, Award, Package, Eye, Star, Clock, Filter, Camera, Upload, DollarSign, CreditCard } from 'lucide-react';
import SubscriptionDashboard from '../subscription/SubscriptionDashboard';

interface DesignerDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
}

export default function DesignerDashboard({ user, onLogout }: DesignerDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
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
        const projectsResponse = await fetch('/api/dashboard/projects?limit=4', { headers });
        const projectsData = await projectsResponse.json();
        if (projectsData.success) {
          setProjects(projectsData.data.projects);
        }

        // Fetch portfolio
        const portfolioResponse = await fetch('/api/dashboard/portfolio?limit=3', { headers });
        const portfolioData = await portfolioResponse.json();
        if (portfolioData.success) {
          setPortfolio(portfolioData.data.portfolioItems);
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
        <div className="text-gray-400">{icon}</div>
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

  const ProjectCard = ({ title, client, status, deadline, budget, type, statusColor }: {
    title: string;
    client: string;
    status: string;
    deadline: string;
    budget: string;
    type: string;
    statusColor: string;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="text-sm font-medium text-gray-300">{status}</span>
        </div>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">{type}</span>
      </div>
      <h3 className="font-semibold text-white mb-3">{title}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Client:</span>
          <span className="font-medium text-white">{client}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Deadline:</span>
          <span className="font-medium text-white">{deadline}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Budget:</span>
          <span className="font-medium text-white">{budget}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
          View Details
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
          Update
        </button>
      </div>
    </div>
  );

  const PortfolioItem = ({ title, category, likes, views, imageColor }: {
    title: string;
    category: string;
    likes: number;
    views: number;
    imageColor: string;
  }) => (
    <div className="bg-green-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-32 ${imageColor} flex items-center justify-center`}>
        <Camera className="text-white/50" size={32} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400 mb-3">{category}</p>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} />
            <span>{likes}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ProposalCard = ({ projectTitle, client, budget, deadline, description, isActive }: {
    projectTitle: string;
    client: string;
    budget: string;
    deadline: string;
    description: string;
    isActive: boolean;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white mb-1">{projectTitle}</h3>
          <p className="text-sm text-gray-400">by {client}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-300'
        }`}>
          {isActive ? 'Active' : 'Closed'}
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-4">{description}</p>
      <div className="flex items-center justify-between text-sm mb-4">
        <div>
          <span className="text-gray-400">Budget: </span>
          <span className="font-semibold text-white">{budget}</span>
        </div>
        <div>
          <span className="text-gray-400">Deadline: </span>
          <span className="font-semibold text-white">{deadline}</span>
        </div>
      </div>
      {isActive && (
        <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
          Submit Proposal
        </button>
      )}
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
              <Palette className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xl font-bold text-white block leading-tight">Design Marketplace</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 ml-13">Designer Studio</div>
        </div>

        {/* Navigation */}
        <div className="px-4 flex-1">
          <div className="text-xs font-semibold text-gray-400 mb-3 px-2">My Studio</div>
          
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
              onClick={() => setActiveMenu('Projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Projects' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <Briefcase size={20} />
              <span className="font-medium">My Projects</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Portfolio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Portfolio' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <Camera size={20} />
              <span className="font-medium">Portfolio</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Proposals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Proposals' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <span className="font-medium">Proposals</span>
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
          </div>

          {/* Business Section */}
          <div className="text-xs font-semibold text-gray-400 mb-3 px-2 mt-8">Business</div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-50 transition">
              <DollarSign size={20} />
              <span className="font-medium">Earnings</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Subscription')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Subscription' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={20} />
              <span className="font-medium">Subscription</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-50 transition relative">
              <MessageSquare size={20} />
              <span className="font-medium">Messages</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">5</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-50 transition">
              <HelpCircle size={20} />
              <span className="font-medium">Support</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-50 transition">
              <Calendar size={20} />
              <span className="font-medium">Schedule</span>
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
              <div className="text-sm text-gray-400">Designer</div>
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
          <SubscriptionDashboard userType="designer" />
        ) : (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Designer Studio</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your projects, portfolio, and client relationships</p>
              </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects, clients..."
                className="pl-12 pr-4 py-2 w-64 bg-green-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
              <Upload size={16} />
              Upload Work
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Projects" 
            value="5" 
            change="+2 this month" 
            isPositive={true}
            icon={<Briefcase size={20} />}
          />
          <StatCard 
            title="This Month Earnings" 
            value="$3,240" 
            change="+28%" 
            isPositive={true}
            icon={<DollarSign size={20} />}
          />
          <StatCard 
            title="Portfolio Views" 
            value="1,847" 
            change="+156 this week" 
            isPositive={true}
            icon={<Eye size={20} />}
          />
          <StatCard 
            title="Client Rating" 
            value="4.9" 
            change="+0.2 this month" 
            isPositive={true}
            icon={<Star size={20} />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Current Projects */}
          <div className="col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Current Projects</h2>
              <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
                View all projects
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ProjectCard 
                title="E-commerce Brand Identity"
                client="TechStart Uganda"
                status="In Progress"
                deadline="Dec 20, 2025"
                budget="$1,500"
                type="Branding"
                statusColor="bg-blue-500"
              />
              <ProjectCard 
                title="Mobile App UI Design"
                client="FinTech Solutions"
                status="Review Phase"
                deadline="Jan 15, 2026"
                budget="$2,200"
                type="UI/UX"
                statusColor="bg-yellow-500"
              />
              <ProjectCard 
                title="Website Redesign"
                client="Local NGO"
                status="Starting Soon"
                deadline="Feb 5, 2026"
                budget="$1,800"
                type="Web Design"
                statusColor="bg-green-500"
              />
              <ProjectCard 
                title="Print Campaign"
                client="Fashion Boutique"
                status="Awaiting Feedback"
                deadline="Dec 30, 2025"
                budget="$900"
                type="Print"
                statusColor="bg-orange-500"
              />
            </div>

            {/* Recent Portfolio Work */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Portfolio Work</h2>
              <button className="text-green-600 hover:text-green-700 text-sm font-semibold">
                Manage portfolio
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PortfolioItem 
                title="Minimalist Logo Design"
                category="Branding"
                likes={34}
                views={287}
                imageColor="bg-gradient-to-br from-green-400 to-green-500"
              />
              <PortfolioItem 
                title="Food App Interface"
                category="Mobile UI"
                likes={56}
                views={432}
                imageColor="bg-gradient-to-br from-green-400 to-blue-500"
              />
              <PortfolioItem 
                title="Corporate Website"
                category="Web Design"
                likes={23}
                views={198}
                imageColor="bg-gradient-to-br from-green-500 to-green-600"
              />
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="col-span-4 space-y-6">
            {/* Quick Actions */}
            <div className="bg-green-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-left">
                  <Upload className="text-green-600" size={20} />
                  <div>
                    <div className="font-medium text-white">Upload New Work</div>
                    <div className="text-sm text-gray-400">Add to portfolio</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-100 hover:bg-green-200 rounded-lg transition text-left">
                  <FileText className="text-green-700" size={20} />
                  <div>
                    <div className="font-medium text-white">Create Proposal</div>
                    <div className="text-sm text-gray-400">Respond to brief</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left">
                  <MessageSquare className="text-blue-600" size={20} />
                  <div>
                    <div className="font-medium text-white">Contact Client</div>
                    <div className="text-sm text-gray-400">Send message</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-green-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-4">Earnings This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Completed Projects</span>
                  <span className="font-semibold text-white">$2,100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ongoing Milestones</span>
                  <span className="font-semibold text-white">$1,140</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">Total Earned</span>
                    <span className="font-bold text-xl text-white">$3,240</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
                  Request Payout
                </button>
              </div>
            </div>

            {/* Client Messages */}
            <div className="bg-green-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-4">Recent Messages</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-sm font-semibold">
                    TS
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">TechStart Uganda</div>
                    <div className="text-xs text-gray-400">Love the latest designs! Can we...</div>
                    <div className="text-xs text-gray-400 mt-1">2h ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    FS
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">FinTech Solutions</div>
                    <div className="text-xs text-gray-400">Ready for the next milestone review</div>
                    <div className="text-xs text-gray-400 mt-1">5h ago</div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-sm text-green-600 hover:text-green-700 font-medium">
                View all messages
              </button>
            </div>
          </div>
        </div>

        {/* Available Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Available Projects</h2>
            <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-semibold">
              Browse all <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProposalCard 
              projectTitle="Restaurant Brand Identity"
              client="Urban Eats Ltd"
              budget="$1,200 - $2,000"
              deadline="Jan 30, 2026"
              description="Looking for a modern, friendly brand identity for a new restaurant concept focusing on healthy, locally-sourced meals."
              isActive={true}
            />
            <ProposalCard 
              projectTitle="E-learning Platform UI"
              client="EduTech Africa"
              budget="$2,500 - $4,000"
              deadline="Feb 15, 2026"
              description="Need a complete UI/UX design for an online learning platform targeting university students in East Africa."
              isActive={true}
            />
            <ProposalCard 
              projectTitle="Social Impact Campaign"
              client="Clean Water Initiative"
              budget="$800 - $1,200"
              deadline="Closed"
              description="Design materials for a campaign raising awareness about clean water access in rural communities."
              isActive={false}
            />
          </div>
        </div>

        {/* Performance Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Your Design Impact</h3>
              <p className="text-sm" style={{ color: '#f5f5dc' }}>Making a difference through great design</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }}>Happy clients</div>
              </div>
              <div>
                <div className="text-2xl font-bold">47</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }}>Projects completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">$18.5K</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }}>Total earned</div>
              </div>
            </div>
          </div>
        </div>
          </div>
        )}
      </div>
    </div>
  );
}