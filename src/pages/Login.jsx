import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { t, isRTL, localizedHref } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate(localizedHref('/dashboard'))
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={localizedHref('/')} className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all cursor-pointer">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.login.heading')}</h1>
          <p className="text-gray-400">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && (
            <div className={`bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 ${isRTL ? 'text-right' : ''}`}>
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('auth.login.emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors ${isRTL ? 'text-right' : ''}`}
              placeholder={t('auth.login.emailPlaceholder')}
              dir="ltr"
              required
            />
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('auth.login.passwordLabel')}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.login.submitting') : t('auth.login.submitButton')}
          </button>

          <p className="text-center text-gray-400 mt-6">
            {t('auth.login.noAccount')}{' '}
            <Link to={localizedHref('/signup')} className="text-purple-400 hover:text-purple-300 font-medium">
              {t('auth.login.signUpLink')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
