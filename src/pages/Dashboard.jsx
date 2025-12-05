import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t, isRTL, localizedHref } = useLanguage()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setChildren(data || [])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate(localizedHref('/login'))
  }

  const handleSelectChild = (childId) => {
    navigate(localizedHref(`/fusion-lab/${childId}`))
  }

  return (
    <div className="min-h-screen bg-[#0B0A16] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.02]">
        <div className={`max-w-6xl mx-auto px-6 py-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Babu Media</span>
          </div>

          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {t('common.navigation.signOut')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className={`mb-10 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-4xl font-bold mb-2">{t('dashboard.welcome')}</h1>
          <p className="text-gray-400">{t('dashboard.selectChild')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add Child Card */}
            <button
              onClick={() => navigate(localizedHref('/add-child'))}
              className="group bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium transition-colors">
                {t('dashboard.addChildPage.title')}
              </span>
            </button>

            {/* Child Cards */}
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => handleSelectChild(child.id)}
                className={`group bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className="text-5xl mb-4">{child.avatar_emoji || '🧒'}</div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-purple-300 transition-colors">
                  {child.name}
                </h3>
                <p className="text-gray-400">{child.age} {t('dashboard.childCard.yearsOld')}</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
