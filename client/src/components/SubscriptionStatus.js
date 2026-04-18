import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/paymentService';
import { CreditCard, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';

const SubscriptionStatus = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (user && (user.role === 'college_admin' || user.role === 'college')) {
      fetchSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (subscriptionStatus?.subscription?.subscription_end_date) {
      const interval = setInterval(() => {
        updateTimeLeft();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [subscriptionStatus]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await paymentService.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeLeft = () => {
    if (!subscriptionStatus?.subscription?.subscription_end_date) return;

    const endDate = new Date(subscriptionStatus.subscription.subscription_end_date);
    const now = new Date();
    const difference = endDate - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-gray-300">Loading subscription status...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'college_admin' && user.role !== 'college')) {
    return null;
  }

  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription;
  const isExpired = subscriptionStatus?.isExpired;
  const daysRemaining = subscriptionStatus?.daysRemaining || 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Subscription Status
        </h3>
        {hasActiveSubscription && !isExpired ? (
          <span className="flex items-center text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active
          </span>
        ) : (
          <span className="flex items-center text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {isExpired ? 'Expired' : 'Inactive'}
          </span>
        )}
      </div>

      {hasActiveSubscription && !isExpired ? (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Plan</span>
              <span className="text-white font-medium">
                {subscriptionStatus.subscription?.plan_type?.charAt(0).toUpperCase() + 
                 subscriptionStatus.subscription?.plan_type?.slice(1)} Plan
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Amount</span>
              <span className="text-white font-medium">
                ₹{subscriptionStatus.subscription?.amount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Payment Date</span>
              <span className="text-white font-medium">
                {new Date(subscriptionStatus.subscription?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Time Remaining</span>
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white bg-opacity-20 rounded p-2">
                <div className="text-white font-bold text-lg">{timeLeft.days}</div>
                <div className="text-white text-xs">Days</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-2">
                <div className="text-white font-bold text-lg">{timeLeft.hours}</div>
                <div className="text-white text-xs">Hours</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-2">
                <div className="text-white font-bold text-lg">{timeLeft.minutes}</div>
                <div className="text-white text-xs">Minutes</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded p-2">
                <div className="text-white font-bold text-lg">{timeLeft.seconds}</div>
                <div className="text-white text-xs">Seconds</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Expires On</span>
              <span className="text-white font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(subscriptionStatus.subscription?.subscription_end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">
            {isExpired ? 'Subscription Expired' : 'No Active Subscription'}
          </h4>
          <p className="text-gray-400 text-sm mb-4">
            {isExpired 
              ? 'Your subscription has expired. Please renew to continue using premium features.'
              : 'Subscribe to get access to all premium features for your college listing.'
            }
          </p>
          <button
            onClick={() => window.location.href = '/college/payment'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            {isExpired ? 'Renew Subscription' : 'Subscribe Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
