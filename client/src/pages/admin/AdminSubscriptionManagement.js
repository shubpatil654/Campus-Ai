import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react';
import adminSubscriptionService from '../../services/adminSubscriptionService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminSubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    planDistribution: {}
  });
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    plan_type: '',
    plan_name: '',
    description: '',
    amount: '',
    duration_days: 30,
    features: [],
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch data with individual error handling
      let subscriptionsData = [];
      let statsData = {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        planDistribution: {}
      };
      let plansData = [];

      try {
        const subscriptionsRes = await adminSubscriptionService.getAllSubscriptions();
        subscriptionsData = subscriptionsRes.data || [];
        console.log('Subscriptions data:', subscriptionsData);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to fetch subscriptions data');
      }

      try {
        const statsRes = await adminSubscriptionService.getSubscriptionStats();
        statsData = {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          expiredSubscriptions: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          planDistribution: {},
          ...(statsRes.data || {})
        };
        console.log('Stats data:', statsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to fetch statistics data');
      }

      try {
        const plansRes = await adminSubscriptionService.getSubscriptionPlans();
        plansData = plansRes.data || [];
        console.log('Plans data:', plansData);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to fetch plans data');
      }

      setSubscriptions(subscriptionsData);
      setStats(statsData);
      setPlans(plansData);
      
    } catch (error) {
      console.error('General error fetching data:', error);
      toast.error('Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (planData) => {
    try {
      // Map frontend data to backend expected format
      const mappedData = {
        planType: planData.plan_type,
        planName: planData.plan_name,
        description: planData.description,
        amount: planData.amount,
        duration: planData.duration_days,
        features: planData.features,
        isActive: planData.is_active
      };

      await adminSubscriptionService.updateSubscriptionPlan(mappedData);
      toast.success('Plan updated successfully');
      setEditingPlan(null);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddPlan = async () => {
    try {
      if (!newPlan.plan_type || !newPlan.plan_name || !newPlan.amount || !newPlan.duration_days) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Map frontend data to backend expected format
      const planData = {
        planType: newPlan.plan_type,
        planName: newPlan.plan_name,
        description: newPlan.description,
        amount: newPlan.amount,
        duration: newPlan.duration_days,
        features: newPlan.features,
        isActive: newPlan.is_active
      };

      await adminSubscriptionService.createSubscriptionPlan(planData);
      toast.success('Plan added successfully');
      setShowAddPlanModal(false);
      setNewPlan({
        plan_type: '',
        plan_name: '',
        description: '',
        amount: '',
        duration_days: 30,
        features: [],
        is_active: true
      });
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    fetchData(); // Refresh to get original data
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        // For now, we'll deactivate the plan instead of deleting
        await adminSubscriptionService.updateSubscriptionPlan({
          id: planId,
          is_active: false
        });
        toast.success('Plan deactivated successfully');
        fetchData();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleUpdateSubscription = async (subscriptionId, updateData) => {
    try {
      await adminSubscriptionService.updateSubscription(subscriptionId, updateData);
      toast.success('Subscription updated successfully');
      setEditingSubscription(null);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await adminSubscriptionService.deleteSubscription(subscriptionId);
        toast.success('Subscription deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleExtendSubscription = async (subscriptionId) => {
    try {
      await adminSubscriptionService.extendSubscription(subscriptionId, extendDays);
      toast.success(`Subscription extended by ${extendDays} days`);
      setShowExtendModal(false);
      setExtendDays(30);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
          <p className="text-gray-400">Manage college subscriptions, plans, and payments</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'subscriptions', label: 'Subscriptions', icon: Users },
            { id: 'plans', label: 'Plans', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Subscriptions</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalSubscriptions || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-white">{stats?.activeSubscriptions || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Plan Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(stats?.planDistribution || {}).map(([plan, count]) => (
                  <div key={plan} className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm capitalize">{plan} Plan</p>
                    <p className="text-xl font-bold text-white">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">All Subscriptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">College</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{subscription.colleges?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{subscription.colleges?.location || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{subscription.users?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{subscription.users?.email || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300 capitalize">{subscription.plan_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(subscription.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.payment_status)}`}>
                          {subscription.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {subscription.subscription_end_date ? formatDate(subscription.subscription_end_date) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowExtendModal(subscription.id)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Extend Subscription"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingSubscription(subscription)}
                            className="text-yellow-400 hover:text-yellow-300"
                            title="Edit Subscription"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscription(subscription.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete Subscription"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Add Plan Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>
              <button
                onClick={() => setShowAddPlanModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </button>
            </div>

            {plans.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white capitalize">{plan.plan_name}</h3>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{formatCurrency(plan.amount)}</p>
                      <p className="text-gray-400 text-sm">{plan.duration_days} days</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-yellow-400 hover:text-yellow-300 p-2"
                        title="Edit Plan"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Delete Plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {editingPlan && editingPlan.id === plan.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Plan Type</label>
                        <select
                          value={editingPlan.plan_type}
                          onChange={(e) => setEditingPlan({...editingPlan, plan_type: e.target.value})}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        >
                          <option value="trial">Trial</option>
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Plan Name</label>
                        <input
                          type="text"
                          value={editingPlan.plan_name}
                          onChange={(e) => setEditingPlan({...editingPlan, plan_name: e.target.value})}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          value={editingPlan.amount}
                          onChange={(e) => setEditingPlan({...editingPlan, amount: parseFloat(e.target.value)})}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Duration (days)</label>
                        <input
                          type="number"
                          value={editingPlan.duration_days}
                          onChange={(e) => setEditingPlan({...editingPlan, duration_days: parseInt(e.target.value)})}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Description</label>
                      <input
                        type="text"
                        value={editingPlan.description}
                        onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Features</label>
                      <textarea
                        value={Array.isArray(editingPlan.features) ? editingPlan.features.join('\n') : ''}
                        onChange={(e) => {
                          const features = e.target.value.split('\n');
                          setEditingPlan({...editingPlan, features});
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const textarea = e.target;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const value = textarea.value;
                            const newValue = value.substring(0, start) + '\n' + value.substring(end);
                            const features = newValue.split('\n');
                            setEditingPlan({...editingPlan, features});
                            
                            // Set cursor position after the newline
                            setTimeout(() => {
                              textarea.selectionStart = textarea.selectionEnd = start + 1;
                            }, 0);
                          }
                        }}
                        rows={4}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 resize-vertical"
                        placeholder="Enter features, one per line&#10;Press Enter for new line"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Status</label>
                      <select
                        value={editingPlan.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setEditingPlan({...editingPlan, is_active: e.target.value === 'active'})}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdatePlan(editingPlan)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Plan Type</label>
                        <p className="text-white capitalize">{plan.plan_type}</p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Amount</label>
                        <p className="text-white">{formatCurrency(plan.amount)}</p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Duration</label>
                        <p className="text-white">{plan.duration_days} days</p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.is_active ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'
                        }`}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Features</label>
                      <div className="space-y-1">
                        {Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-gray-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        )) : (
                          <p className="text-gray-400">No features listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Extend Subscription Modal */}
        {showExtendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-white mb-4">Extend Subscription</h3>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1">Extend by (days)</label>
                <input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  min="1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExtendSubscription(showExtendModal)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Extend
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Plan Modal */}
        {showAddPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Plan</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Plan Type *</label>
                    <select
                      value={newPlan.plan_type}
                      onChange={(e) => setNewPlan({...newPlan, plan_type: e.target.value})}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="">Select Plan Type</option>
                      <option value="trial">Trial</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Plan Name *</label>
                    <input
                      type="text"
                      value={newPlan.plan_name}
                      onChange={(e) => setNewPlan({...newPlan, plan_name: e.target.value})}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                      placeholder="e.g., Basic Plan"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      value={newPlan.amount}
                      onChange={(e) => setNewPlan({...newPlan, amount: parseFloat(e.target.value)})}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                      placeholder="999"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Duration (days)</label>
                    <input
                      type="number"
                      value={newPlan.duration_days}
                      onChange={(e) => setNewPlan({...newPlan, duration_days: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Description</label>
                  <input
                    type="text"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="Brief description of the plan"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Features</label>
                  <textarea
                    value={Array.isArray(newPlan.features) ? newPlan.features.join('\n') : ''}
                    onChange={(e) => {
                      const features = e.target.value.split('\n');
                      setNewPlan({...newPlan, features});
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const textarea = e.target;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        const newValue = value.substring(0, start) + '\n' + value.substring(end);
                        const features = newValue.split('\n');
                        setNewPlan({...newPlan, features});
                        
                        // Set cursor position after the newline
                        setTimeout(() => {
                          textarea.selectionStart = textarea.selectionEnd = start + 1;
                        }, 0);
                      }
                    }}
                    rows={4}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 resize-vertical"
                    placeholder="Enter features, one per line&#10;Press Enter for new line&#10;e.g.,&#10;College profile listing&#10;Course management&#10;Media gallery"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Status</label>
                  <select
                    value={newPlan.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setNewPlan({...newPlan, is_active: e.target.value === 'active'})}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowAddPlanModal(false);
                    setNewPlan({
                      plan_type: '',
                      plan_name: '',
                      description: '',
                      amount: '',
                      duration_days: 30,
                      features: [],
                      is_active: true
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlan}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionManagement;
