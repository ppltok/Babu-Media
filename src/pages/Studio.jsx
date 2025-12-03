import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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
  const navigate = useNavigate()

  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [activeSection, setActiveSection] = useState('fusion-lab') // 'fusion-lab' | 'plot-world'
  const [loading, setLoading] = useState(true)
  const [childMenuOpen, setChildMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [deleteChildConfirm, setDeleteChildConfirm] = useState(null)
  const [isDeletingChild, setIsDeletingChild] = useState(false)

  useEffect(() => {
    fetchChildren()
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
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Babu Media!</h1>
          <p className="text-gray-400 mb-8">
            To start creating magical characters and stories, first add a child profile.
          </p>
          <button
            onClick={handleAddChild}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            Add Child Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0A16] text-white flex flex-col lg:flex-row">
      {/* Delete Child Confirmation Modal */}
      {deleteChildConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">Remove Child Profile?</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to remove <span className="text-white font-medium">{deleteChildConfirm.name}</span>?
            </p>
            <p className="text-red-400 text-sm mb-6">
              This will also delete all their characters and stories. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteChildConfirm(null)}
                disabled={isDeletingChild}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChild(deleteChildConfirm.id)}
                disabled={isDeletingChild}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isDeletingChild ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Remove'
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
                  <div className="text-xs text-gray-400">{child.age} years old</div>
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
            <span>Add Child</span>
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
              <span className="font-medium text-lg">Fusion Lab</span>
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
              <span className="font-medium text-lg">Plot World</span>
            </button>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{user?.email?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.email}</div>
                <div className="text-xs text-gray-500">Parent Account</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-72'} bg-[#0d0c18] border-r border-white/10 flex-col transition-all duration-300 relative`}>
        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg z-10 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ExpandIcon className="w-3 h-3 text-white" />
          ) : (
            <CollapseIcon className="w-3 h-3 text-white" />
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
                    <div className="text-xs text-gray-400">{selectedChild?.age} years old</div>
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
                        <div className="text-xs text-gray-400">{child.age} years old</div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setChildMenuOpen(false)
                        setDeleteChildConfirm(child)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-400 transition-all"
                      title="Remove child"
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
                  <span>Add Child</span>
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
            {!sidebarCollapsed && <span className="font-medium">Fusion Lab</span>}
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
            {!sidebarCollapsed && <span className="font-medium">Plot World</span>}
          </button>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.email}</div>
                <div className="text-xs text-gray-500">Parent Account</div>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogoutIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeSection === 'fusion-lab' && selectedChild && (
          <FusionLabContent childId={selectedChild.id} child={selectedChild} />
        )}
        {activeSection === 'plot-world' && selectedChild && (
          <PlotWorldContent childId={selectedChild.id} child={selectedChild} />
        )}
      </main>
    </div>
  )
}

