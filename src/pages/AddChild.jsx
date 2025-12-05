import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { canCreate, getUsageSummary } from '../lib/usageTracking'
import { checkDevBypass } from '../lib/devBypass'
import PaymentWall from '../components/PaymentWall'

const EMOJI_OPTIONS = ['🧒', '👦', '👧', '🧒🏻', '👦🏻', '👧🏻', '🧒🏽', '👦🏽', '👧🏽', '🧒🏿', '👦🏿', '👧🏿']

export default function AddChild() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t, isRTL, localizedHref } = useLanguage()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [emoji, setEmoji] = useState('🧒')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPaymentWall, setShowPaymentWall] = useState(false)
  const [usageSummary, setUsageSummary] = useState(null)
  const [checkingLimit, setCheckingLimit] = useState(true)

  // Check if user can add another child on page load
  useEffect(() => {
    const checkChildLimit = async () => {
      if (!user) return

      // Check for dev bypass
      await checkDevBypass(user.id, user.email)

      // Check if can create child
      const result = await canCreate(user.id, 'child')

      if (!result.allowed) {
        // Get usage summary for payment wall
        const summary = await getUsageSummary(user.id)
        setUsageSummary(summary)
        setShowPaymentWall(true)
      }

      setCheckingLimit(false)
    }

    checkChildLimit()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Double-check limit before creating
    const canCreateChild = await canCreate(user.id, 'child')
    if (!canCreateChild.allowed) {
      const summary = await getUsageSummary(user.id)
      setUsageSummary(summary)
      setShowPaymentWall(true)
      return
    }

    if (!name.trim()) {
      setError(t('dashboard.addChildPage.errors.nameRequired'))
      return
    }

    const ageNum = parseInt(age)
    if (!age || ageNum < 1 || ageNum > 18) {
      setError(t('dashboard.addChildPage.errors.invalidAge'))
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('children')
      .insert({
        parent_id: user.id,
        name: name.trim(),
        age: ageNum,
        avatar_emoji: emoji
      })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate(localizedHref('/dashboard'))
    }
  }

  // Show loading while checking limits
  if (checkingLimit) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <PaymentWall
        isOpen={showPaymentWall}
        onClose={() => {
          setShowPaymentWall(false)
          navigate(localizedHref('/dashboard'))
        }}
        title={t('dashboard.paymentWall.childLimitTitle')}
        reason={t('dashboard.paymentWall.childLimitReason')}
        usage={usageSummary}
        userEmail={user?.email}
      />

      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate(localizedHref('/dashboard'))}
            className={`flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('dashboard.addChildPage.backToDashboard')}
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{emoji}</div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.addChildPage.title')}</h1>
            <p className="text-gray-400">{t('dashboard.addChildPage.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8">
            {error && (
              <div className={`bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 ${isRTL ? 'text-right' : ''}`}>
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('dashboard.addChildPage.nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${isRTL ? 'text-right' : ''}`}
                placeholder={t('dashboard.addChildPage.namePlaceholder')}
                required
              />
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {t('dashboard.addChildPage.ageLabel')}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="18"
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${isRTL ? 'text-right' : ''}`}
                placeholder={t('dashboard.addChildPage.agePlaceholder')}
                dir="ltr"
                required
              />
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium text-gray-300 mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('dashboard.addChildPage.chooseAvatar')}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`text-3xl p-2 rounded-xl transition-all ${
                      emoji === e
                        ? 'bg-purple-500/30 border-2 border-purple-500'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('dashboard.addChildPage.creating') : t('dashboard.addChildPage.createButton')}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
