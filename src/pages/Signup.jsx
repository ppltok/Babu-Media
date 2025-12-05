import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const { t, isRTL, localizedHref } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.signup.errors.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.signup.errors.passwordTooShort'))
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, fullName)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{t('auth.signup.checkEmail.title')}</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            {t('auth.signup.checkEmail.message')} <span className="text-purple-400 font-medium" dir="ltr">{email}</span>
          </p>
          <Link
            to={localizedHref('/login')}
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            {t('auth.signup.checkEmail.goToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={localizedHref('/')} className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all cursor-pointer">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.signup.heading')}</h1>
          <p className="text-gray-400">{t('auth.signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className={`bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 ${isRTL ? 'text-right' : ''}`}>
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('auth.signup.nameLabel')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${isRTL ? 'text-right' : ''}`}
              placeholder={t('auth.signup.namePlaceholder')}
              required
            />
          </div>

          <div className="mb-5">
            <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('auth.signup.emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${isRTL ? 'text-right' : ''}`}
              placeholder={t('auth.signup.emailPlaceholder')}
              dir="ltr"
              required
            />
          </div>

          <div className="mb-5">
            <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('auth.signup.passwordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${isRTL ? 'text-right' : ''}`}
              placeholder="••••••••"
              dir="ltr"
              required
            />
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('auth.signup.confirmPasswordLabel')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${isRTL ? 'text-right' : ''}`}
              placeholder="••••••••"
              dir="ltr"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.signup.submitting') : t('auth.signup.submitButton')}
          </button>

          <p className="text-center text-gray-400 mt-6">
            {t('auth.signup.hasAccount')}{' '}
            <Link to={localizedHref('/login')} className="text-purple-400 hover:text-purple-300 font-medium">
              {t('auth.signup.signInLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
