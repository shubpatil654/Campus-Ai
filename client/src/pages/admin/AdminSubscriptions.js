import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  Check,
  X,
  Star,
  Crown,
  Zap,
  Shield
} from 'lucide-react';

const AdminSubscriptions = () => {
  const [activeTab, setActiveTab] = useState('plans');

  // Mock data - replace with real data from API
  const subscriptionStats = {
    totalRevenue: 45680,
    activeSubscriptions: 89,
    monthlyRecurring: 12340,
    churnRate: 2.3
  };

  const subscriptionPlans = [
    {
      id: 1,
      name: 'Basic',
      price: 99,
      period: 'month',
      features: [
        'Up to 5 college searches',
        'Basic AI chat support',
        'Email notifications',
        'Standard response time'
      ],
      subscribers: 45,
      revenue: 4455,
      status: 'active',
      icon: Star,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Premium',
      price: 199,
      period: 'month',
      features: [
        'Unlimited college searches',
        'Priority AI chat support',
        'SMS + Email notifications',
        'Fast response time',
        'Advanced filters',
        'College comparison tool'
      ],
      subscribers: 32,
      revenue: 6368,
      status: 'active',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 499,
      period: 'month',
      features: [
        'Everything in Premium',
        'Dedicated support manager',
        'Custom integrations',
        'API access',
        'White-label options',
        'Advanced analytics',
        'Priority feature requests'
      ],
      subscribers: 12,
      revenue: 5988,
      status: 'active',
      icon: Shield,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentSubscriptions = [
    {
      id: 1,
      user: 'John Doe',
      plan: 'Premium',
      amount: 199,
      status: 'active',
      startDate: '2024-01-15',
      nextBilling: '2024-02-15',
      paymentMethod: 'Credit Card'
    },
    {
      id: 2,
      user: 'Jane Smith',
      plan: 'Basic',
      amount: 99,
      status: 'active',
      startDate: '2024-01-20',
      nextBilling: '2024-02-20',
      paymentMethod: 'UPI'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      plan: 'Enterprise',
      amount: 499,
      status: 'cancelled',
      startDate: '2024-01-10',
      nextBilling: null,
      paymentMethod: 'Bank Transfer'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const tabs = [
    { id: 'plans', name: 'Subscription Plans', icon: CreditCard },
    { id: 'subscribers', name: 'Subscribers', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="text-gray-400 mt-2">Manage subscription plans and monitor revenue</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/30 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add New Plan</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-2">₹{subscriptionStats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Subscriptions</p>
              <p className="text-2xl font-bold text-white mt-2">{subscriptionStats.activeSubscriptions}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Monthly Recurring</p>
              <p className="text-2xl font-bold text-white mt-2">₹{subscriptionStats.monthlyRecurring.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Churn Rate</p>
              <p className="text-2xl font-bold text-white mt-2">{subscriptionStats.churnRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Subscription plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div key={plan.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                      <span className="text-gray-400 ml-1">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Subscribers</span>
                      <span className="text-white font-medium">{plan.subscribers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Revenue</span>
                      <span className="text-white font-medium">₹{plan.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          {/* Subscribers table */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Next Billing
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                              {subscription.user.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">{subscription.user}</div>
                            <div className="text-sm text-gray-400">{subscription.paymentMethod}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-400/20 text-yellow-400 rounded-full">
                          {subscription.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">₹{subscription.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {subscription.nextBilling || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-400 hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics charts placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Revenue Trend</h2>
              <div className="h-64 bg-gray-700/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Revenue chart will be displayed here</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Subscription Growth</h2>
              <div className="h-64 bg-gray-700/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Growth chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
