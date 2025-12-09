import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { getUsageSummary, TIER_LIMITS } from '../lib/usageTracking'

const LEMON_SQUEEZY_CREATOR_URL = 'https://babumedia.lemonsqueezy.com/buy/4640a90d-a41b-4db3-9782-50d3e6949536'
const LEMON_SQUEEZY_PRO_URL = 'https://babumedia.lemonsqueezy.com/buy/1be0d26c-370b-4b2f-94db-8922a798c9f1'
// Lemon Squeezy customer portal for managing subscriptions
const LEMON_SQUEEZY_BILLING_URL = 'https://babumedia.lemonsqueezy.com/billing'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t, language, setLanguage, isRTL, localizedHref } = useLanguage()
  const { theme, toggleTheme, isDark } = useTheme()

  const [loading, setLoading] = useState(true)
  const [usageSummary, setUsageSummary] = useState(null)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        // Get usage summary which includes subscription info
        const summary = await getUsageSummary(user.id)
        setUsageSummary(summary)
        setSubscription(summary.subscription)
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleManageSubscription = () => {
    // Open Lemon Squeezy customer portal
    // The customer portal URL with email prefilled
    const portalUrl = user?.email
      ? `${LEMON_SQUEEZY_BILLING_URL}?email=${encodeURIComponent(user.email)}`
      : LEMON_SQUEEZY_BILLING_URL
    window.open(portalUrl, '_blank')
  }

  const handleUpgrade = (tier) => {
    const url = tier === 'pro' ? LEMON_SQUEEZY_PRO_URL : LEMON_SQUEEZY_CREATOR_URL
    const checkoutUrl = user?.email
      ? `${url}?checkout[email]=${encodeURIComponent(user.email)}`
      : url
    window.open(checkoutUrl, '_blank')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate(localizedHref('/'))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tierName = usageSummary?.tier || 'free'
  const tierDisplay = tierName.charAt(0).toUpperCase() + tierName.slice(1)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0B0A16] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b px-6 py-4 ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(localizedHref('/dashboard'))}
            className={`flex items-center gap-2 transition-colors ${isRTL ? 'flex-row-reverse' : ''} ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('settings.backToDashboard')}
          </button>
          <h1 className="text-xl font-bold">{t('settings.pageTitle')}</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Account Section */}
        <section className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'} border rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? '' : 'text-gray-900'}`}>{t('settings.account.title')}</h2>
          <div className="space-y-4">
            <div className={`flex justify-between items-center py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('settings.account.email')}</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('settings.account.memberSince')}</span>
              <span>{new Date(user?.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</span>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-300'} border rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? '' : 'text-gray-900'}`}>{t('settings.language.title')}</h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('settings.language.description')}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : isDark
                    ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    : 'bg-white border border-gray-400 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('settings.language.english')}
            </button>
            <button
              onClick={() => setLanguage('he')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                language === 'he'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : isDark
                    ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    : 'bg-white border border-gray-400 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t('settings.language.hebrew')}
            </button>
          </div>
        </section>

        {/* Display Settings Section */}
        <section className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-300'} border rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDark ? '' : 'text-gray-900'}`}>{isRTL ? 'הגדרות תצוגה' : 'Display Settings'}</h2>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{isRTL ? 'התאם את המראה של האפליקציה' : 'Customize the appearance of the app'}</p>
          <div className="flex gap-3">
            <button
              onClick={() => !isDark && toggleTheme()}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white border border-gray-400 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {isRTL ? 'מצב כהה' : 'Dark Mode'}
            </button>
            <button
              onClick={() => isDark && toggleTheme()}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                !isDark
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {isRTL ? 'מצב בהיר' : 'Light Mode'}
            </button>
          </div>
        </section>

        {/* Subscription Section */}
        <section className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'} border rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? '' : 'text-gray-900'}`}>{t('settings.subscription.title')}</h2>

          {/* Current Plan */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400 mb-1">{t('settings.subscription.currentPlan')}</div>
                <div className="text-2xl font-bold">
                  {tierDisplay}
                  {tierName === 'free' && <span className={`text-sm font-normal text-gray-400 ${isRTL ? 'mr-2' : 'ml-2'}`}>({t('settings.subscription.free')})</span>}
                  {tierName === 'creator' && <span className={`text-sm font-normal text-purple-300 ${isRTL ? 'mr-2' : 'ml-2'}`}>$9.99/mo</span>}
                  {tierName === 'pro' && <span className={`text-sm font-normal text-amber-300 ${isRTL ? 'mr-2' : 'ml-2'}`}>$19.99/mo</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {subscription?.is_test && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-semibold rounded-full">
                    TEST MODE
                  </span>
                )}
                {tierName !== 'free' && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-full">
                    {t('settings.subscription.active')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          {usageSummary && (
            <div className="mb-6 space-y-3">
              <h3 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('settings.subscription.yourUsage')}</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
                  <div className="text-2xl font-bold">
                    {usageSummary.children.current}
                    <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{usageSummary.children.limit === Infinity ? '∞' : usageSummary.children.limit}
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('settings.subscription.children')}</div>
                </div>

                <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
                  <div className="text-2xl font-bold">
                    {usageSummary.characters.current}
                    <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{usageSummary.characters.limit === Infinity ? '∞' : usageSummary.characters.limit}
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('settings.subscription.characters')}
                    {usageSummary.characters.period !== 'lifetime' && (
                      <span className="text-xs"> ({usageSummary.characters.period === 'monthly' ? t('settings.subscription.monthly') : t('settings.subscription.weekly')})</span>
                    )}
                  </div>
                </div>

                <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl p-4`}>
                  <div className="text-2xl font-bold">
                    {usageSummary.stories.current}
                    <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{usageSummary.stories.limit === Infinity ? '∞' : usageSummary.stories.limit}
                    </span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('settings.subscription.stories')}
                    {usageSummary.stories.period !== 'lifetime' && (
                      <span className="text-xs"> ({usageSummary.stories.period === 'weekly' ? t('settings.subscription.weekly') : t('settings.subscription.monthly')})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Actions */}
          <div className="space-y-3">
            {tierName === 'free' ? (
              <>
                <button
                  onClick={() => handleUpgrade('creator')}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  {t('settings.subscription.upgradeToCreator')}
                </button>
                <button
                  onClick={() => handleUpgrade('pro')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                  {t('settings.subscription.upgradeToPro')}
                </button>
              </>
            ) : tierName === 'creator' ? (
              <>
                <button
                  onClick={() => handleUpgrade('pro')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                >
                  {t('settings.subscription.upgradeToPro')}
                </button>
                <button
                  onClick={handleManageSubscription}
                  className={`w-full py-3 border rounded-xl font-semibold transition-all ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-gray-400 hover:bg-gray-50'}`}
                >
                  {t('settings.subscription.manageSubscription')}
                </button>
              </>
            ) : (
              <button
                onClick={handleManageSubscription}
                className={`w-full py-3 border rounded-xl font-semibold transition-all ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-gray-400 hover:bg-gray-50'}`}
              >
                {t('settings.subscription.manageSubscription')}
              </button>
            )}
          </div>

          {/* Subscription Info */}
          {tierName !== 'free' && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              {t('settings.subscription.manageNote')}
            </p>
          )}
        </section>

        {/* Plan Comparison */}
        <section className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-300'} border rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? '' : 'text-gray-900'}`}>{t('settings.planComparison.title')}</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
                  <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('settings.planComparison.feature')}</th>
                  <th className={`text-center py-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('settings.planComparison.explorer')}</th>
                  <th className="text-center py-3 text-purple-400 font-medium">{t('settings.planComparison.creator')}</th>
                  <th className="text-center py-3 text-amber-400 font-medium">{t('settings.planComparison.pro')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-200'}`}>
                <tr>
                  <td className="py-3">{t('settings.planComparison.childProfiles')}</td>
                  <td className="text-center py-3">1</td>
                  <td className="text-center py-3"><span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md font-medium">{t('settings.planComparison.unlimited')}</span></td>
                  <td className="text-center py-3"><span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-medium">{t('settings.planComparison.unlimited')}</span></td>
                </tr>
                <tr>
                  <td className="py-3">{t('settings.planComparison.characters')}</td>
                  <td className="text-center py-3">2 {t('settings.planComparison.total')}</td>
                  <td className="text-center py-3">5{t('settings.planComparison.perMonth')}</td>
                  <td className="text-center py-3"><span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-medium">{t('settings.planComparison.unlimited')}</span></td>
                </tr>
                <tr>
                  <td className="py-3">{t('settings.planComparison.stories')}</td>
                  <td className="text-center py-3">1 {t('settings.planComparison.total')}</td>
                  <td className="text-center py-3">10{t('settings.planComparison.perWeek')}</td>
                  <td className="text-center py-3"><span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-medium">{t('settings.planComparison.unlimited')}</span></td>
                </tr>
                <tr>
                  <td className="py-3">{t('settings.planComparison.storage')}</td>
                  <td className="text-center py-3">{t('settings.planComparison.basic')}</td>
                  <td className="text-center py-3">{t('settings.planComparison.extended')}</td>
                  <td className="text-center py-3"><span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-medium">{t('settings.planComparison.unlimited')}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-400">{t('settings.accountActions.title')}</h2>
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full py-3 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/10 transition-all"
            >
              {t('settings.accountActions.signOut')}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
