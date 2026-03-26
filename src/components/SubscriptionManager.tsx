'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Crown, Check, X } from 'lucide-react'

interface SubscriptionManagerProps {
  user: any
}

interface Subscription {
  id: string
  tier: 'free' | 'pro'
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: [
      '5 AI generations per day',
      'Basic SwiftUI templates',
      'Community support',
      '1 active project'
    ],
    limitations: [
      'No Live Activities',
      'No Dynamic Island support',
      'No export to Xcode'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19/month',
    features: [
      'Unlimited AI generations',
      'Advanced SwiftUI templates',
      'Priority support',
      'Unlimited projects',
      'Live Activities support',
      'Dynamic Island templates',
      'Xcode project export',
      'App Store Connect integration'
    ],
    limitations: []
  }
]

export default function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSubscription = async (tier: 'free' | 'pro') => {
    if (tier === 'free') {
      // Downgrade to free
      try {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            tier: 'free',
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('user_id', user.id)

        if (error) throw error

        await fetchSubscription()
      } catch (error) {
        console.error('Error updating subscription:', error)
        alert('Failed to update subscription')
      }
    } else {
      // Upgrade to pro - integrate with RevenueCat
      setProcessing(true)
      try {
        // In a real implementation, this would integrate with RevenueCat
        // For now, we'll simulate the upgrade
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            tier: 'pro',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })

        if (error) throw error

        await fetchSubscription()
        alert('Successfully upgraded to Pro!')
      } catch (error) {
        console.error('Error creating subscription:', error)
        alert('Failed to create subscription')
      } finally {
        setProcessing(false)
      }
    }
  }

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)

      if (error) throw error

      await fetchSubscription()
      alert('Subscription cancelled. You will keep Pro features until the end of your billing period.')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const currentTier = subscription?.tier || 'free'
  const isActive = subscription?.status === 'active'

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Subscription</h3>
        {subscription && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${currentTier === 'pro' ? 'text-yellow-400' : 'text-gray-400'}`} />
                <span className="font-medium capitalize">{currentTier} Plan</span>
                {isActive && (
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Active</span>
                )}
              </div>
              {currentTier === 'pro' && isActive && (
                <button
                  onClick={cancelSubscription}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Cancel
                </button>
              )}
            </div>
            {subscription && (
              <p className="text-sm text-gray-400">
                Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrentPlan = plan.id === currentTier
          const isUpgrade = plan.id === 'pro' && currentTier === 'free'
          
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-lg border-2 transition-all ${
                isCurrentPlan
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800'
              }`}
            >
              <div className="mb-4">
                <h4 className="text-xl font-bold mb-1">{plan.name}</h4>
                <p className="text-2xl font-bold">{plan.price}</p>
              </div>

              <div className="mb-6 space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <X className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => createSubscription(plan.id as 'free' | 'pro')}
                disabled={isCurrentPlan || processing}
                className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
                  isCurrentPlan
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : isUpgrade
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing
                  ? 'Processing...'
                  : isCurrentPlan
                  ? 'Current Plan'
                  : isUpgrade
                  ? 'Upgrade to Pro'
                  : 'Downgrade to Free'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-2">Need help?</h4>
        <p className="text-sm text-gray-400 mb-3">
          Contact our support team for assistance with your subscription.
        </p>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  )
}
