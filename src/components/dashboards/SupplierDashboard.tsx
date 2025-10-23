'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, LayoutDashboard, FileText, Users, BarChart3, Package, MessageSquare, HelpCircle, Calendar, ChevronDown, ArrowRight, Briefcase, MapPin, Award, Settings, Eye, Star, Clock, Filter, ShoppingCart, Truck, DollarSign, Store, CreditCard } from 'lucide-react';
import SubscriptionDashboard from '../subscription/SubscriptionDashboard';

interface SupplierDashboardProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onLogout: () => void;
}

export default function SupplierDashboard({ user, onLogout }: SupplierDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const StatCard = ({ title, value, change, isPositive, icon }: {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-200 text-sm">{title}</div>
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

  const ProductCard = ({ name, category, price, stock, image, status, statusColor }: {
    name: string;
    category: string;
    price: string;
    stock: number;
    image: string;
    status: string;
    statusColor: string;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-lg ${image} flex items-center justify-center`}>
          <Package className="text-white/50" size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{name}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
              <span className="text-sm text-gray-300">{status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-2">{category}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white">{price}</span>
            <span className="text-gray-200">Stock: {stock}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 px-3 py-1 text-xs bg-cream-200 hover:bg-cream-300 rounded-lg transition">
              Edit
            </button>
            <button className="flex-1 px-3 py-1 text-xs bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderCard = ({ orderId, customer, products, total, status, date, statusColor }: {
    orderId: string;
    customer: string;
    products: number;
    total: string;
    status: string;
    date: string;
    statusColor: string;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Order #{orderId}</h3>
          <p className="text-sm text-gray-200">{customer}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="text-sm text-gray-300">{status}</span>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-200">Products:</span>
          <span className="font-medium text-white">{products} items</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-200">Total:</span>
          <span className="font-medium text-white">{total}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-200">Date:</span>
          <span className="font-medium text-white">{date}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 px-3 py-2 text-sm bg-cream-200 hover:bg-cream-300 rounded-lg transition">
          View Details
        </button>
        <button className="flex-1 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition">
          Update Status
        </button>
      </div>
    </div>
  );

  const InquiryCard = ({ customer, productName, message, date, isNew }: {
    customer: string;
    productName: string;
    message: string;
    date: string;
    isNew: boolean;
  }) => (
    <div className="bg-green-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{customer}</h3>
          <p className="text-sm text-gray-200">About: {productName}</p>
        </div>
        {isNew && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">New</span>
        )}
      </div>
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{message}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-200">{date}</span>
        <button className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition">
          Reply
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-green-100">
      {/* Sidebar */}
      <div className="w-64 bg-cream-200/90 backdrop-blur-sm shadow-xl border-r border-gray-300 flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
              <Store className="text-white" size={20} />
            </div>
            <div>
              <span className="text-xl font-bold text-white block leading-tight">Women in Design</span>
            </div>
          </div>
          <div className="text-xs text-gray-200 ml-13">Supplier Portal</div>
        </div>

        {/* Navigation */}
        <div className="px-4 flex-1">
          <div className="text-xs font-semibold text-gray-200 mb-3 px-2">My Business</div>
          
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
              onClick={() => setActiveMenu('Products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Products' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <Package size={20} />
              <span className="font-medium">Products</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Orders' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <ShoppingCart size={20} />
              <span className="font-medium">Orders</span>
            </button>

            <button 
              onClick={() => setActiveMenu('Inquiries')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === 'Inquiries' ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-cream-200'
              }`}
            >
              <MessageSquare size={20} />
              <span className="font-medium">Inquiries</span>
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
          </div>

          {/* Business Section */}
          <div className="text-xs font-semibold text-gray-200 mb-3 px-2 mt-8">Business Tools</div>
          
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition">
              <DollarSign size={20} />
              <span className="font-medium">Payments</span>
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
              <Truck size={20} />
              <span className="font-medium">Shipping</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition">
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-cream-200 transition">
              <HelpCircle size={20} />
              <span className="font-medium">Support</span>
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
              <div className="text-sm text-gray-200">Supplier</div>
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
          <SubscriptionDashboard userType="supplier" />
        ) : (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Supplier Portal</h1>
                <p className="text-gray-200 text-sm mt-1">Manage your products, orders, and business operations</p>
              </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200" size={20} />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="pl-12 pr-4 py-2 w-64 bg-green-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition">
              <Package size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Products" 
            value="24" 
            change="+3 this month" 
            isPositive={true}
            icon={<Package size={20} />}
          />
          <StatCard 
            title="Monthly Revenue" 
            value="$8,640" 
            change="+18%" 
            isPositive={true}
            icon={<DollarSign size={20} />}
          />
          <StatCard 
            title="Active Orders" 
            value="12" 
            change="+5 this week" 
            isPositive={true}
            icon={<ShoppingCart size={20} />}
          />
          <StatCard 
            title="New Inquiries" 
            value="8" 
            change="+2 today" 
            isPositive={true}
            icon={<MessageSquare size={20} />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              <button className="text-gray-200 hover:text-white text-sm font-semibold">
                View all orders
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <OrderCard 
                orderId="ORD-2025-001"
                customer="Sarah Mukasa Design"
                products={3}
                total="$480"
                status="Processing"
                date="Dec 20, 2025"
                statusColor="bg-blue-500"
              />
              <OrderCard 
                orderId="ORD-2025-002"
                customer="TechStart Uganda"
                products={1}
                total="$120"
                status="Shipped"
                date="Dec 18, 2025"
                statusColor="bg-green-500"
              />
              <OrderCard 
                orderId="ORD-2025-003"
                customer="Creative Studio"
                products={5}
                total="$750"
                status="Pending"
                date="Dec 22, 2025"
                statusColor="bg-yellow-500"
              />
              <OrderCard 
                orderId="ORD-2025-004"
                customer="Local NGO"
                products={2}
                total="$200"
                status="Delivered"
                date="Dec 15, 2025"
                statusColor="bg-gray-500"
              />
            </div>

            {/* Top Products */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Top Products</h2>
              <button className="text-gray-200 hover:text-white text-sm font-semibold">
                Manage products
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProductCard 
                name="Premium Design Paper"
                category="Paper & Materials"
                price="$25/pack"
                stock={45}
                image="bg-gradient-to-br from-green-400 to-green-500"
                status="In Stock"
                statusColor="bg-green-500"
              />
              <ProductCard 
                name="Professional Markers Set"
                category="Drawing Tools"
                price="$85/set"
                stock={12}
                image="bg-gradient-to-br from-green-400 to-blue-500"
                status="Low Stock"
                statusColor="bg-yellow-500"
              />
              <ProductCard 
                name="Canvas Boards (A3)"
                category="Canvas & Boards"
                price="$15/piece"
                stock={28}
                image="bg-gradient-to-br from-green-500 to-green-600"
                status="In Stock"
                statusColor="bg-green-500"
              />
              <ProductCard 
                name="Digital Graphics Tablet"
                category="Digital Tools"
                price="$320/unit"
                stock={0}
                image="bg-gradient-to-br from-green-600 to-green-700"
                status="Out of Stock"
                statusColor="bg-red-500"
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
                  <Package className="text-green-600" size={20} />
                  <div>
                    <div className="font-medium text-white">Add New Product</div>
                    <div className="text-sm text-gray-200">Expand your catalog</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-green-100 hover:bg-green-200 rounded-lg transition text-left">
                  <Truck className="text-green-700" size={20} />
                  <div>
                    <div className="font-medium text-white">Update Shipping</div>
                    <div className="text-sm text-gray-200">Manage delivery options</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-left">
                  <BarChart3 className="text-blue-600" size={20} />
                  <div>
                    <div className="font-medium text-white">View Analytics</div>
                    <div className="text-sm text-gray-200">Track performance</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-green-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Inquiries</h3>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">3 new</span>
              </div>
              <div className="space-y-4">
                <InquiryCard 
                  customer="James Okello"
                  productName="Premium Design Paper"
                  message="Hi, I'm interested in bulk pricing for 50 packs. Can you provide a quote?"
                  date="2h ago"
                  isNew={true}
                />
                <InquiryCard 
                  customer="Grace Nabwire"
                  productName="Canvas Boards"
                  message="Do you have custom sizes available? I need 40x60cm boards for my project."
                  date="5h ago"
                  isNew={true}
                />
                <InquiryCard 
                  customer="Creative Studio"
                  productName="Professional Markers"
                  message="When will the new color set be available? We're planning to place a large order."
                  date="1d ago"
                  isNew={false}
                />
              </div>
              <button className="w-full mt-4 text-sm text-gray-200 hover:text-white font-medium">
                View all inquiries
              </button>
            </div>

            {/* Business Stats */}
            <div className="bg-green-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Orders Completed</span>
                  <span className="font-semibold text-white">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Revenue Generated</span>
                  <span className="font-semibold text-white">$8,640</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">New Customers</span>
                  <span className="font-semibold text-white">12</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">Customer Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-current" size={14} />
                      <span className="font-bold text-white">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Your Business Impact</h3>
              <p className="text-sm" style={{ color: '#f5f5dc' }}>Supporting the design community with quality supplies</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }}>Products sold</div>
              </div>
              <div>
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }}>Happy customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">$24.5K</div>
                <div className="text-sm" style={{ color: '#f5f5dc' }}>Total revenue</div>
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