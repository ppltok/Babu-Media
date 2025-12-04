import { useState } from 'react'

const LEMON_SQUEEZY_CREATOR_URL = 'https://babumedia.lemonsqueezy.com/buy/870ca6c4-80e6-440f-8bb4-a795be72ce39'
const LEMON_SQUEEZY_PRO_URL = 'https://babumedia.lemonsqueezy.com/buy/a1a0c205-5ab5-49d4-b628-c2f3d43101b3'

export default function PaymentWall({
  isOpen,
  onClose,
  title = "Upgrade Your Plan",
  reason = "You've reached your free tier limit.",
  usage = null,
  userEmail = ''
}) {
  const [isLoading, setIsLoading] = useState(null)
  const [selectedTier, setSelectedTier] = useState('creator')

  if (!isOpen) return null

  const handleUpgrade = (tier) => {
    setIsLoading(tier)
    const baseUrl = tier === 'pro' ? LEMON_SQUEEZY_PRO_URL : LEMON_SQUEEZY_CREATOR_URL
    const checkoutUrl = userEmail
      ? `${baseUrl}?checkout[email]=${encodeURIComponent(userEmail)}`
      : baseUrl
    window.open(checkoutUrl, '_blank')
    setIsLoading(null)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400">{reason}</p>
        </div>

        {/* Current Usage Display */}
        {usage && (
          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Your Current Usage</h3>
            <div className="space-y-2">
              {usage.children && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Children Profiles</span>
                  <span className={`font-semibold ${usage.children.current >= usage.children.limit ? 'text-red-400' : 'text-green-400'}`}>
                    {usage.children.current}/{usage.children.limit === Infinity ? '∞' : usage.children.limit}
                  </span>
                </div>
              )}
              {usage.characters && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Characters {usage.characters.period !== 'lifetime' ? `(this ${usage.characters.period === 'monthly' ? 'month' : 'week'})` : ''}</span>
                  <span className={`font-semibold ${usage.characters.current >= usage.characters.limit ? 'text-red-400' : 'text-green-400'}`}>
                    {usage.characters.current}/{usage.characters.limit}
                  </span>
                </div>
              )}
              {usage.stories && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Stories {usage.stories.period !== 'lifetime' ? `(this ${usage.stories.period === 'weekly' ? 'week' : 'month'})` : ''}</span>
                  <span className={`font-semibold ${usage.stories.current >= usage.stories.limit ? 'text-red-400' : 'text-green-400'}`}>
                    {usage.stories.current}/{usage.stories.limit}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tier Selection */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Creator Tier */}
          <button
            onClick={() => setSelectedTier('creator')}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selectedTier === 'creator'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/10 hover:border-white/30 bg-white/5'
            }`}
          >
            {selectedTier === 'creator' && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="text-purple-400 font-bold text-lg mb-1">Creator</div>
            <ul className="space-y-1 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited children
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                5 characters/month
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                10 stories/week
              </li>
            </ul>
          </button>

          {/* Pro Tier */}
          <button
            onClick={() => setSelectedTier('pro')}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selectedTier === 'pro'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-white/10 hover:border-white/30 bg-white/5'
            }`}
          >
            {selectedTier === 'pro' && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-400 font-bold text-lg">Pro</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">BEST VALUE</span>
            </div>
            <ul className="space-y-1 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited Characters
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited Stories
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited Storage
              </li>
            </ul>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleUpgrade(selectedTier)}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              selectedTier === 'pro'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/30'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Upgrade to {selectedTier === 'pro' ? 'Pro' : 'Creator'}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-white/20 rounded-xl font-semibold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            Maybe Later
          </button>
        </div>

        {/* Secure Payment Note */}
        <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure payment powered by Lemon Squeezy
        </p>
      </div>
    </div>
  )
}
