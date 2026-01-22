import React, { useEffect, useState } from 'react';
import { membershipService } from '../services/membershipService';

const MembershipStatus = ({ userId, compact = false }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchSubscription();
    }
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      const result = await membershipService.getSubscription(userId);
      if (result.success && result.data) {
        setSubscription(result.data);
        calculateStatus(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (sub) => {
    const now = new Date();
    const expiresAt = new Date(sub.expires_at);
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
    
    const isExpired = expiresAt < now;
    const isExpiringSoon = daysRemaining <= 2 && daysRemaining > 0;
    const isActive = sub.status === 'active' && !isExpired;
    
    setStatus({
      isActive,
      isExpired,
      isExpiringSoon,
      daysRemaining,
      hoursRemaining,
      purchasesLeft: sub.purchases_left,
      expiresAt,
      planName: sub.plan_id?.name || 'Membership',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!subscription || !status) {
    return null;
  }

  // Compact view (for headers/small spaces)
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {status.isActive && !status.isExpiringSoon && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Active Member
          </span>
        )}
        
        {status.isExpiringSoon && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Expires in {status.daysRemaining} {status.daysRemaining === 1 ? 'day' : 'days'}
          </span>
        )}
        
        {status.isExpired && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Expired
          </span>
        )}
      </div>
    );
  }

  // Full view (for dedicated pages)
  return (
    <div className={`rounded-lg shadow-lg p-6 ${
      status.isExpired ? 'bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300' :
      status.isExpiringSoon ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 animate-pulse' :
      'bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            status.isExpired ? 'bg-red-200' :
            status.isExpiringSoon ? 'bg-yellow-200' :
            'bg-green-200'
          }`}>
            {status.isExpired ? (
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {status.planName}
            </h3>
            <p className={`text-sm font-semibold ${
              status.isExpired ? 'text-red-600' :
              status.isExpiringSoon ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {status.isExpired ? '❌ Expired' :
               status.isExpiringSoon ? '⚠️ Expiring Soon' :
               '✅ Active'}
            </p>
          </div>
        </div>
        
        {/* Badge */}
        <div className={`px-4 py-2 rounded-full text-sm font-bold ${
          status.isExpired ? 'bg-red-500 text-white' :
          status.isExpiringSoon ? 'bg-yellow-500 text-white' :
          'bg-green-500 text-white'
        }`}>
          {subscription.plan_id?.name || 'MEMBER'}
        </div>
      </div>

      {/* Status Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Expiry Date */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {status.isExpired ? 'Expired On' : 'Expires On'}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {status.expiresAt.toLocaleDateString()}
              </p>
              {!status.isExpired && (
                <p className={`text-sm mt-1 font-semibold ${
                  status.isExpiringSoon ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {status.daysRemaining} {status.daysRemaining === 1 ? 'day' : 'days'} left
                </p>
              )}
            </div>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Purchases Left */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Purchases Left</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {status.purchasesLeft}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {status.purchasesLeft === 0 ? 'No purchases remaining' : 'More orders available'}
              </p>
            </div>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <p className={`text-lg font-bold mt-1 ${
                status.isExpired ? 'text-red-600' :
                status.isExpiringSoon ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {subscription.status.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {status.isExpired ? 'Renew to continue' :
                 status.isExpiringSoon ? 'Renew soon' :
                 'All benefits active'}
              </p>
            </div>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expiry Warning */}
      {status.isExpiringSoon && !status.isExpired && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Your membership is expiring soon!
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your membership will expire in <strong>{status.daysRemaining} {status.daysRemaining === 1 ? 'day' : 'days'}</strong>. 
                  Renew now to continue enjoying exclusive benefits and discounts!
                </p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => window.location.href = '/membership'}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Renew Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expired Message */}
      {status.isExpired && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Your membership has expired
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Your membership expired on <strong>{status.expiresAt.toLocaleDateString()}</strong>. 
                  Subscribe again to enjoy exclusive benefits!
                </p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => window.location.href = '/membership'}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Details */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Subscribed on:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {new Date(subscription.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Subscription ID:</span>
            <span className="ml-2 font-mono text-xs text-gray-700">
              {subscription._id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipStatus;
