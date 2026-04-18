import api from './api';

const paymentService = {
  // Create Razorpay order
  createOrder: async (amount, currency = 'INR') => {
    try {
      const response = await api.post('/payments/create-order', {
        amount,
        currency
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  },

  // Get subscription status
  getSubscriptionStatus: async () => {
    try {
      const response = await api.get('/payments/subscription-status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get subscription status');
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payments/payment-history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get payment history');
    }
  }
};

export default paymentService;
