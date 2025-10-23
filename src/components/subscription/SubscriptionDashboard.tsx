'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Package, Crown, CheckCircle, AlertCircle, Clock, Zap, Shield, Star, Users, TrendingUp, Download, Settings, ArrowRight } from 'lucide-react';

interface SubscriptionDashboardProps {
  userType: 'designer' | 'supplier';
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  limits: any;
  userType: string;
  popular?: boolean;
}

interface CurrentSubscription {
  subscription: {
    id: string;
    planId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  plan: SubscriptionPlan;
}

interface UsageData {
  portfolioItems?: { used: number; limit: number };
  imageUploads?: { used: number; limit: number };
  productLines?: { used: number; limit: number };
  storageUsed?: { bytes: number; readable: string };
}

export default function SubscriptionDashboard({ userType }: SubscriptionDashboardProps) {
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [usageData, setUsageData] = useState<UsageData>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, [userType]);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch current subscription
      const currentResponse = await fetch('/api/subscription/current', { headers });
      const currentData = await currentResponse.json();
      if (currentData.success) {
        setCurrentSubscription(currentData.data);
      }

      // Fetch available plans
      const plansResponse = await fetch(`/api/subscription/plans?userType=${userType}`, { headers });
      const plansData = await plansResponse.json();
      if (plansData.success) {
        setAvailablePlans(plansData.data);
      }