// Embedded Fusion Lab Content (without the full page wrapper)
function FusionLabContent({ childId, child }) {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)

  // Character creation state
  const [step, setStep] = useState(1)
  const [characterName, setCharacterName] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedTraits, setSelectedTraits] = useState([])
  const [selectedOutfit, setSelectedOutfit] = useState(null)
  const [customOutfit, setCustomOutfit] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCharacter, setGeneratedCharacter] = useState(null)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Character detail view
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  // Data constants
  const ANIMAL_TYPES = [
    { id: 'fox', emoji: '🦊', name: 'Fox' },
    { id: 'wolf', emoji: '🐺', name: 'Wolf' },
    { id: 'raccoon', emoji: '🦝', name: 'Raccoon' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
    { id: 'lion', emoji: '🦁', name: 'Lion' },
    { id: 'owl', emoji: '🦉', name: 'Owl' },
    { id: 'dragon', emoji: '🐉', name: 'Dragon' },
    { id: 'bunny', emoji: '🐰', name: 'Bunny' },
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐕', name: 'Dog' },
    { id: 'bear', emoji: '🐻', name: 'Bear' },
    { id: 'panda', emoji: '🐼', name: 'Panda' },
  ]

  const VISUAL_STYLES = [
    { id: 'pixar', name: 'Pixar/Disney', shows: 'Toy Story, Finding Nemo, Coco', color: 'from-blue-500 to-cyan-500' },
    { id: 'dreamworks', name: 'DreamWorks', shows: 'Shrek, Kung Fu Panda, How to Train Your Dragon', color: 'from-green-500 to-emerald-500' },
    { id: 'ghibli', name: 'Studio Ghibli', shows: 'Totoro, Spirited Away, Ponyo', color: 'from-sky-400 to-blue-500' },
    { id: 'cartoon-network', name: 'Cartoon Network', shows: 'Adventure Time, Powerpuff Girls, Steven Universe', color: 'from-pink-500 to-rose-500' },
    { id: 'nickelodeon', name: 'Nickelodeon', shows: 'SpongeBob, Paw Patrol, Dora', color: 'from-orange-500 to-amber-500' },
    { id: 'anime', name: 'Anime Style', shows: 'Pokemon, Naruto, Dragon Ball', color: 'from-purple-500 to-violet-500' },
    { id: 'disney-classic', name: 'Disney Classic', shows: 'Lion King, Aladdin, Little Mermaid', color: 'from-yellow-500 to-orange-500' },
    { id: 'illumination', name: 'Illumination', shows: 'Minions, Sing, Secret Life of Pets', color: 'from-yellow-400 to-yellow-600' },
  ]

  const PERSONALITY_TRAITS = [
    { id: 'brave', label: 'Brave', emoji: '🦸' },
    { id: 'curious', label: 'Curious', emoji: '🔍' },
    { id: 'kind', label: 'Kind', emoji: '💝' },
    { id: 'clever', label: 'Clever', emoji: '🧠' },
    { id: 'playful', label: 'Playful', emoji: '🎮' },
    { id: 'wise', label: 'Wise', emoji: '🦉' },
    { id: 'gentle', label: 'Gentle', emoji: '🌸' },
    { id: 'bold', label: 'Bold', emoji: '⚡' },
    { id: 'creative', label: 'Creative', emoji: '🎨' },
    { id: 'loyal', label: 'Loyal', emoji: '🤝' },
    { id: 'funny', label: 'Funny', emoji: '😄' },
    { id: 'adventurous', label: 'Adventurous', emoji: '🗺️' },
    { id: 'shy', label: 'Shy', emoji: '🙈' },
    { id: 'confident', label: 'Confident', emoji: '💪' },
    { id: 'caring', label: 'Caring', emoji: '🤗' },
    { id: 'magical', label: 'Magical', emoji: '✨' },
  ]

  const OUTFIT_PRESETS = [
    { id: 'superhero', label: 'Superhero Cape', emoji: '🦸', desc: 'A flowing superhero cape with a bold emblem' },
    { id: 'detective', label: 'Detective', emoji: '🔍', desc: 'Trench coat with a magnifying glass' },
    { id: 'princess', label: 'Princess/Prince', emoji: '👑', desc: 'Royal gown or suit with a crown' },
    { id: 'pirate', label: 'Pirate', emoji: '🏴‍☠️', desc: 'Pirate hat, eye patch, and adventure gear' },
    { id: 'astronaut', label: 'Astronaut', emoji: '🚀', desc: 'Space suit ready for cosmic adventures' },
    { id: 'wizard', label: 'Wizard/Witch', emoji: '🧙', desc: 'Magical robes with a pointed hat' },
    { id: 'sports', label: 'Sports Star', emoji: '⚽', desc: 'Athletic jersey and sneakers' },
    { id: 'artist', label: 'Artist', emoji: '🎨', desc: 'Colorful smock with a beret' },
    { id: 'scientist', label: 'Scientist', emoji: '🔬', desc: 'Lab coat with goggles' },
    { id: 'ninja', label: 'Ninja', emoji: '🥷', desc: 'Stealthy ninja outfit' },
    { id: 'fairy', label: 'Fairy', emoji: '🧚', desc: 'Sparkly wings and magical outfit' },
    { id: 'casual', label: 'Casual', emoji: '👕', desc: 'Comfortable everyday clothes' },
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
    if (!characterName || !selectedAnimal || !selectedStyle || selectedTraits.length === 0) {
      return
    }

    setIsGenerating(true)

    const traitLabels = selectedTraits.map(t => PERSONALITY_TRAITS.find(p => p.id === t)?.label).join(', ')
    const styleName = VISUAL_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle
    const outfitDesc = getOutfitDescription()

    const prompt = `A ${styleName} style illustration of a cute anthropomorphic ${selectedAnimal.name.toLowerCase()} character named ${characterName}. The character has these personality traits: ${traitLabels}. ${outfitDesc ? `Wearing ${outfitDesc}.` : ''} Child-friendly, colorful, expressive face, full body shot, high quality character design.`

    try {
      const { data, error } = await supabase
        .from('characters')
        .insert({
          child_id: childId,
          name: characterName,
          animal_type: selectedAnimal.id,
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

      setGeneratedCharacter(data)
      setCharacters([data, ...characters])

      const response = await supabase.functions.invoke('generate-character', {
        body: {
          characterId: data.id,
          prompt: prompt,
          animalType: selectedAnimal.name,
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">Delete Character?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCharacter(deleteConfirm.id)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Delete'
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
            {/* Close button */}
            <button
              onClick={() => setSelectedCharacter(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-gray-400 hover:text-white transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              <h2 className="text-3xl font-bold mb-2">{selectedCharacter.name}</h2>

              <div className="space-y-4 mt-6">
                {/* Animal Type */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {ANIMAL_TYPES.find(a => a.id === selectedCharacter.animal_type)?.emoji || '🎭'}
                  </span>
                  <div>
                    <div className="text-sm text-gray-400">Animal Type</div>
                    <div className="font-medium">
                      {ANIMAL_TYPES.find(a => a.id === selectedCharacter.animal_type)?.name || selectedCharacter.animal_type}
                    </div>
                  </div>
                </div>

                {/* Visual Style */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <div className="text-sm text-gray-400">Visual Style</div>
                    <div className="font-medium">
                      {VISUAL_STYLES.find(s => s.id === selectedCharacter.visual_style)?.name || selectedCharacter.visual_style}
                    </div>
                  </div>
                </div>

                {/* Personality Traits */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <div className="text-sm text-gray-400">Personality Traits</div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👕</span>
                    <div>
                      <div className="text-sm text-gray-400">Outfit</div>
                      <div className="font-medium">{selectedCharacter.outfit_description}</div>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="text-sm text-gray-400">Created</div>
                    <div className="font-medium">
                      {new Date(selectedCharacter.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirm(selectedCharacter)
                    setSelectedCharacter(null)
                  }}
                  className="py-3 px-6 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
          <span className="text-3xl sm:text-4xl">🧬</span>
          <span className="truncate">{child?.name}'s Fusion Lab</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">Create magical characters with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Character Creator */}
        <div className="lg:col-span-2 order-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Create New Character</h2>

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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Character Name</label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base"
                    placeholder="Detective Dash, Captain Whiskers..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">Choose Animal Type</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                    {ANIMAL_TYPES.map((animal) => (
                      <button
                        key={animal.id}
                        onClick={() => setSelectedAnimal(animal)}
                        className={`p-2 sm:p-3 rounded-xl text-center transition-all ${
                          selectedAnimal?.id === animal.id
                            ? 'bg-purple-500/30 border-2 border-purple-500'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{animal.emoji}</div>
                        <div className="text-[10px] sm:text-xs font-medium">{animal.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!characterName || !selectedAnimal}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Next: Choose Style
                </button>
              </div>
            )}

            {/* Step 2: Visual Style */}
            {step === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">Choose Your Favorite Art Style</label>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Pick the style that reminds you of your favorite shows!</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {VISUAL_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
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

                <div className="flex gap-2 sm:gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedStyle}
                    className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    Next: Personality
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Personality */}
            {step === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Choose Personality Traits</label>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Select up to 4 traits that describe your character</p>
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
                  <p className="text-xs text-gray-500 mt-2">Selected: {selectedTraits.length}/4</p>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={selectedTraits.length === 0}
                    className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    Next: Outfit
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Outfit & Generate */}
            {step === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">Choose an Outfit</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {OUTFIT_PRESETS.map((outfit) => (
                      <button
                        key={outfit.id}
                        onClick={() => {
                          setSelectedOutfit(outfit.id)
                          setCustomOutfit('')
                        }}
                        className={`p-2 sm:p-3 rounded-xl text-left transition-all ${
                          selectedOutfit === outfit.id && !customOutfit
                            ? 'bg-purple-500/30 border-2 border-purple-500'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
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
                      <span className="px-2 bg-[#0B0A16] text-gray-500">or describe your own</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={customOutfit}
                    onChange={(e) => {
                      setCustomOutfit(e.target.value)
                      if (e.target.value) setSelectedOutfit(null)
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base"
                    placeholder="Describe a custom outfit..."
                  />
                </div>

                {/* Preview */}
                <div className="bg-black/20 rounded-xl p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-3 sm:mb-4">Character Preview</h3>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-4xl sm:text-6xl">{selectedAnimal?.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg sm:text-xl font-bold truncate">{characterName}</div>
                      <div className="text-gray-400 text-xs sm:text-sm truncate">
                        {selectedTraits.map(t => PERSONALITY_TRAITS.find(p => p.id === t)?.label).join(', ')}
                      </div>
                      <div className="text-purple-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                        {VISUAL_STYLES.find(s => s.id === selectedStyle)?.name} Style
                      </div>
                      {getOutfitDescription() && (
                        <div className="text-emerald-400 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">
                          Outfit: {getOutfitDescription()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all">
                    Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span> <span>Bring to Life!</span>
                      </>
                    )}
                  </button>
                </div>
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
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{generatedCharacter.name} is Ready!</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 px-2">
                  {generatedCharacter.image_url
                    ? "Your character has been created with AI magic!"
                    : "Your character has been saved. Image generation may take a moment."}
                </p>
                <button
                  onClick={resetForm}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Create Another Character
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Character Gallery */}
        <div className="order-2 lg:order-2">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span>🎭</span> Characters ({characters.length})
          </h3>

          {characters.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 text-center text-gray-400 text-sm sm:text-base">
              No characters yet. Create your first one!
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
                    <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3">
                      {char.image_url ? (
                        <img
                          src={char.image_url}
                          alt={char.name}
                          className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="text-3xl sm:text-4xl">{animal?.emoji || '🎭'}</div>
                      )}
                      <div className="flex-1 min-w-0 text-center lg:text-left">
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
function PlotWorldContent({ childId, child }) {
  const [characters, setCharacters] = useState([])
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  // Story creation wizard state
  const [step, setStep] = useState(0) // 0 = story list, 1-4 = wizard steps, 5 = generating, 6 = reading
  const [selectedCharacter, setSelectedCharacter] = useState(null)
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

  // Adventure theme options
  const ADVENTURE_THEMES = [
    { id: 'space', emoji: '🚀', label: 'Space Adventure', desc: 'Journey through the stars and planets' },
    { id: 'underwater', emoji: '🐠', label: 'Underwater Discovery', desc: 'Explore the magical ocean depths' },
    { id: 'forest', emoji: '🌲', label: 'Enchanted Forest', desc: 'Adventures in a magical woodland' },
    { id: 'castle', emoji: '🏰', label: 'Kingdom Quest', desc: 'A royal adventure in a magical kingdom' },
    { id: 'dinosaurs', emoji: '🦕', label: 'Dinosaur Land', desc: 'Travel back to prehistoric times' },
    { id: 'superheroes', emoji: '🦸', label: 'Superhero Mission', desc: 'Save the day with special powers' },
    { id: 'pirates', emoji: '🏴‍☠️', label: 'Pirate Treasure', desc: 'Hunt for hidden treasure on the high seas' },
    { id: 'candy', emoji: '🍭', label: 'Candy World', desc: 'A sweet adventure in a land of treats' },
  ]

  // Moral lesson options
  const MORAL_LESSONS = [
    { id: 'kindness', emoji: '💝', label: 'Being Kind', desc: 'Learning to be kind and help others' },
    { id: 'bravery', emoji: '🦁', label: 'Overcoming Fear', desc: 'Being brave even when scared' },
    { id: 'friendship', emoji: '🤝', label: 'Making Friends', desc: 'How to make and keep good friends' },
    { id: 'honesty', emoji: '⭐', label: 'Telling the Truth', desc: 'The importance of being honest' },
    { id: 'sharing', emoji: '🎁', label: 'Learning to Share', desc: 'The joy of sharing with others' },
    { id: 'newplace', emoji: '🏠', label: 'New Beginnings', desc: 'Adjusting to a new place or school' },
    { id: 'patience', emoji: '🐢', label: 'Being Patient', desc: 'Good things come to those who wait' },
    { id: 'trying', emoji: '💪', label: 'Never Give Up', desc: 'Keep trying even when things are hard' },
    { id: 'different', emoji: '🌈', label: 'Being Different', desc: 'Celebrating what makes you unique' },
    { id: 'goodbye', emoji: '👋', label: 'Saying Goodbye', desc: 'Dealing with goodbyes and loss' },
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

  const handleCreateStory = async () => {
    setIsGenerating(true)
    setStep(5)
    setGenerationStatus('Creating your magical story...')

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

      setGenerationStatus('Writing the story with AI magic...')

      // Call generate-story edge function
      const storyResponse = await supabase.functions.invoke('generate-story', {
        body: {
          storyId: storyData.id,
          characterName: selectedCharacter.name,
          characterTraits: selectedCharacter.personality_trait,
          adventureTheme: getThemeLabel(),
          moralLesson: wantsMoral ? getMoralLabel() : null,
          visualStyle: visualStyle
        }
      })

      if (storyResponse.error) {
        console.error('Story generation error:', storyResponse.error)
        throw new Error('Failed to generate story')
      }

      const storyResult = storyResponse.data
      console.log('Story generated:', storyResult)

      const imagePrompts = storyResult.story.imagePrompts || []

      // Generate ONLY the first image and wait for it
      if (imagePrompts.length > 0) {
        setGenerationStatus('Creating first illustration...')

        const firstImageResponse = await supabase.functions.invoke('generate-story-image', {
          body: {
            storyId: storyData.id,
            imageNumber: imagePrompts[0].imageNumber,
            prompt: imagePrompts[0].prompt,
            characterImageUrl: selectedCharacter.image_url,
            visualStyle: visualStyle
          }
        })

        if (firstImageResponse.error) {
          console.error('First image generation error:', firstImageResponse.error)
        }
      }

      // Fetch story with first image
      const { data: storyWithFirstImage } = await supabase
        .from('stories')
        .select('*, characters(name, image_url)')
        .eq('id', storyData.id)
        .single()

      // Show reader immediately with first image
      setCurrentStory(storyWithFirstImage)
      setCurrentPage(0)
      setStep(6)
      setStories([storyWithFirstImage, ...stories])
      setIsGenerating(false)

      // Generate remaining images in background (don't await)
      const remainingPrompts = imagePrompts.slice(1)
      remainingPrompts.forEach((imagePrompt) => {
        supabase.functions.invoke('generate-story-image', {
          body: {
            storyId: storyData.id,
            imageNumber: imagePrompt.imageNumber,
            prompt: imagePrompt.prompt,
            characterImageUrl: selectedCharacter.image_url,
            visualStyle: visualStyle
          }
        }).then(() => {
          console.log(`Image ${imagePrompt.imageNumber} generated in background`)
        }).catch((err) => {
          console.error(`Background image ${imagePrompt.imageNumber} error:`, err)
        })
      })

      // Update story status to completed
      await supabase
        .from('stories')
        .update({ status: 'completed' })
        .eq('id', storyData.id)

    } catch (error) {
      console.error('Story creation error:', error)
      setGenerationStatus('Something went wrong. Please try again.')
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <span className="text-3xl sm:text-4xl">📖</span>
            <span className="truncate">{child?.name}'s Plot World</span>
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Create magical stories with your characters</p>
        </div>
        {step > 0 && step < 5 && (
          <button
            onClick={resetWizard}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-400 hover:text-white transition-colors self-start sm:self-auto"
          >
            ← Back to Stories
          </button>
        )}
      </div>

      {characters.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-12 text-center">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">🎭</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">No Characters Yet</h2>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">
            Before creating stories, you need to create some characters in the Fusion Lab.
            Your characters will be the stars of your stories!
          </p>
        </div>
      ) : step === 0 ? (
        /* Story List View */
        <div>
          <button
            onClick={() => setStep(1)}
            className="mb-6 sm:mb-8 px-5 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 sm:gap-3"
          >
            <span className="text-lg sm:text-xl">✨</span>
            Create New Story
          </button>

          {stories.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-12 text-center">
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">📚</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">No Stories Yet</h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                Click the button above to create your first magical adventure!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => openStory(story)}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  {story.images?.[0]?.url ? (
                    <img
                      src={story.images[0].url}
                      alt={story.title}
                      className="w-full h-36 sm:h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 sm:h-48 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 flex items-center justify-center">
                      <span className="text-5xl sm:text-6xl">📖</span>
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-blue-400 transition-colors truncate">
                      {story.title || 'Untitled Story'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 truncate">
                      Starring {story.characters?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(story.created_at).toLocaleDateString()}
                    </p>
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
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Choose Your Hero</h2>
              <p className="text-gray-400 text-sm sm:text-base">Who will be the star of today's adventure?</p>
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
                    <img
                      src={char.image_url}
                      alt={char.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover mx-auto mb-2 sm:mb-3"
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
              Next: Choose Adventure
            </button>
          </div>
        </div>
      ) : step === 2 ? (
        /* Step 2: What's Today's Adventure? */
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">🗺️</span>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">What's Today's Adventure?</h2>
              <p className="text-gray-400 text-sm sm:text-base">Choose the type of adventure for {selectedCharacter?.name}</p>
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
                <span className="px-2 bg-[#0B0A16] text-gray-500">or describe your own</span>
              </div>
            </div>

            <input
              type="text"
              value={customTheme}
              onChange={(e) => {
                setCustomTheme(e.target.value)
                if (e.target.value) setAdventureTheme('')
              }}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base mb-6 sm:mb-8"
              placeholder="Describe a custom adventure..."
            />

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!adventureTheme && !customTheme}
                className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Next: Story Options
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
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Add a Learning Moment?</h2>
              <p className="text-gray-400 text-sm sm:text-base">Would you like the story to teach a valuable lesson?</p>
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
                Yes, add a lesson
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
                Just fun adventure!
              </button>
            </div>

            {wantsMoral && (
              <>
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
                    <span className="px-2 bg-[#0B0A16] text-gray-500">or describe your own</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={customMoral}
                  onChange={(e) => {
                    setCustomMoral(e.target.value)
                    if (e.target.value) setSelectedMoral(null)
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm sm:text-base mb-6 sm:mb-8"
                  placeholder="Describe a custom lesson..."
                />
              </>
            )}

            <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={wantsMoral && !selectedMoral && !customMoral}
                className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Next: Preview
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
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to Create Magic?</h2>
              <p className="text-gray-400 text-sm sm:text-base">Review your story setup</p>
            </div>

            <div className="bg-black/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
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
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold mb-1">{selectedCharacter?.name}'s Adventure</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <p className="text-gray-400">
                      <span className="text-blue-400">Adventure:</span> {getThemeLabel()}
                    </p>
                    {wantsMoral && (
                      <p className="text-gray-400">
                        <span className="text-emerald-400">Lesson:</span> {getMoralLabel()}
                      </p>
                    )}
                    <p className="text-gray-400">
                      <span className="text-purple-400">Hero Traits:</span> {selectedCharacter?.personality_trait}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 text-xs sm:text-sm text-blue-300">
              <p>📝 Your story will have 6 pages with 3 beautiful illustrations featuring {selectedCharacter?.name}!</p>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 sm:py-4 border border-white/20 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleCreateStory}
                className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
              >
                <span>✨</span> <span>Create Story!</span>
              </button>
            </div>
          </div>
        </div>
      ) : step === 5 ? (
        /* Step 5: Generating */
        <div className="max-w-2xl mx-auto px-2 sm:px-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 relative">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-3 sm:inset-4 flex items-center justify-center text-3xl sm:text-4xl">📖</div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Creating Your Story...</h2>
            <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">{generationStatus}</p>
            <p className="text-xs sm:text-sm text-gray-500">This may take a minute or two</p>
          </div>
        </div>
      ) : step === 6 && currentStory ? (
        /* Step 6: Story Reader - Book Style */
        (() => {
          // Total pages: 6 story pages + 1 "The End" page = 7
          const totalPages = 7
          const isTheEndPage = currentPage === 6
          // Image position: pages 0-1 (image 0) = left, pages 2-3 (image 1) = right, pages 4-5 (image 2) = left
          const imageIndex = Math.floor(currentPage / 2)
          const isImageOnLeft = imageIndex % 2 === 0 // 0, 2 = left; 1 = right

          // Image component
          const ImageSection = () => (
            <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-100 to-orange-100 p-3 sm:p-4 md:p-6 flex items-center justify-center">
              <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-amber-200/50">
                {currentStory.images?.[imageIndex]?.url ? (
                  <img
                    src={currentStory.images[imageIndex].url}
                    alt={`Illustration ${imageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-purple-600 font-medium text-sm sm:text-base">Creating illustration...</p>
                  </div>
                )}
              </div>
            </div>
          )

          // Text component
          const TextSection = () => (
            <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-6 md:p-8 flex flex-col">
              {/* Page number */}
              <div className="text-center mb-3 sm:mb-4">
                <span
                  className="inline-block px-3 sm:px-4 py-1 bg-purple-500/20 text-purple-700 rounded-full text-xs sm:text-sm font-bold"
                  style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}
                >
                  Page {currentPage + 1} of {totalPages}
                </span>
              </div>

              {/* Story text */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="text-lg sm:text-xl md:text-2xl text-center leading-relaxed space-y-3 sm:space-y-4"
                  style={{ lineHeight: '1.8' }}
                >
                  {(currentStory.pages?.[currentPage]?.text || 'Loading...').split('\n').map((line, idx) => (
                    <p key={idx} className="text-gray-900 font-medium">{line}</p>
                  ))}
                </div>
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center gap-1.5 sm:gap-2 mt-4">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                      idx === currentPage
                        ? 'bg-purple-500 scale-125'
                        : 'bg-purple-300 hover:bg-purple-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          )

          return (
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
              {/* Book Container with frame */}
              <div className="relative bg-gradient-to-br from-amber-800/20 to-amber-700/20 rounded-3xl p-2 sm:p-3 md:p-4 shadow-2xl border-4 border-amber-600/40">

                {/* Close button - Red X in upper left */}
                <button
                  onClick={resetWizard}
                  className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Inner book pages */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden shadow-inner">
                  {/* Story Title - Cute childish font style */}
                  <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 py-3 sm:py-4 px-4 sm:px-6">
                    <h1
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white text-center drop-shadow-lg"
                      style={{
                        fontFamily: '"Comic Sans MS", "Chalkboard", "Comic Neue", cursive',
                        textShadow: '3px 3px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(255,255,255,0.3)',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {currentStory.title}
                    </h1>
                  </div>

                  {/* Book content */}
                  {isTheEndPage ? (
                    /* THE END page - Full width, centered */
                    <div className="flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 p-8">
                      {/* Decorative stars */}
                      <div className="absolute top-20 left-10 text-4xl animate-pulse">✨</div>
                      <div className="absolute top-32 right-16 text-3xl animate-pulse delay-300">⭐</div>
                      <div className="absolute bottom-32 left-20 text-3xl animate-pulse delay-500">🌟</div>
                      <div className="absolute bottom-20 right-10 text-4xl animate-pulse delay-700">✨</div>

                      {/* The End text */}
                      <div className="text-center relative">
                        <h2
                          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-6"
                          style={{
                            fontFamily: '"Comic Sans MS", "Chalkboard", "Comic Neue", cursive',
                            textShadow: '4px 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          The End
                        </h2>
                        <div className="flex items-center justify-center gap-4 mb-8">
                          <span className="text-3xl sm:text-4xl">🎉</span>
                          <span className="text-3xl sm:text-4xl">📚</span>
                          <span className="text-3xl sm:text-4xl">🎉</span>
                        </div>
                        <p
                          className="text-lg sm:text-xl md:text-2xl text-purple-700 max-w-md mx-auto"
                          style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}
                        >
                          Thank you for reading!
                        </p>
                        <p
                          className="text-base sm:text-lg text-purple-500 mt-2"
                          style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}
                        >
                          We hope you enjoyed {currentStory.characters?.name || 'this'}'s adventure! 💜
                        </p>
                      </div>

                      {/* Navigation dots */}
                      <div className="flex justify-center gap-1.5 sm:gap-2 mt-8">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(idx)}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                              idx === currentPage
                                ? 'bg-purple-500 scale-125'
                                : 'bg-purple-300 hover:bg-purple-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Regular story pages with alternating image position */
                    <div className="flex flex-col md:flex-row min-h-[400px] md:min-h-[500px]">
                      {isImageOnLeft ? (
                        <>
                          <ImageSection />
                          <div className="hidden md:block w-0.5 bg-amber-200" />
                          <TextSection />
                        </>
                      ) : (
                        <>
                          <TextSection />
                          <div className="hidden md:block w-0.5 bg-amber-200" />
                          <ImageSection />
                        </>
                      )}
                    </div>
                  )}

                  {/* Navigation buttons - Below the book pages */}
                  <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-t-2 border-amber-200">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold text-sm sm:text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                      style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold text-sm sm:text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                      style={{ fontFamily: '"Comic Sans MS", "Chalkboard", cursive' }}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
    </div>
  )
}
