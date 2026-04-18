import api from './api';

const adminSubscriptionService = {
  // Get all subscriptions with details
  getAllSubscriptions: async () => {
    try {
      const response = await api.get('/admin/subscriptions');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  },

  // Get subscription statistics
  getSubscriptionStats: async () => {
    try {
      const response = await api.get('/admin/subscriptions/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription statistics');
    }
  },

  // Get subscription plans
  getSubscriptionPlans: async () => {
    try {
      const response = await api.get('/admin/subscriptions/plans');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription plans');
    }
  },

  // Create new subscription plan
  createSubscriptionPlan: async (planData) => {
    try {
      const response = await api.post('/admin/subscriptions/plans', planData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create subscription plan');
    }
  },

  // Update subscription plan
  updateSubscriptionPlan: async (planData) => {
    try {
      const response = await api.put('/admin/subscriptions/plans', planData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update subscription plan');
    }
  },

  // Update individual subscription
  updateSubscription: async (subscriptionId, updateData) => {
    try {
      const response = await api.put(`/admin/subscriptions/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update subscription');
    }
  },

  // Delete subscription
  deleteSubscription: async (subscriptionId) => {
    try {
      const response = await api.delete(`/admin/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete subscription');
    }
  },

  // Extend subscription
  extendSubscription: async (subscriptionId, days) => {
    try {
      const response = await api.post(`/admin/subscriptions/${subscriptionId}/extend`, { days });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to extend subscription');
    }
  }
};

export default adminSubscriptionService;