      // Fetch usage data
      const usageResponse = await fetch('/api/subscription/usage', { headers });
      const usageData = await usageResponse.json();
      if (usageData.success) {
        setUsageData(usageData.data);
      }

    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (planId: string) => {
    setActionLoading(planId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/change', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh subscription data
        await fetchSubscriptionData();
      } else {
        alert('Failed to change plan: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to change plan:', error);
      alert('Failed to change plan. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubscriptionData();
      } else {
        alert('Failed to cancel subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        await fetchSubscriptionData();
      } else {
        alert('Failed to reactivate subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      alert('Failed to reactivate subscription. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return 'Free';
    return `${currency} ${price.toLocaleString()}/${interval === 'yearly' ? 'year' : 'month'}`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500 bg-red-100';
    if (percentage >= 75) return 'text-yellow-500 bg-yellow-100';
    return 'text-green-500 bg-green-100';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-cream-100 rounded-xl p-6 shadow-sm border border-gray-300">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Subscription Management</h1>
        <p className="text-gray-700">Manage your plan, usage, and billing settings</p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-cream-100 rounded-xl p-6 shadow-sm border border-gray-300 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black">Current Plan</h2>
          {currentSubscription?.plan && (
            <div className="flex items-center gap-2">
              {currentSubscription.plan.price > 0 && <Crown className="text-yellow-500" size={20} />}
              <span className="text-lg font-semibold text-black">{currentSubscription.plan.name}</span>
            </div>
          )}
        </div>

        {currentSubscription && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Plan</div>
              <div className="text-lg font-semibold text-black">
                {currentSubscription.plan.name} - {formatPrice(currentSubscription.plan.price, currentSubscription.plan.currency, currentSubscription.plan.interval)}
              </div>
            </div>

            {currentSubscription.subscription && (
              <>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    {currentSubscription.subscription.status === 'active' ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : currentSubscription.subscription.status === 'cancelled' ? (
                      <AlertCircle className="text-yellow-500" size={16} />
                    ) : (
                      <Clock className="text-gray-500" size={16} />
                    )}
                    <span className="capitalize font-medium">
                      {currentSubscription.subscription.status}
                      {currentSubscription.subscription.cancelAtPeriodEnd && ' (Cancelling)'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {currentSubscription.subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing'}
                  </div>
                  <div className="text-lg font-semibold text-black">
                    {new Date(currentSubscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {currentSubscription?.subscription?.cancelAtPeriodEnd ? (
            <button
              onClick={handleReactivateSubscription}
              disabled={actionLoading === 'reactivate'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {actionLoading === 'reactivate' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle size={16} />
              )}
              Reactivate Subscription
            </button>
          ) : currentSubscription?.subscription && currentSubscription.plan.price > 0 && (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading === 'cancel'}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {actionLoading === 'cancel' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <AlertCircle size={16} />
              )}
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-cream-100 rounded-xl p-6 shadow-sm border border-gray-300 mb-8">
        <h2 className="text-xl font-bold text-black mb-6">Usage & Limits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userType === 'designer' && (
            <>
              {usageData.portfolioItems && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">Portfolio Items</span>
                    <span className="text-sm text-gray-600">
                      {usageData.portfolioItems.used}/{usageData.portfolioItems.limit === -1 ? '∞' : usageData.portfolioItems.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${usageData.portfolioItems.limit === -1 ? 'bg-green-500' : getUsageColor(getUsagePercentage(usageData.portfolioItems.used, usageData.portfolioItems.limit)).replace('text-', 'bg-').replace(' bg-', '-')}`}
                      style={{ 
                        width: usageData.portfolioItems.limit === -1 
                          ? '100%' 
                          : `${getUsagePercentage(usageData.portfolioItems.used, usageData.portfolioItems.limit)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {usageData.imageUploads && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">Image Uploads</span>
                    <span className="text-sm text-gray-600">
                      {usageData.imageUploads.used}/{usageData.imageUploads.limit === -1 ? '∞' : usageData.imageUploads.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${usageData.imageUploads.limit === -1 ? 'bg-green-500' : getUsageColor(getUsagePercentage(usageData.imageUploads.used, usageData.imageUploads.limit)).replace('text-', 'bg-').replace(' bg-', '-')}`}
                      style={{ 
                        width: usageData.imageUploads.limit === -1 
                          ? '100%' 
                          : `${getUsagePercentage(usageData.imageUploads.used, usageData.imageUploads.limit)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {usageData.storageUsed && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">Storage Used</span>
                    <span className="text-sm text-gray-600">{usageData.storageUsed.readable}</span>
                  </div>
                  <div className="text-xs text-gray-500">Estimated storage usage</div>
                </div>
              )}
            </>
          )}

          {userType === 'supplier' && usageData.productLines && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-black">Product Lines</span>
                <span className="text-sm text-gray-600">
                  {usageData.productLines.used}/{usageData.productLines.limit === -1 ? '∞' : usageData.productLines.limit}
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${usageData.productLines.limit === -1 ? 'bg-green-500' : getUsageColor(getUsagePercentage(usageData.productLines.used, usageData.productLines.limit)).replace('text-', 'bg-').replace(' bg-', '-')}`}
                  style={{ 
                    width: usageData.productLines.limit === -1 
                      ? '100%' 
                      : `${getUsagePercentage(usageData.productLines.used, usageData.productLines.limit)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black">Available Plans</h2>
          <span className="text-sm text-gray-600">Choose the plan that fits your needs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availablePlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-cream-100 rounded-xl p-6 shadow-sm border-2 transition-all ${
                currentSubscription?.plan.id === plan.id 
                  ? 'border-pink-500 ring-2 ring-pink-100' 
                  : 'border-gray-300 hover:border-pink-200'
              } ${plan.popular ? 'relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star size={12} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-black">{plan.name}</h3>
                  {currentSubscription?.plan.id === plan.id && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Current</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-black mb-1">
                  {formatPrice(plan.price, plan.currency, plan.interval)}
                </div>
                {plan.interval === 'yearly' && plan.price > 0 && (
                  <div className="text-sm text-gray-600">
                    Save {Math.round((1 - (plan.price / 12) / (plan.price === 50000 ? 5000 : 20000)) * 100)}% vs monthly
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm text-black">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanChange(plan.id)}
                disabled={currentSubscription?.plan.id === plan.id || actionLoading === plan.id}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentSubscription?.plan.id === plan.id
                    ? 'bg-gray-200 text-gray-600'
                    : plan.popular
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                    : 'bg-cream-200 hover:bg-cream-300 text-black'
                }`}
              >
                {actionLoading === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : currentSubscription?.plan.id === plan.id ? (
                  'Current Plan'
                ) : plan.price > (currentSubscription?.plan.price || 0) ? (
                  `Upgrade to ${plan.name}`
                ) : plan.price < (currentSubscription?.plan.price || 0) ? (
                  `Downgrade to ${plan.name}`
                ) : (
                  `Switch to ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-cream-100 rounded-xl p-6 shadow-sm border border-gray-300">
        <h2 className="text-xl font-bold text-black mb-4">Payment Methods</h2>
        <div className="flex items-center gap-4 p-4 bg-cream-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <CreditCard className="text-white" size={20} />
            </div>
            <div>
              <div className="font-medium text-black">Mobile Money</div>
              <div className="text-sm text-gray-600">MTN Mobile Money • Airtel Money</div>
            </div>
          </div>
          <div className="ml-auto">
            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
              Manage Payment Methods
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}