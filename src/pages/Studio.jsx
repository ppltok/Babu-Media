import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { supabase } from '../lib/supabase'
import { canCreate, trackCreation, getUsageSummary } from '../lib/usageTracking'
import { checkDevBypass } from '../lib/devBypass'
import PaymentWall from '../components/PaymentWall'
import Confetti from '../components/Confetti'
import FunFacts from '../components/FunFacts'
import RunnerGame from '../components/RunnerGame'

// Optimized Image Component with loading state and eager loading for story images
const OptimizedImage = ({ src, alt, className, fallback, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false)
    setHasError(false)

    // For priority images, preload immediately
    if (src && priority) {
      const img = new Image()
      img.src = src
      img.onload = () => setIsLoaded(true)
      img.onerror = () => setHasError(true)
    }
  }, [src, priority])

  // Check if image is already cached
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight > 0) {
      setIsLoaded(true)
    }
  }, [src])

  if (!src || hasError) {
    return fallback || null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/30 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  )
}

// Icons
const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const PaletteIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
)

const BookIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const HomeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)

const CollapseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
)

const ExpandIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
)

const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function Studio() {
  const { user, signOut } = useAuth()
  const { isRTL, t, language, localizedHref } = useLanguage()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [activeSection, setActiveSection] = useState('fusion-lab') // 'fusion-lab' | 'plot-world'
  const [loading, setLoading] = useState(true)
  const [childMenuOpen, setChildMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [deleteChildConfirm, setDeleteChildConfirm] = useState(null)
  const [isDeletingChild, setIsDeletingChild] = useState(false)
  const [initialCharacterForStory, setInitialCharacterForStory] = useState(null)

  // Navigate to Plot World with a pre-selected character
  const goToPlotWorldWithCharacter = (character) => {
    setInitialCharacterForStory(character)
    setActiveSection('plot-world')
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  // Check dev bypass on mount
  useEffect(() => {
    if (user?.id && user?.email) {
      checkDevBypass(user.id, user.email)
    }
  }, [user?.id, user?.email])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setChildren(data)
      if (data.length > 0) {
        setSelectedChild(data[0])
      }
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleAddChild = () => {
    navigate('/add-child')
  }

  const handleDeleteChild = async (childId) => {
    setIsDeletingChild(true)

    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId)

    if (!error) {
      const updatedChildren = children.filter(c => c.id !== childId)
      setChildren(updatedChildren)

      // If we deleted the selected child, select another one
      if (selectedChild?.id === childId) {
        setSelectedChild(updatedChildren.length > 0 ? updatedChildren[0] : null)
      }
    }

    setDeleteChildConfirm(null)
    setIsDeletingChild(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If no children, redirect to add child
  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">👶</div>
          <h1 className="text-3xl font-bold text-white mb-4">{t('studio.welcome.title')}</h1>
          <p className="text-gray-400 mb-8">
            {t('studio.welcome.description')}
          </p>
          <button
            onClick={handleAddChild}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            {t('studio.welcome.addChildButton')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0B0A16] text-white flex flex-col lg:flex-row overflow-hidden">
      {/* Delete Child Confirmation Modal */}
      {deleteChildConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">{t('studio.deleteChild.title')}</h3>
            <p className="text-gray-400 mb-4">
              {t('studio.deleteChild.confirmText')} <span className="text-white font-medium">{deleteChildConfirm.name}</span>?
            </p>
            <p className="text-red-400 text-sm mb-6">
              {t('studio.deleteChild.warning')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteChildConfirm(null)}
                disabled={isDeletingChild}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                {t('studio.deleteChild.cancel')}
              </button>
              <button
                onClick={() => handleDeleteChild(deleteChildConfirm.id)}
                disabled={isDeletingChild}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isDeletingChild ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t('studio.deleteChild.remove')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#0d0c18] border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold">Babu Media</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setChildMenuOpen(!childMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl"
          >
            <span className="text-xl">{selectedChild?.avatar_emoji || '🧒'}</span>
            <span className="text-sm font-medium max-w-[80px] truncate">{selectedChild?.name}</span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${childMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Child Dropdown */}
      {childMenuOpen && (
        <div className="lg:hidden absolute top-16 right-4 left-4 sm:left-auto sm:w-72 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
          {children.map((child) => (
            <div
              key={child.id}
              className={`flex items-center gap-3 p-3 hover:bg-white/10 transition-colors ${
                selectedChild?.id === child.id ? 'bg-purple-500/20' : ''
              }`}
            >
              <button
                onClick={() => {
                  setSelectedChild(child)
                  setChildMenuOpen(false)
                }}
                className="flex items-center gap-3 flex-1"
              >
                <span className="text-xl">{child.avatar_emoji || '🧒'}</span>
                <div className="text-left">
                  <div className="font-medium">{child.name}</div>
                  <div className="text-xs text-gray-400">{child.age} {t('studio.sidebar.yearsOld')}</div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setChildMenuOpen(false)
                  setDeleteChildConfirm(child)
                }}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              setChildMenuOpen(false)
              handleAddChild()
            }}
            className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-t border-white/10 text-purple-400"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{t('studio.sidebar.addChild')}</span>
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#0d0c18] z-40 flex flex-col">
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setActiveSection('fusion-lab')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                activeSection === 'fusion-lab'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <PaletteIcon className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium text-lg">{t('studio.sidebar.fusionLab')}</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('plot-world')
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                activeSection === 'plot-world'
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <BookIcon className="w-6 h-6 flex-shrink-0" />
              <span className="font-medium text-lg">{t('studio.sidebar.plotWorld')}</span>
            </button>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.email}</div>
                <div className="text-xs text-gray-500">{t('studio.sidebar.parentAccount')}</div>
              </div>
            </div>
            <button
              onClick={() => {
                navigate('/settings')
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
              <span>{t('studio.sidebar.settingsAndSubscription')}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>{t('studio.sidebar.signOut')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Fixed height, doesn't scroll with content */}
      <aside className={`hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-72'} bg-[#0d0c18] border-r border-white/10 flex-col transition-all duration-300 relative h-full flex-shrink-0`}>
        {/* Collapse Button - positioned on outer edge (right in LTR, left in RTL) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`absolute ${isRTL ? '-left-3' : '-right-3'} top-20 w-6 h-6 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg z-10 transition-colors`}
          title={sidebarCollapsed ? t('studio.sidebar.expandSidebar') : t('studio.sidebar.collapseSidebar')}
        >
          {sidebarCollapsed ? (
            <ExpandIcon className={`w-3 h-3 text-white ${isRTL ? 'rotate-180' : ''}`} />
          ) : (
            <CollapseIcon className={`w-3 h-3 text-white ${isRTL ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold">Babu Media</span>
            )}
          </div>
        </div>

        {/* Child Selector */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <button
              onClick={() => setChildMenuOpen(!childMenuOpen)}
              className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <span className="text-2xl flex-shrink-0">{selectedChild?.avatar_emoji || '🧒'}</span>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{selectedChild?.name}</div>
                    <div className="text-xs text-gray-400">{selectedChild?.age} {t('studio.sidebar.yearsOld')}</div>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${childMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Dropdown */}
            {childMenuOpen && !sidebarCollapsed && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className={`flex items-center gap-3 p-3 hover:bg-white/10 transition-colors group ${
                      selectedChild?.id === child.id ? 'bg-purple-500/20' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedChild(child)
                        setChildMenuOpen(false)
                      }}
                      className="flex items-center gap-3 flex-1"
                    >
                      <span className="text-xl">{child.avatar_emoji || '🧒'}</span>
                      <div className="text-left">
                        <div className="font-medium">{child.name}</div>
                        <div className="text-xs text-gray-400">{child.age} {t('studio.sidebar.yearsOld')}</div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setChildMenuOpen(false)
                        setDeleteChildConfirm(child)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 transition-all"
                      title={t('studio.deleteChild.remove')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setChildMenuOpen(false)
                    handleAddChild()
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-t border-white/10 text-purple-400"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>{t('studio.sidebar.addChild')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveSection('fusion-lab')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeSection === 'fusion-lab'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <PaletteIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">{t('studio.sidebar.fusionLab')}</span>}
          </button>

          <button
            onClick={() => setActiveSection('plot-world')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeSection === 'plot-world'
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300'
                : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <BookIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">{t('studio.sidebar.plotWorld')}</span>}
          </button>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium truncate">{user?.email}</div>
                  <div className="text-xs text-gray-500">{t('studio.sidebar.parentAccount')}</div>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {showUserMenu && (
            <div className={`absolute bottom-full mb-2 left-4 ${sidebarCollapsed ? 'left-14' : 'right-4'} w-64 bg-[#1a1825] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50`}>
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm text-gray-400 truncate">{user?.email}</p>
              </div>

              {/* Settings */}
              <button
                onClick={() => navigate(localizedHref('/settings'))}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <SettingsIcon className="w-4 h-4" />
                {t('studio.sidebar.settingsAndSubscription')}
              </button>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/10"
              >
                <LogoutIcon className="w-4 h-4" />
                {t('studio.sidebar.signOut')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Scrollable area */}
      <main className="flex-1 overflow-y-auto h-full">
        {activeSection === 'fusion-lab' && selectedChild && (
          <FusionLabContent childId={selectedChild.id} child={selectedChild} onGoToStory={goToPlotWorldWithCharacter} user={user} />
        )}
        {activeSection === 'plot-world' && selectedChild && (
          <PlotWorldContent
            childId={selectedChild.id}
            child={selectedChild}
            initialCharacter={initialCharacterForStory}
            onCharacterUsed={() => setInitialCharacterForStory(null)}
            user={user}
          />
        )}
      </main>
    </div>
  )
}

// Embedded Fusion Lab Content (without the full page wrapper)
function FusionLabContent({ childId, child, onGoToStory, user }) {
  const { t, language, isRTL } = useLanguage()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)

  // Character creation state
  const [step, setStep] = useState(1)
  const [characterName, setCharacterName] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [customAnimalName, setCustomAnimalName] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedTraits, setSelectedTraits] = useState([])
  const [selectedOutfit, setSelectedOutfit] = useState(null)
  const [customOutfit, setCustomOutfit] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCharacter, setGeneratedCharacter] = useState(null)
  const [generatingMessage, setGeneratingMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  // Payment wall state
  const [showPaymentWall, setShowPaymentWall] = useState(false)
  const [usageSummary, setUsageSummary] = useState(null)
  const [paymentWallReason, setPaymentWallReason] = useState('')

  // Fun loading messages for character creation (translated)
  const CHARACTER_LOADING_MESSAGES = t('studio.fusionLab.loadingMessages')

  // Cycle through fun messages while generating
  useEffect(() => {
    if (!isGenerating) {
      setGeneratingMessage('')
      return
    }

    let messageIndex = 0
    setGeneratingMessage(CHARACTER_LOADING_MESSAGES[0])

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % CHARACTER_LOADING_MESSAGES.length
      setGeneratingMessage(CHARACTER_LOADING_MESSAGES[messageIndex])
    }, 2500)

    return () => clearInterval(interval)
  }, [isGenerating])

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Character detail view
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  // Data constants - using translations
  const ANIMAL_TYPES = [
    { id: 'fox', emoji: '🦊', name: t('studio.fusionLab.animals.fox') },
    { id: 'wolf', emoji: '🐺', name: t('studio.fusionLab.animals.wolf') },
    { id: 'raccoon', emoji: '🦝', name: t('studio.fusionLab.animals.raccoon') },
    { id: 'unicorn', emoji: '🦄', name: t('studio.fusionLab.animals.unicorn') },
    { id: 'lion', emoji: '🦁', name: t('studio.fusionLab.animals.lion') },
    { id: 'owl', emoji: '🦉', name: t('studio.fusionLab.animals.owl') },
    { id: 'dragon', emoji: '🐉', name: t('studio.fusionLab.animals.dragon') },
    { id: 'bunny', emoji: '🐰', name: t('studio.fusionLab.animals.bunny') },
    { id: 'cat', emoji: '🐱', name: t('studio.fusionLab.animals.cat') },
    { id: 'dog', emoji: '🐕', name: t('studio.fusionLab.animals.dog') },
    { id: 'bear', emoji: '🐻', name: t('studio.fusionLab.animals.bear') },
    { id: 'panda', emoji: '🐼', name: t('studio.fusionLab.animals.panda') },
  ]

  // Get the actual animal name (prioritizes custom input if provided)
  const getAnimalName = () => {
    // If user typed a custom animal name, use that
    if (customAnimalName.trim()) {
      return customAnimalName.trim()
    }
    return selectedAnimal?.name || ''
  }

  // Check if animal selection is valid (either selected an animal OR typed a custom one)
  const isAnimalValid = () => {
    // Valid if user typed a custom animal name
    if (customAnimalName.trim().length > 0) return true
    // Or if they selected a predefined animal
    return !!selectedAnimal
  }

  const VISUAL_STYLES = [
    { id: 'pixar', name: t('studio.fusionLab.styles.pixar'), shows: 'Toy Story, Finding Nemo, Coco', color: 'from-blue-500 to-cyan-500' },
    { id: 'dreamworks', name: t('studio.fusionLab.styles.dreamworks'), shows: 'Shrek, Kung Fu Panda, How to Train Your Dragon', color: 'from-green-500 to-emerald-500' },
    { id: 'ghibli', name: t('studio.fusionLab.styles.ghibli'), shows: 'Totoro, Spirited Away, Ponyo', color: 'from-sky-400 to-blue-500' },
    { id: 'cartoon-network', name: t('studio.fusionLab.styles.cartoonNetwork'), shows: 'Adventure Time, Powerpuff Girls, Steven Universe', color: 'from-pink-500 to-rose-500' },
    { id: 'nickelodeon', name: t('studio.fusionLab.styles.nickelodeon'), shows: 'SpongeBob, Paw Patrol, Dora', color: 'from-orange-500 to-amber-500' },
    { id: 'anime', name: t('studio.fusionLab.styles.anime'), shows: 'Pokemon, Naruto, Dragon Ball', color: 'from-purple-500 to-violet-500' },
    { id: 'disney-classic', name: t('studio.fusionLab.styles.disneyClassic'), shows: 'Lion King, Aladdin, Little Mermaid', color: 'from-yellow-500 to-orange-500' },
    { id: 'illumination', name: t('studio.fusionLab.styles.illumination'), shows: 'Minions, Sing, Secret Life of Pets', color: 'from-yellow-400 to-yellow-600' },
  ]

  const PERSONALITY_TRAITS = [
    { id: 'brave', label: t('studio.fusionLab.traits.brave'), emoji: '🦸' },
    { id: 'curious', label: t('studio.fusionLab.traits.curious'), emoji: '🔍' },
    { id: 'kind', label: t('studio.fusionLab.traits.kind'), emoji: '💝' },
    { id: 'clever', label: t('studio.fusionLab.traits.clever'), emoji: '🧠' },
    { id: 'playful', label: t('studio.fusionLab.traits.playful'), emoji: '🎮' },
    { id: 'wise', label: t('studio.fusionLab.traits.wise'), emoji: '🦉' },
    { id: 'gentle', label: t('studio.fusionLab.traits.gentle'), emoji: '🌸' },
    { id: 'bold', label: t('studio.fusionLab.traits.bold'), emoji: '⚡' },
    { id: 'creative', label: t('studio.fusionLab.traits.creative'), emoji: '🎨' },
    { id: 'loyal', label: t('studio.fusionLab.traits.loyal'), emoji: '🤝' },
    { id: 'funny', label: t('studio.fusionLab.traits.funny'), emoji: '😄' },
    { id: 'adventurous', label: t('studio.fusionLab.traits.adventurous'), emoji: '🗺️' },
    { id: 'shy', label: t('studio.fusionLab.traits.shy'), emoji: '🙈' },
    { id: 'confident', label: t('studio.fusionLab.traits.confident'), emoji: '💪' },
    { id: 'caring', label: t('studio.fusionLab.traits.caring'), emoji: '🤗' },
    { id: 'magical', label: t('studio.fusionLab.traits.magical'), emoji: '✨' },
  ]

  const OUTFIT_PRESETS = [
    { id: 'superhero', label: t('studio.fusionLab.outfits.superhero'), emoji: '🦸', desc: 'A flowing superhero cape with a bold emblem' },
    { id: 'detective', label: t('studio.fusionLab.outfits.detective'), emoji: '🔍', desc: 'Trench coat with a magnifying glass' },
    { id: 'princess', label: t('studio.fusionLab.outfits.princess'), emoji: '👑', desc: 'Royal gown or suit with a crown' },
    { id: 'pirate', label: t('studio.fusionLab.outfits.pirate'), emoji: '🏴‍☠️', desc: 'Pirate hat, eye patch, and adventure gear' },
    { id: 'astronaut', label: t('studio.fusionLab.outfits.astronaut'), emoji: '🚀', desc: 'Space suit ready for cosmic adventures' },
    { id: 'wizard', label: t('studio.fusionLab.outfits.wizard'), emoji: '🧙', desc: 'Magical robes with a pointed hat' },
    { id: 'sports', label: t('studio.fusionLab.outfits.sports'), emoji: '⚽', desc: 'Athletic jersey and sneakers' },
    { id: 'artist', label: t('studio.fusionLab.outfits.artist'), emoji: '🎨', desc: 'Colorful smock with a beret' },
    { id: 'scientist', label: t('studio.fusionLab.outfits.scientist'), emoji: '🔬', desc: 'Lab coat with goggles' },
    { id: 'ninja', label: t('studio.fusionLab.outfits.ninja'), emoji: '🥷', desc: 'Stealthy ninja outfit' },
    { id: 'fairy', label: t('studio.fusionLab.outfits.fairy'), emoji: '🧚', desc: 'Sparkly wings and magical outfit' },
    { id: 'casual', label: t('studio.fusionLab.outfits.casual'), emoji: '👕', desc: 'Comfortable everyday clothes' },
  ]

  useEffect(() => {
    fetchCharacters()
  }, [childId])

  const fetchCharacters = async () => {
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (data) {
      setCharacters(data)
    }
    setLoading(false)
  }

  const toggleTrait = (traitId) => {
    setSelectedTraits(prev =>
      prev.includes(traitId)
        ? prev.filter(t => t !== traitId)
        : prev.length < 4 ? [...prev, traitId] : prev
    )
  }

  const getOutfitDescription = () => {
    if (customOutfit.trim()) return customOutfit.trim()
    if (selectedOutfit) {
      const preset = OUTFIT_PRESETS.find(o => o.id === selectedOutfit)
      return preset?.desc || ''
    }
    return ''
  }

  const handleGenerate = async () => {
    if (!characterName || !isAnimalValid() || !selectedStyle || selectedTraits.length === 0) {
      return
    }

    // Check usage limits before generating
    if (user?.id) {
      const canCreateResult = await canCreate(user.id, 'character', childId)
      if (!canCreateResult.allowed) {
        // Show payment wall
        const summary = await getUsageSummary(user.id)
        setUsageSummary(summary)
        setPaymentWallReason(canCreateResult.reason)
        setShowPaymentWall(true)
        return
      }
    }

    setIsGenerating(true)

    const animalName = getAnimalName()
    const traitLabels = selectedTraits.map(t => PERSONALITY_TRAITS.find(p => p.id === t)?.label).join(', ')
    const styleName = VISUAL_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle
    const outfitDesc = getOutfitDescription()

    const prompt = `A ${styleName} style illustration of a cute anthropomorphic ${animalName.toLowerCase()} character named ${characterName}. The character has these personality traits: ${traitLabels}. ${outfitDesc ? `Wearing ${outfitDesc}.` : ''} Child-friendly, colorful, expressive face, full body shot, high quality character design.`

    // Store the animal type - use custom name if provided, otherwise use selected animal ID
    const animalTypeId = customAnimalName.trim() ? `custom:${animalName}` : (selectedAnimal?.id || `custom:${animalName}`)

    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          child_id: childId,
          name: characterName,
          animal_type: animalTypeId,
          personality_trait: traitLabels,
          visual_style: selectedStyle,
          outfit_description: outfitDesc,
          custom_prompt: prompt,
          image_url: null
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving character:', error)
        setIsGenerating(false)
        return
      }

      // Track usage after successful creation
      if (user?.id) {
        await trackCreation(user.id, 'character')
      }

      setGeneratedCharacter(data)
      setCharacters([data, ...characters])

      const response = await supabase.functions.invoke('generate-character', {
        body: {
          characterId: data.id,
          prompt: prompt,
          animalType: animalName,
          styleName: styleName
        }
      })

      if (response.error) {
        console.error('Edge function error:', response.error)
        setStep(5)
        setIsGenerating(false)
        return
      }

      const result = response.data

      if (result.success && result.imageUrl) {
        const updatedCharacter = { ...data, image_url: result.imageUrl }
        setGeneratedCharacter(updatedCharacter)
        setCharacters(prev => prev.map(c => c.id === data.id ? updatedCharacter : c))
        // Trigger confetti celebration!
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }

      setStep(5)
    } catch (err) {
      console.error('Generation error:', err)
    }

    setIsGenerating(false)
  }

  const handleDeleteCharacter = async (characterId) => {
    setIsDeleting(true)

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId)

    if (!error) {
      setCharacters(characters.filter(c => c.id !== characterId))
    }

    setDeleteConfirm(null)
    setIsDeleting(false)
  }

  const resetForm = () => {
    setStep(1)
    setCharacterName('')
    setSelectedAnimal(null)
    setCustomAnimalName('')
    setSelectedStyle(null)
    setSelectedTraits([])
    setSelectedOutfit(null)
    setCustomOutfit('')
    setGeneratedCharacter(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Confetti Effect for Character Creation */}
      <Confetti active={showConfetti} duration={4000} />

      {/* Payment Wall Modal */}
      <PaymentWall
        isOpen={showPaymentWall}
        onClose={() => setShowPaymentWall(false)}
        title={t('studio.fusionLab.upgradeTitle')}
        reason={paymentWallReason}
        usage={usageSummary}
        userEmail={user?.email || ''}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">{t('studio.fusionLab.deleteCharacter.title')}</h3>
            <p className="text-gray-400 mb-6">
              {t('studio.fusionLab.deleteCharacter.confirmText')} <span className="text-white font-medium">{deleteConfirm.name}</span>? {t('studio.fusionLab.deleteCharacter.warning')}
            </p>
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                {t('studio.fusionLab.deleteCharacter.cancel')}
              </button>
              <button
                onClick={() => handleDeleteCharacter(deleteConfirm.id)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t('studio.fusionLab.deleteCharacter.delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCharacter(null)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - Red X on top left */}
            <button
              onClick={() => setSelectedCharacter(null)}
              className="absolute top-4 left-4 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors z-10 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Character Image */}
            <div className="relative">
              {selectedCharacter.image_url ? (
                <img
                  src={selectedCharacter.image_url}
                  alt={selectedCharacter.name}
                  className="w-full aspect-square object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-t-2xl flex items-center justify-center">
                  <span className="text-9xl">
                    {ANIMAL_TYPES.find(a => a.id === selectedCharacter.animal_type)?.emoji || '🎭'}
                  </span>
                </div>
              )}
            </div>

            {/* Character Details */}
            <div className="p-6">
              <div className={`flex items-start justify-between gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-3xl font-bold">{selectedCharacter.name}</h2>
                <button
                  onClick={() => {
                    if (onGoToStory) {
                      onGoToStory(selectedCharacter)
                    }
                    setSelectedCharacter(null)
                  }}
                  className="shrink-0 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  {t('studio.fusionLab.characterDetail.createStory')}
                </button>
              </div>

              <div className="space-y-4">
                {/* Animal Type */}
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">
                    {ANIMAL_TYPES.find(a => a.id === selectedCharacter.animal_type)?.emoji || '🎭'}
                  </span>
                  <div>
                    <div className="text-sm text-gray-400">{t('studio.fusionLab.characterDetail.animalType')}</div>
                    <div className="font-medium">
                      {ANIMAL_TYPES.find(a => a.id === selectedCharacter.animal_type)?.name || selectedCharacter.animal_type}
                    </div>
                  </div>
                </div>

                {/* Visual Style */}
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">🎨</span>
                  <div>
                    <div className="text-sm text-gray-400">{t('studio.fusionLab.characterDetail.visualStyle')}</div>
                    <div className="font-medium">
                      {VISUAL_STYLES.find(s => s.id === selectedCharacter.visual_style)?.name || selectedCharacter.visual_style}
                    </div>
                  </div>
                </div>

                {/* Personality Traits */}
                <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="text-sm text-gray-400">{t('studio.fusionLab.characterDetail.personalityTraits')}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedCharacter.personality_trait?.split(', ').map((trait, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Outfit */}
                {selectedCharacter.outfit_description && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">👕</span>
                    <div>
                      <div className="text-sm text-gray-400">{t('studio.fusionLab.characterDetail.outfit')}</div>
                      <div className="font-medium">{selectedCharacter.outfit_description}</div>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="text-sm text-gray-400">{t('studio.fusionLab.characterDetail.created')}</div>
                    <div className="font-medium">
                      {new Date(selectedCharacter.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <div className="mt-8">
                <button
                  onClick={() => {
                    setDeleteConfirm(selectedCharacter)
                    setSelectedCharacter(null)
                  }}
                  className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl font-semibold transition-all"
                >
                  {t('studio.fusionLab.characterDetail.deleteCharacter')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-3xl sm:text-4xl">🧬</span>
          <span className="truncate">{child?.name}{t('studio.fusionLab.title')}</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">{t('studio.fusionLab.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Character Creator */}
        <div className="lg:col-span-2 order-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">{t('studio.fusionLab.createNewCharacter')}</h2>

            {/* Step Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 sm:h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-purple-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Name & Animal */}
            {step === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('studio.fusionLab.step1.characterName')}</label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                    placeholder={t('studio.fusionLab.step1.characterNamePlaceholder')}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">{t('studio.fusionLab.step1.chooseAnimalType')}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                    {ANIMAL_TYPES.map((animal) => (
                      <button
                        key={animal.id}
                        onClick={() => {
                          setSelectedAnimal(animal)
                          setCustomAnimalName('') // Clear custom input when selecting a predefined animal
                        }}
                        className={`p-2 sm:p-3 rounded-xl text-center transition-all ${
                          selectedAnimal?.id === animal.id && !customAnimalName.trim()
                            ? 'bg-purple-500/30 border-2 border-purple-500'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{animal.emoji}</div>
                        <div className="text-[10px] sm:text-xs font-medium">{animal.name}</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom animal input - always visible */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0B0A16] text-gray-500">{t('studio.fusionLab.step1.orTypeYourOwn')}</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={customAnimalName}
                      onChange={(e) => {
                        setCustomAnimalName(e.target.value)
                        // Clear selected animal when typing custom (visual feedback)
                        if (e.target.value.trim()) {
                          setSelectedAnimal(null)
                        }
                      }}
                      className={`w-full mt-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                      placeholder={t('studio.fusionLab.step1.customAnimalPlaceholder')}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {t('studio.fusionLab.step1.customAnimalHint')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!characterName || !isAnimalValid()}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  {t('studio.fusionLab.step1.nextButton')}
                </button>
              </div>
            )}

            {/* Step 2: Visual Style */}
            {step === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">{t('studio.fusionLab.step2.chooseArtStyle')}</label>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{t('studio.fusionLab.step2.artStyleHint')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {VISUAL_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 sm:p-4 rounded-xl ${isRTL ? 'text-right' : 'text-left'} transition-all ${
                          selectedStyle === style.id
                            ? 'bg-purple-500/30 border-2 border-purple-500'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className={`text-xs sm:text-sm font-bold mb-0.5 sm:mb-1 bg-gradient-to-r ${style.color} bg-clip-text text-transparent`}>
                          {style.name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400 line-clamp-1">{style.shows}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button onClick={() => setStep(1)} className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all">
                    {t('studio.fusionLab.step2.back')}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedStyle}
                    className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    {t('studio.fusionLab.step2.nextButton')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Personality */}
            {step === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('studio.fusionLab.step3.chooseTraits')}</label>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{t('studio.fusionLab.step3.traitsHint')}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2">
                    {PERSONALITY_TRAITS.map((trait) => (
                      <button
                        key={trait.id}
                        onClick={() => toggleTrait(trait.id)}
                        className={`py-2 sm:py-3 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                          selectedTraits.includes(trait.id)
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span>{trait.emoji}</span>
                        <span>{trait.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t('studio.fusionLab.step3.selected')}: {selectedTraits.length}/4</p>
                </div>

                <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button onClick={() => setStep(2)} className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all">
                    {t('studio.fusionLab.step3.back')}
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={selectedTraits.length === 0}
                    className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    {t('studio.fusionLab.step3.nextButton')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Outfit & Generate */}
            {step === 4 && (
              <div className="space-y-4 sm:space-y-6">
                {isGenerating ? (
                  /* Fun Loading State */
                  <div className="py-8 sm:py-12 text-center">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl animate-bounce">
                        {selectedAnimal?.emoji || '✨'}
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {generatingMessage || t('studio.fusionLab.generating.creatingMagic')}
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base mb-2">
                      {characterName} {t('studio.fusionLab.generating.comingToLife')}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">{t('studio.fusionLab.generating.timeEstimate')}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">{t('studio.fusionLab.step4.chooseOutfit')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {OUTFIT_PRESETS.map((outfit) => (
                          <button
                            key={outfit.id}
                            onClick={() => {
                              setSelectedOutfit(outfit.id)
                              setCustomOutfit('')
                            }}
                            className={`p-2 sm:p-3 rounded-xl ${isRTL ? 'text-right' : 'text-left'} transition-all ${
                              selectedOutfit === outfit.id && !customOutfit
                                ? 'bg-purple-500/30 border-2 border-purple-500'
                                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                            }`}
                          >
                            <div className={`flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="text-lg sm:text-xl">{outfit.emoji}</span>
                              <span className="text-xs sm:text-sm font-medium">{outfit.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="relative my-3 sm:my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs sm:text-sm">
                          <span className="px-2 bg-[#0B0A16] text-gray-500">{t('studio.fusionLab.step4.orDescribeOwn')}</span>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={customOutfit}
                        onChange={(e) => {
                          setCustomOutfit(e.target.value)
                          if (e.target.value) setSelectedOutfit(null)
                        }}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}
                        placeholder={t('studio.fusionLab.step4.customOutfitPlaceholder')}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>

                    {/* Preview */}
                    <div className="bg-black/20 rounded-xl p-4 sm:p-6">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-3 sm:mb-4">{t('studio.fusionLab.step4.characterPreview')}</h3>
                      <div className={`flex items-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="text-4xl sm:text-6xl">{selectedAnimal?.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-lg sm:text-xl font-bold truncate">{characterName}</div>
                          <div className="text-gray-400 text-xs sm:text-sm truncate">
                            {selectedTraits.map(traitId => PERSONALITY_TRAITS.find(p => p.id === traitId)?.label).join(', ')}
                          </div>
                          <div className="text-purple-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                            {t('studio.fusionLab.step4.style')}: {VISUAL_STYLES.find(s => s.id === selectedStyle)?.name}
                          </div>
                          {getOutfitDescription() && (
                            <div className="text-emerald-400 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">
                              {t('studio.fusionLab.step4.outfit')}: {getOutfitDescription()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button onClick={() => setStep(3)} className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all">
                        {t('studio.fusionLab.step4.back')}
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <span>✨</span> <span>{t('studio.fusionLab.step4.bringToLife')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && generatedCharacter && (
              <div className="text-center py-4 sm:py-8">
                {generatedCharacter.image_url ? (
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4 sm:mb-6 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/30">
                    <img
                      src={generatedCharacter.image_url}
                      alt={generatedCharacter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">{selectedAnimal?.emoji}</div>
                )}
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{generatedCharacter.name} {t('studio.fusionLab.success.isReady')}</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 px-2">
                  {generatedCharacter.image_url
                    ? t('studio.fusionLab.success.createdWithMagic')
                    : t('studio.fusionLab.success.savedWaiting')}
                </p>
                <button
                  onClick={() => {
                    if (onGoToStory) {
                      onGoToStory(generatedCharacter)
                    }
                    resetForm()
                  }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  {t('studio.fusionLab.success.buildFirstStory')} {generatedCharacter.name}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Character Gallery */}
        <div className="order-2 lg:order-2">
          <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span>🎭</span> {t('studio.fusionLab.characters')} ({characters.length})
          </h3>

          {characters.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center text-gray-400 text-sm sm:text-base">
              {t('studio.fusionLab.noCharactersYet')}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 lg:space-y-3 lg:max-h-[600px] lg:overflow-y-auto lg:pr-2">
              {characters.map((char) => {
                const animal = ANIMAL_TYPES.find(a => a.id === char.animal_type)
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharacter(char)}
                    className="relative bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <div className={`flex flex-col lg:flex-row items-center gap-2 lg:gap-3 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
                      {char.image_url ? (
                        <img
                          src={char.image_url}
                          alt={char.name}
                          className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="text-3xl sm:text-4xl">{animal?.emoji || '🎭'}</div>
                      )}
                      <div className={`flex-1 min-w-0 text-center ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
                        <div className="font-semibold text-sm sm:text-base truncate hover:text-purple-400 transition-colors">{char.name}</div>
                        <div className="text-xs sm:text-sm text-gray-400 truncate hidden sm:block">
                          {char.personality_trait}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(char)
                        }}
                        className="lg:opacity-0 lg:group-hover:opacity-100 p-1.5 sm:p-2 text-gray-400 hover:text-red-400 transition-all absolute top-2 right-2 lg:static"
                        title="Delete character"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Plot World Content - Story Creation Wizard
function PlotWorldContent({ childId, child, initialCharacter, onCharacterUsed, user }) {
  const { t, language, isRTL } = useLanguage()
  const [characters, setCharacters] = useState([])
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  // Story creation wizard state
  const [step, setStep] = useState(0) // 0 = story list, 1-4 = wizard steps, 5 = generating, 6 = reading
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  // Payment wall state
  const [showPaymentWall, setShowPaymentWall] = useState(false)
  const [usageSummary, setUsageSummary] = useState(null)
  const [paymentWallReason, setPaymentWallReason] = useState('')

  // Handle initial character from Fusion Lab navigation
  useEffect(() => {
    if (initialCharacter && characters.length > 0) {
      // Find the character in the loaded characters list
      const char = characters.find(c => c.id === initialCharacter.id)
      if (char) {
        setSelectedCharacter(char)
        setStep(2) // Go to step 2 - "What's Today's Adventure?" (adventure theme selection)
        if (onCharacterUsed) onCharacterUsed()
      }
    }
  }, [initialCharacter, characters])
  const [adventureTheme, setAdventureTheme] = useState('')
  const [customTheme, setCustomTheme] = useState('')
  const [wantsMoral, setWantsMoral] = useState(false)
  const [selectedMoral, setSelectedMoral] = useState(null)
  const [customMoral, setCustomMoral] = useState('')

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('')
  const [currentStory, setCurrentStory] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  // Delete story state
  const [deleteStoryConfirm, setDeleteStoryConfirm] = useState(null)
  const [isDeletingStory, setIsDeletingStory] = useState(false)

  // Share story state
  const [shareModal, setShareModal] = useState(null) // { story, shareUrl, copied }
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false)

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false)

  // Adventure theme options - using translations
  const ADVENTURE_THEMES = [
    { id: 'space', emoji: '🚀', label: t('studio.plotWorld.adventures.space.label'), desc: t('studio.plotWorld.adventures.space.desc') },
    { id: 'underwater', emoji: '🐠', label: t('studio.plotWorld.adventures.underwater.label'), desc: t('studio.plotWorld.adventures.underwater.desc') },
    { id: 'forest', emoji: '🌲', label: t('studio.plotWorld.adventures.forest.label'), desc: t('studio.plotWorld.adventures.forest.desc') },
    { id: 'castle', emoji: '🏰', label: t('studio.plotWorld.adventures.castle.label'), desc: t('studio.plotWorld.adventures.castle.desc') },
    { id: 'dinosaurs', emoji: '🦕', label: t('studio.plotWorld.adventures.dinosaurs.label'), desc: t('studio.plotWorld.adventures.dinosaurs.desc') },
    { id: 'superheroes', emoji: '🦸', label: t('studio.plotWorld.adventures.superheroes.label'), desc: t('studio.plotWorld.adventures.superheroes.desc') },
    { id: 'pirates', emoji: '🏴‍☠️', label: t('studio.plotWorld.adventures.pirates.label'), desc: t('studio.plotWorld.adventures.pirates.desc') },
    { id: 'candy', emoji: '🍭', label: t('studio.plotWorld.adventures.candy.label'), desc: t('studio.plotWorld.adventures.candy.desc') },
  ]

  // Moral lesson options - using translations
  const MORAL_LESSONS = [
    { id: 'kindness', emoji: '💝', label: t('studio.plotWorld.morals.kindness.label'), desc: t('studio.plotWorld.morals.kindness.desc') },
    { id: 'bravery', emoji: '🦁', label: t('studio.plotWorld.morals.bravery.label'), desc: t('studio.plotWorld.morals.bravery.desc') },
    { id: 'friendship', emoji: '🤝', label: t('studio.plotWorld.morals.friendship.label'), desc: t('studio.plotWorld.morals.friendship.desc') },
    { id: 'honesty', emoji: '⭐', label: t('studio.plotWorld.morals.honesty.label'), desc: t('studio.plotWorld.morals.honesty.desc') },
    { id: 'sharing', emoji: '🎁', label: t('studio.plotWorld.morals.sharing.label'), desc: t('studio.plotWorld.morals.sharing.desc') },
    { id: 'newplace', emoji: '🏠', label: t('studio.plotWorld.morals.newplace.label'), desc: t('studio.plotWorld.morals.newplace.desc') },
    { id: 'patience', emoji: '🐢', label: t('studio.plotWorld.morals.patience.label'), desc: t('studio.plotWorld.morals.patience.desc') },
    { id: 'trying', emoji: '💪', label: t('studio.plotWorld.morals.trying.label'), desc: t('studio.plotWorld.morals.trying.desc') },
    { id: 'different', emoji: '🌈', label: t('studio.plotWorld.morals.different.label'), desc: t('studio.plotWorld.morals.different.desc') },
    { id: 'goodbye', emoji: '👋', label: t('studio.plotWorld.morals.goodbye.label'), desc: t('studio.plotWorld.morals.goodbye.desc') },
  ]

  useEffect(() => {
    fetchData()
  }, [childId])

  // Poll for story image updates when reading a story
  useEffect(() => {
    if (step !== 6 || !currentStory?.id) return

    // Check if we already have all images
    const expectedImages = 3
    if (currentStory.images?.length >= expectedImages) return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('stories')
        .select('images')
        .eq('id', currentStory.id)
        .single()

      if (data && data.images) {
        const currentCount = currentStory.images?.length || 0
        const newCount = data.images.length

        if (newCount > currentCount) {
          setCurrentStory(prev => ({ ...prev, images: data.images }))
        }

        // Stop polling once we have all images
        if (newCount >= expectedImages) {
          clearInterval(interval)
        }
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [step, currentStory?.id, currentStory?.images?.length])

  // Preload all story images in background while reading
  useEffect(() => {
    if (step !== 6 || !currentStory?.images) return

    // Preload all images that exist
    currentStory.images.forEach(img => {
      if (img?.url) {
        const preloadImg = new Image()
        preloadImg.src = img.url
      }
    })
  }, [step, currentStory?.images])

  const fetchData = async () => {
    // Fetch characters
    const { data: charsData } = await supabase
      .from('characters')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (charsData) {
      setCharacters(charsData)
    }

    // Fetch stories
    const { data: storiesData } = await supabase
      .from('stories')
      .select('*, characters(name, image_url)')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (storiesData) {
      setStories(storiesData)
    }

    setLoading(false)
  }

  const getThemeLabel = () => {
    if (customTheme) return customTheme
    const theme = ADVENTURE_THEMES.find(t => t.id === adventureTheme)
    return theme?.label || adventureTheme
  }

  const getMoralLabel = () => {
    if (customMoral) return customMoral
    const moral = MORAL_LESSONS.find(m => m.id === selectedMoral)
    return moral?.desc || selectedMoral
  }

  // Visual style options (same as in FusionLab)
  const VISUAL_STYLES = [
    { id: 'pixar', name: 'Pixar/Disney' },
    { id: 'dreamworks', name: 'DreamWorks' },
    { id: 'ghibli', name: 'Studio Ghibli' },
    { id: 'cartoon-network', name: 'Cartoon Network' },
    { id: 'nickelodeon', name: 'Nickelodeon' },
    { id: 'anime', name: 'Anime Style' },
    { id: 'disney-classic', name: 'Disney Classic' },
    { id: 'illumination', name: 'Illumination' },
  ]

  // Fun loading messages for story generation
  const STORY_LOADING_MESSAGES = [
    { phase: 'writing', messages: [
      "Once upon a time...",
      "The adventure is being written...",
      "Crafting magical moments...",
      `${selectedCharacter?.name || 'Your hero'} is getting ready...`
    ]},
    { phase: 'illustration', messages: [
      "Painting the scenes...",
      "The artists are at work...",
      "Adding colors to the magic...",
      "Almost ready for the show...",
      "The story is coming to life..."
    ]}
  ]

  const handleCreateStory = async () => {
    // Check usage limits before generating
    if (user?.id) {
      const canCreateResult = await canCreate(user.id, 'story')
      if (!canCreateResult.allowed) {
        // Show payment wall
        const summary = await getUsageSummary(user.id)
        setUsageSummary(summary)
        setPaymentWallReason(canCreateResult.reason)
        setShowPaymentWall(true)
        return
      }
    }

    setIsGenerating(true)
    setStep(5)
    setGenerationStatus(`✨ ${selectedCharacter?.name}${t('studio.plotWorld.generating.adventureBegins')}`)

    try {
      // Get visual style from character and convert ID to name
      const styleId = selectedCharacter.visual_style
      const visualStyle = VISUAL_STYLES.find(s => s.id === styleId)?.name || styleId

      // Create story record in database
      const { data: storyData, error: createError } = await supabase
        .from('stories')
        .insert({
          child_id: childId,
          character_id: selectedCharacter.id,
          adventure_theme: getThemeLabel(),
          moral_lesson: wantsMoral ? getMoralLabel() : null,
          status: 'generating'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating story:', createError)
        throw new Error('Failed to create story')
      }

      // Track usage after successful creation
      if (user?.id) {
        await trackCreation(user.id, 'story')
      }

      setGenerationStatus(`📝 ${t('studio.plotWorld.generating.storyBeingWritten')}`)

      // Call generate-story edge function
      const storyResponse = await supabase.functions.invoke('generate-story', {
        body: {
          storyId: storyData.id,
          characterName: selectedCharacter.name,
          characterTraits: selectedCharacter.personality_trait,
          adventureTheme: getThemeLabel(),
          moralLesson: wantsMoral ? getMoralLabel() : null,
          visualStyle: visualStyle,
          animalType: selectedCharacter.animal_type, // Pass animal type so Claude knows the character is an animal
          language: language // Pass language for story generation (en/he)
        }
      })

      if (storyResponse.error) {
        console.error('Story generation error:', storyResponse.error)
        throw new Error('Failed to generate story')
      }

      const storyResult = storyResponse.data
      console.log('Story generated:', storyResult)

      const imagePrompts = storyResult.story.imagePrompts || []

      // WAIT FOR ALL IMAGES: Generate all images sequentially, then show the book
      // This ensures no race conditions and correct image order
      const totalImages = imagePrompts.length

      for (let i = 0; i < imagePrompts.length; i++) {
        const imagePrompt = imagePrompts[i]
        const imageNum = i + 1

        // Update status for each image
        if (imageNum === 1) {
          setGenerationStatus(isRTL ? `🎨 מצייר את הדף הראשון... (${imageNum}/${totalImages})` : `🎨 Painting page ${imageNum} of ${totalImages}...`)
        } else if (imageNum === totalImages) {
          setGenerationStatus(isRTL ? `🎨 מסיים את האיור האחרון... (${imageNum}/${totalImages})` : `🎨 Finishing the last illustration... (${imageNum}/${totalImages})`)
        } else {
          setGenerationStatus(isRTL ? `🎨 מצייר דף ${imageNum} מתוך ${totalImages}...` : `🎨 Painting page ${imageNum} of ${totalImages}...`)
        }

        try {
          console.log(`Starting image ${imageNum} generation...`)
          const response = await supabase.functions.invoke('generate-story-image', {
            body: {
              storyId: storyData.id,
              imageNumber: imagePrompt.imageNumber,
              prompt: imagePrompt.prompt,
              characterImageUrl: selectedCharacter.image_url,
              visualStyle: visualStyle,
              animalType: selectedCharacter.animal_type
            }
          })

          if (response.error) {
            console.error(`Image ${imageNum} generation error:`, response.error)
          } else {
            console.log(`Image ${imageNum} generated successfully`)
            // Preload the image
            if (response.data?.imageUrl) {
              const img = new Image()
              img.src = response.data.imageUrl
            }
          }
        } catch (err) {
          console.error(`Image ${imageNum} error:`, err)
        }
      }

      // All images generated - now show the book!
      setGenerationStatus(isRTL ? '📖 הסיפור מוכן!' : '📖 Your story is ready!')

      // Fetch complete story with all images
      const { data: completeStory } = await supabase
        .from('stories')
        .select('*, characters(name, image_url)')
        .eq('id', storyData.id)
        .single()

      // Show reader with all images
      setCurrentStory(completeStory)
      setCurrentPage(0)
      setStep(6)
      setStories([completeStory, ...stories])
      setIsGenerating(false)

      // Trigger confetti celebration!
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)

      // Update story status to completed
      await supabase
        .from('stories')
        .update({ status: 'completed' })
        .eq('id', storyData.id)

    } catch (error) {
      console.error('Story creation error:', error)
      setGenerationStatus(t('studio.plotWorld.generating.somethingWentWrong'))
      setTimeout(() => {
        resetWizard()
      }, 3000)
    }

    setIsGenerating(false)
  }

  const resetWizard = () => {
    setStep(0)
    setSelectedCharacter(null)
    setAdventureTheme('')
    setCustomTheme('')
    setWantsMoral(false)
    setSelectedMoral(null)
    setCustomMoral('')
    setCurrentStory(null)
    setCurrentPage(0)
    setGenerationStatus('')
  }

  const handleDeleteStory = async (storyId) => {
    setIsDeletingStory(true)
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)

      if (error) {
        console.error('Error deleting story:', error)
      } else {
        setStories(stories.filter(s => s.id !== storyId))
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
    setIsDeletingStory(false)
    setDeleteStoryConfirm(null)
  }

  // Generate a random share token
  const generateShareToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Handle sharing a story
  const handleShareStory = async (story) => {
    setIsGeneratingShareLink(true)

    try {
      let shareToken = story.share_token

      // Generate share token if story doesn't have one
      if (!shareToken) {
        shareToken = generateShareToken()

        // Try to save to database, but don't block if it fails
        // (column might not exist yet)
        try {
          const { error } = await supabase
            .from('stories')
            .update({ share_token: shareToken })
            .eq('id', story.id)

          if (!error) {
            // Update local stories state only if DB update succeeded
            setStories(stories.map(s =>
              s.id === story.id ? { ...s, share_token: shareToken } : s
            ))
          } else {
            console.warn('Could not save share token to database:', error.message)
          }
        } catch (dbErr) {
          console.warn('Database update failed:', dbErr)
        }
      }

      // Build the share URL
      const baseUrl = window.location.origin + (import.meta.env.BASE_URL || '')
      const shareUrl = `${baseUrl}story/${shareToken}`

      setShareModal({ story, shareUrl, copied: false })
    } catch (err) {
      console.error('Share error:', err)
    } finally {
      setIsGeneratingShareLink(false)
    }
  }

  // Copy share URL to clipboard
  const copyShareUrl = async () => {
    if (!shareModal?.shareUrl) return

    try {
      await navigator.clipboard.writeText(shareModal.shareUrl)
      setShareModal({ ...shareModal, copied: true })
      setTimeout(() => {
        setShareModal(prev => prev ? { ...prev, copied: false } : null)
      }, 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const openStory = (story) => {
    setCurrentStory(story)
    setCurrentPage(0)
    setStep(6)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Confetti Effect for Story Creation */}
      <Confetti active={showConfetti} duration={4000} />

      {/* Payment Wall Modal */}
      <PaymentWall
        isOpen={showPaymentWall}
        onClose={() => setShowPaymentWall(false)}
        title={t('studio.plotWorld.upgradeTitle')}
        reason={paymentWallReason}
        usage={usageSummary}
        userEmail={user?.email || ''}
      />

      {/* Header */}
      <div className={`mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-3xl sm:text-4xl">📖</span>
            <span className="truncate">{child?.name}{t('studio.plotWorld.title')}</span>
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">{t('studio.plotWorld.subtitle')}</p>
        </div>
        {step > 0 && step < 5 && (
          <button
            onClick={resetWizard}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-400 hover:text-white transition-colors self-start sm:self-auto ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t('studio.plotWorld.backToStories')}
          </button>
        )}
      </div>

      {characters.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🎭</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t('studio.plotWorld.noCharacters.title')}</h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">
            {t('studio.plotWorld.noCharacters.description')}
          </p>
        </div>
      ) : step === 0 ? (
        /* Story List View */
        <div>
          <button
            onClick={() => setStep(1)}
            className={`mb-6 sm:mb-8 px-5 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <span className="text-lg sm:text-xl">✨</span>
            {t('studio.plotWorld.createNewStory')}
          </button>

          {stories.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-12 text-center">
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">📚</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t('studio.plotWorld.noStories.title')}</h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                {t('studio.plotWorld.noStories.description')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors group"
                >
                  {/* Action buttons */}
                  <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all`}>
                    {/* Share button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShareStory(story)
                      }}
                      className="p-2 bg-black/50 hover:bg-purple-500 rounded-full text-gray-300 hover:text-white transition-all"
                      title={isRTL ? 'שתף סיפור' : 'Share Story'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteStoryConfirm(story)
                      }}
                      className="p-2 bg-black/50 hover:bg-red-500 rounded-full text-gray-300 hover:text-white transition-all"
                      title={t('studio.plotWorld.storyCard.deleteStory')}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div onClick={() => openStory(story)} className="cursor-pointer">
                    {story.images?.[0]?.url ? (
                      <OptimizedImage
                        src={story.images[0].url}
                        alt={story.title}
                        className="w-full h-36 sm:h-48"
                        fallback={
                          <div className="w-full h-36 sm:h-48 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 flex items-center justify-center">
                            <span className="text-5xl sm:text-6xl">📖</span>
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-36 sm:h-48 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 flex items-center justify-center">
                        <span className="text-5xl sm:text-6xl">📖</span>
                      </div>
                    )}
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-blue-400 transition-colors truncate">
                        {story.title || t('studio.plotWorld.storyCard.untitled')}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 truncate">
                        {t('studio.plotWorld.storyCard.starring')} {story.characters?.name || t('studio.plotWorld.storyCard.unknown')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(story.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : step === 1 ? (
        /* Step 1: Choose Your Hero */
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">🦸</span>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('studio.plotWorld.step1.title')}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{t('studio.plotWorld.step1.subtitle')}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(char)}
                  className={`p-2 sm:p-4 rounded-xl text-center transition-all ${
                    selectedCharacter?.id === char.id
                      ? 'bg-blue-500/30 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  {char.image_url ? (
                    <OptimizedImage
                      src={char.image_url}
                      alt={char.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl mx-auto mb-2 sm:mb-3"
                      fallback={
                        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-3xl sm:text-4xl">
                          🎭
                        </div>
                      }
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-3xl sm:text-4xl">
                      🎭
                    </div>
                  )}
                  <div className="font-semibold text-sm sm:text-base truncate">{char.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 sm:mt-1 truncate hidden sm:block">{char.personality_trait}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedCharacter}
              className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              {t('studio.plotWorld.step1.nextButton')}
            </button>
          </div>
        </div>
      ) : step === 2 ? (
        /* Step 2: What's Today's Adventure? */
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">🗺️</span>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('studio.plotWorld.step2.title')}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{t('studio.plotWorld.step2.subtitle')} {selectedCharacter?.name}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {ADVENTURE_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setAdventureTheme(theme.id)
                    setCustomTheme('')
                  }}
                  className={`p-2 sm:p-4 rounded-xl text-center transition-all ${
                    adventureTheme === theme.id && !customTheme
                      ? 'bg-blue-500/30 border-2 border-blue-500'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl block mb-1 sm:mb-2">{theme.emoji}</span>
                  <div className="font-medium text-xs sm:text-sm">{theme.label}</div>
                </button>
              ))}
            </div>

            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-[#0B0A16] text-gray-500">{t('studio.plotWorld.step2.orDescribeOwn')}</span>
              </div>
            </div>

            <input
              type="text"
              value={customTheme}
              onChange={(e) => {
                setCustomTheme(e.target.value)
                if (e.target.value) setAdventureTheme('')
              }}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base mb-6 sm:mb-8 ${isRTL ? 'text-right' : ''}`}
              placeholder={t('studio.plotWorld.step2.customAdventurePlaceholder')}
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all"
              >
                {t('studio.plotWorld.step2.back')}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!adventureTheme && !customTheme}
                className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                {t('studio.plotWorld.step2.nextButton')}
              </button>
            </div>
          </div>
        </div>
      ) : step === 3 ? (
        /* Step 3: Moral/Lesson Selection (Parent Question) */
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">🎓</span>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('studio.plotWorld.step3.title')}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{t('studio.plotWorld.step3.subtitle')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-6 sm:mb-8">
              <button
                onClick={() => setWantsMoral(true)}
                className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                  wantsMoral
                    ? 'bg-emerald-500/30 border-2 border-emerald-500'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                }`}
              >
                {t('studio.plotWorld.step3.yesAddLesson')}
              </button>
              <button
                onClick={() => {
                  setWantsMoral(false)
                  setSelectedMoral(null)
                  setCustomMoral('')
                }}
                className={`px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                  !wantsMoral
                    ? 'bg-blue-500/30 border-2 border-blue-500'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                }`}
              >
                {t('studio.plotWorld.step3.noJustFun')}
              </button>
            </div>

            {wantsMoral && (
              <>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-1">{t('studio.plotWorld.step3.chooseLessonTitle')}</h3>
                  <p className="text-gray-400 text-sm">{t('studio.plotWorld.step3.chooseLessonSubtitle')}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {MORAL_LESSONS.map((moral) => (
                    <button
                      key={moral.id}
                      onClick={() => {
                        setSelectedMoral(moral.id)
                        setCustomMoral('')
                      }}
                      className={`p-2 sm:p-3 rounded-xl text-center transition-all ${
                        selectedMoral === moral.id && !customMoral
                          ? 'bg-emerald-500/30 border-2 border-emerald-500'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl sm:text-2xl block mb-0.5 sm:mb-1">{moral.emoji}</span>
                      <div className="font-medium text-[10px] sm:text-xs">{moral.label}</div>
                    </button>
                  ))}
                </div>

                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 bg-[#0B0A16] text-gray-500">{t('studio.plotWorld.step3.orDescribeOwn')}</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={customMoral}
                  onChange={(e) => {
                    setCustomMoral(e.target.value)
                    if (e.target.value) setSelectedMoral(null)
                  }}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm sm:text-base mb-6 sm:mb-8 ${isRTL ? 'text-right' : ''}`}
                  placeholder={t('studio.plotWorld.step3.customLessonPlaceholder')}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </>
            )}

            <div className={`flex gap-2 sm:gap-3 mt-6 sm:mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all"
              >
                {t('studio.plotWorld.step3.back')}
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={wantsMoral && !selectedMoral && !customMoral}
                className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                {t('studio.plotWorld.step3.nextButton')}
              </button>
            </div>
          </div>
        </div>
      ) : step === 4 ? (
        /* Step 4: Preview & Generate */
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">✨</span>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('studio.plotWorld.step4.title')}</h2>
              <p className="text-gray-400 text-sm sm:text-base">{t('studio.plotWorld.step4.subtitle')}</p>
            </div>

            <div className="bg-black/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                {selectedCharacter?.image_url ? (
                  <img
                    src={selectedCharacter.image_url}
                    alt={selectedCharacter.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-xl flex items-center justify-center text-4xl sm:text-5xl">
                    🎭
                  </div>
                )}
                <div className={`flex-1 text-center ${isRTL ? 'sm:text-right' : 'sm:text-left'}`}>
                  <h3 className="text-lg sm:text-xl font-bold mb-1">{t('studio.plotWorld.step4.hero')}: {selectedCharacter?.name}</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p className="text-gray-400">
                      <span className="text-blue-400">{t('studio.plotWorld.step4.adventure')}:</span> {getThemeLabel()}
                    </p>
                    <p className="text-gray-400">
                      <span className="text-emerald-400">{t('studio.plotWorld.step4.lesson')}:</span> {wantsMoral ? getMoralLabel() : t('studio.plotWorld.step4.noLesson')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all"
              >
                {t('studio.plotWorld.step4.back')}
              </button>
              <button
                onClick={handleCreateStory}
                className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <span>✨</span> <span>{t('studio.plotWorld.step4.createButton')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : step === 5 ? (
        /* Step 5: Generating - with Runner Game */
        <div className="max-w-3xl mx-auto px-2 sm:px-0">
          {/* Header with status */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-4 sm:p-6 text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
                <div className="absolute inset-0 border-3 border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {selectedCharacter?.image_url ? (
                    <img
                      src={selectedCharacter.image_url}
                      alt={selectedCharacter.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl">📖</span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {isRTL ? 'יוצרים את הסיפור שלך...' : 'Creating Your Story...'}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">{generationStatus}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {isRTL ? '🎮 שחקו במשחק בזמן שאנחנו יוצרים את הקסם!' : '🎮 Play the game while we create the magic!'}
            </p>
          </div>

          {/* Runner Game */}
          <div className="mb-6">
            <RunnerGame
              characterImage={selectedCharacter?.image_url}
              characterName={selectedCharacter?.name}
              isRTL={isRTL}
            />
          </div>

          {/* Fun Facts below the game */}
          <div className="mt-4">
            <FunFacts theme={adventureTheme || 'default'} isRTL={isRTL} />
          </div>
        </div>
      ) : step === 6 && currentStory ? (
        /* Step 6: Story Reader - Dynamic Book with flexible page count */
        (() => {
          /*
           * DYNAMIC LAYOUT: Pages are created based on text length
           * - Each story page text is split into chunks that fit comfortably
           * - Images appear on their own spreads
           * - No scrolling - text flows to next page if needed
           *
           * Structure:
           * - Image spreads: Image on left, can have text on right if short
           * - Text spreads: Two text pages side by side
           * - End spread: Final image + "The End"
           */

          // Split story text into display chunks (roughly 200 chars for half-page, 350 for full page)
          // Hebrew needs fewer chars per page due to larger font and wider characters
          const MAX_CHARS_HALF_PAGE = isRTL ? 140 : 200
          const MAX_CHARS_FULL_PAGE = isRTL ? 250 : 350

          // Collect all story text and split into displayable chunks
          const allStoryPages = currentStory.pages || []
          const textChunks = []

          allStoryPages.forEach((page, pageIdx) => {
            const text = page?.text || ''
            // Split by sentences to avoid cutting mid-sentence
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
            let currentChunk = ''

            sentences.forEach((sentence) => {
              const potentialChunk = currentChunk + sentence
              if (potentialChunk.length > MAX_CHARS_HALF_PAGE && currentChunk.length > 0) {
                textChunks.push({ text: currentChunk.trim(), originalPage: pageIdx })
                currentChunk = sentence
              } else {
                currentChunk = potentialChunk
              }
            })

            if (currentChunk.trim()) {
              textChunks.push({ text: currentChunk.trim(), originalPage: pageIdx })
            }
          })

          // Build spread configuration dynamically
          // Pattern: Image1 + text, text pages, Image2 + text, ALL remaining text, Image3 + The End
          // Note: Image 3 ONLY appears on "The End" page to avoid duplication
          const spreads = []
          let textIndex = 0
          const numImages = currentStory.images?.length || 3

          // Add spreads for first 2 images only (image 3 is reserved for The End)
          const imagesForContent = Math.min(numImages - 1, 2) // Use images 0 and 1 for content

          for (let imgIdx = 0; imgIdx < imagesForContent; imgIdx++) {
            // Image spread with one text chunk
            if (textIndex < textChunks.length) {
              spreads.push({
                type: 'image-text',
                imageIndex: imgIdx,
                textChunk: textChunks[textIndex]
              })
              textIndex++
            } else {
              spreads.push({
                type: 'image-only',
                imageIndex: imgIdx
              })
            }

            // Add text-only spreads after each image (up to 2 spreads = 4 text chunks)
            const textsAfterImage = Math.min(4, textChunks.length - textIndex)
            for (let i = 0; i < textsAfterImage; i += 2) {
              const leftText = textChunks[textIndex] || null
              const rightText = textChunks[textIndex + 1] || null
              if (leftText || rightText) {
                spreads.push({
                  type: 'text-only',
                  leftText,
                  rightText
                })
                textIndex += 2
              }
            }
          }

          // Add ALL remaining text as text-only spreads BEFORE "The End"
          while (textIndex < textChunks.length) {
            const leftText = textChunks[textIndex] || null
            const rightText = textChunks[textIndex + 1] || null
            if (leftText || rightText) {
              spreads.push({
                type: 'text-only',
                leftText,
                rightText
              })
            }
            textIndex += 2
          }

          // Add "The End" as the final spread with IMAGE 3 (the last image)
          spreads.push({
            type: 'end',
            imageIndex: numImages - 1 // Always use the last image (index 2 for 3 images)
          })

          const totalSpreads = spreads.length
          const currentSpread = spreads[currentPage] || spreads[0]

          // Fixed book content height for consistent UI
          const BOOK_CONTENT_HEIGHT = 'h-[320px] sm:h-[380px] md:h-[420px]'

          // Calculate ONE font size for the ENTIRE book based on the longest text chunk
          // Like a real book - same font size on every page
          const longestChunkLength = Math.max(...textChunks.map(chunk => chunk.text.length), 0)
          const getBookFontSize = () => {
            // Use the same font size everywhere - sized for the longest chunk to fit
            if (longestChunkLength > 120) return isRTL ? 'text-base sm:text-lg md:text-xl' : 'text-sm sm:text-base md:text-lg'
            if (longestChunkLength > 80) return isRTL ? 'text-lg sm:text-xl md:text-2xl' : 'text-base sm:text-lg md:text-xl'
            return isRTL ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl'
          }
          const bookFontSize = getBookFontSize()

          // Image component
          const ImageSection = ({ imgIndex }) => (
            <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-100 to-orange-100 p-4 sm:p-6 flex items-center justify-center">
              <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-amber-200/50">
                {currentStory.images?.[imgIndex]?.url ? (
                  <OptimizedImage
                    src={currentStory.images[imgIndex].url}
                    alt={`Illustration ${imgIndex + 1}`}
                    className="w-full h-full"
                    priority={true}
                    fallback={
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-100 to-purple-100">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-purple-600 font-medium text-xs sm:text-sm">{t('common.buttons.loading')}</p>
                      </div>
                    }
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-purple-600 font-medium text-xs sm:text-sm">{t('studio.plotWorld.reader.creatingIllustration')}</p>
                  </div>
                )}
              </div>
            </div>
          )

          // Text page component - no scrolling, fixed size, SAME font size on ALL pages
          const TextPage = ({ textChunk, isHalfWidth = true }) => {
            if (!textChunk) {
              return (
                <div className={`${isHalfWidth ? 'w-full md:w-1/2' : 'w-full'} bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6 md:p-8 flex items-center justify-center`}>
                  <div className="text-amber-300 text-4xl">~</div>
                </div>
              )
            }

            return (
              <div
                className={`${isHalfWidth ? 'w-full md:w-1/2' : 'w-full'} bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6 md:p-8 flex flex-col justify-center`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div
                  className={`text-center leading-relaxed space-y-2 sm:space-y-3 ${bookFontSize}`}
                  style={{
                    fontFamily: isRTL ? '"David Libre", "Frank Ruhl Libre", Georgia, serif' : 'Georgia, "Times New Roman", serif',
                    lineHeight: isRTL ? '1.8' : '1.7'
                  }}
                >
                  {textChunk.text.split('\n').map((line, idx) => (
                    <p key={idx} className="text-gray-900 font-medium">{line}</p>
                  ))}
                </div>
              </div>
            )
          }

          // Navigation dots
          const NavigationDots = () => (
            <div className="flex justify-center gap-1 sm:gap-1.5 flex-wrap max-w-[200px] mx-auto">
              {Array.from({ length: totalSpreads }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                    idx === currentPage
                      ? 'bg-purple-500 scale-125'
                      : 'bg-purple-300 hover:bg-purple-400'
                  }`}
                />
              ))}
            </div>
          )

          return (
            <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:min-h-[500px] md:flex md:items-center md:justify-center">
              <div className="relative bg-gradient-to-br from-amber-800/20 to-amber-700/20 rounded-3xl p-2 sm:p-3 shadow-2xl border-4 border-amber-600/40 w-full">

                {/* Close button */}
                <button
                  onClick={resetWizard}
                  className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Inner book pages */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden shadow-inner flex flex-col">
                  {/* Story Title */}
                  <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 py-2 sm:py-3 px-4 sm:px-6 flex-shrink-0">
                    <h1
                      className="text-base sm:text-lg md:text-xl lg:text-2xl font-black text-white text-center drop-shadow-lg"
                      style={{
                        fontFamily: '"Comic Sans MS", "Chalkboard", "Comic Neue", cursive',
                        textShadow: '2px 2px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.3)',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {currentStory.title}
                    </h1>
                  </div>

                  {/* Book content based on spread type - FIXED HEIGHT for consistent UI */}
                  {currentSpread.type === 'end' ? (
                    /* THE END spread */
                    <div className={`flex flex-col md:flex-row ${BOOK_CONTENT_HEIGHT}`}>
                      <ImageSection imgIndex={currentSpread.imageIndex} />
                      <div className="hidden md:block w-0.5 bg-amber-200" />
                      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 p-4 sm:p-6 relative overflow-hidden">
                        {/* Decorative sparkles */}
                        <svg className="absolute top-4 left-4 w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                        </svg>
                        <svg className="absolute top-8 right-6 w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-pulse" style={{ animationDelay: '300ms' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                        </svg>
                        <svg className="absolute bottom-12 left-6 w-4 h-4 sm:w-5 sm:h-5 text-pink-400 animate-pulse" style={{ animationDelay: '500ms' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                        </svg>
                        <svg className="absolute bottom-8 right-4 w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-pulse" style={{ animationDelay: '700ms' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                        </svg>

                        <h2
                          className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-4"
                          style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontStyle: 'italic',
                            letterSpacing: '0.02em'
                          }}
                        >
                          {t('studio.plotWorld.reader.theEnd')}
                        </h2>
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                          <svg className="w-5 h-5 sm:w-7 sm:h-7 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>

                        {/* Share Story Button */}
                        <button
                          onClick={() => handleShareStory(currentStory)}
                          disabled={isGeneratingShareLink}
                          className="mb-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold text-white text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                        >
                          {isGeneratingShareLink ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              {isRTL ? 'יוצר קישור...' : 'Creating link...'}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              {isRTL ? 'שתף סיפור' : 'Share Story'}
                            </>
                          )}
                        </button>

                        <NavigationDots />
                      </div>
                    </div>
                  ) : currentSpread.type === 'image-text' ? (
                    /* Image + Text spread */
                    <div className={`flex flex-col md:flex-row ${BOOK_CONTENT_HEIGHT}`}>
                      <ImageSection imgIndex={currentSpread.imageIndex} />
                      <div className="hidden md:block w-0.5 bg-amber-200" />
                      <div className="w-full md:w-1/2 flex flex-col bg-gradient-to-br from-amber-50 to-orange-50">
                        <div className="flex-1 flex flex-col justify-center">
                          <TextPage textChunk={currentSpread.textChunk} isHalfWidth={false} />
                        </div>
                        <div className="py-2 sm:py-3 border-t border-amber-200/50">
                          <NavigationDots />
                        </div>
                      </div>
                    </div>
                  ) : currentSpread.type === 'image-only' ? (
                    /* Image only spread */
                    <div className={`flex flex-col md:flex-row ${BOOK_CONTENT_HEIGHT}`}>
                      <ImageSection imgIndex={currentSpread.imageIndex} />
                      <div className="hidden md:block w-0.5 bg-amber-200" />
                      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                        <NavigationDots />
                      </div>
                    </div>
                  ) : (
                    /* Text-only spread */
                    <div className={`flex flex-col ${BOOK_CONTENT_HEIGHT}`}>
                      <div className="flex-1 flex flex-col md:flex-row" dir={isRTL ? 'rtl' : 'ltr'}>
                        <TextPage textChunk={currentSpread.leftText} isHalfWidth={true} />
                        <div className="hidden md:block w-0.5 bg-amber-200" />
                        <TextPage textChunk={currentSpread.rightText} isHalfWidth={true} />
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-2 sm:py-3 border-t border-amber-200/50">
                        <NavigationDots />
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-t-2 border-amber-200 flex-shrink-0">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${isRTL ? 'flex-row-reverse' : ''}`}
                      style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}
                    >
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">{t('common.buttons.previous')}</span>
                    </button>

                    <span className="text-purple-700 font-bold text-xs sm:text-sm" style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}>
                      {currentPage + 1} / {totalSpreads}
                    </span>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalSpreads - 1, currentPage + 1))}
                      disabled={currentPage >= totalSpreads - 1}
                      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${isRTL ? 'flex-row-reverse' : ''}`}
                      style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}
                    >
                      <span className="hidden sm:inline">{t('common.buttons.next')}</span>
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()
      ) : null}

      {/* Delete Story Confirmation Modal */}
      {deleteStoryConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setDeleteStoryConfirm(null)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold mb-2">{t('studio.plotWorld.deleteStory.title')}</h3>
              <p className="text-gray-400">
                {t('studio.plotWorld.deleteStory.confirmText')}
              </p>
            </div>
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setDeleteStoryConfirm(null)}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                {t('studio.plotWorld.deleteStory.cancel')}
              </button>
              <button
                onClick={() => handleDeleteStory(deleteStoryConfirm.id)}
                disabled={isDeletingStory}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingStory ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('common.buttons.deleting')}
                  </>
                ) : (
                  t('studio.plotWorld.deleteStory.delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Story Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShareModal(null)}>
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-2">{isRTL ? 'שתף את הסיפור' : 'Share Story'}</h3>
              <p className="text-gray-400">
                {isRTL ? 'שלח את הקישור הזה לחברים ומשפחה כדי שיוכלו לקרוא את הסיפור!' : 'Send this link to friends and family so they can read the story!'}
              </p>
            </div>

            {/* Share URL input */}
            <div className="mb-4">
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <input
                  type="text"
                  value={shareModal.shareUrl}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                  dir="ltr"
                />
                <button
                  onClick={copyShareUrl}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    shareModal.copied
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                  }`}
                >
                  {shareModal.copied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {isRTL ? 'הועתק!' : 'Copied!'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {isRTL ? 'העתק' : 'Copy'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShareModal(null)}
              className="w-full py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
            >
              {isRTL ? 'סגור' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
