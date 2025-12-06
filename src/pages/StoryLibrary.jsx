import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// Featured stories by share token (these appear first, in order)
const FEATURED_SHARE_TOKENS = [
  'rZt0e7gGc2nA',
  'idMeDtwlXJ09',
  'JYT9YUJBGnyu',
  'GQzszSG3q5Uj',
  'LhfVjqxDwpL9'
]

// Additional featured stories by title
const FEATURED_STORY_TITLES = [
  'Babu in the Magic Forest',
  "Bonbon and the Pirate's Golden Treasure",
  'Brian the Brave Little Lion',
  "ג'ורג' הפינגווין והמנהרה הקסומה"
]

// Optimized Image Component
const OptimizedImage = ({ src, alt, className, fallback, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)

    if (src && priority) {
      const img = new Image()
      img.src = src
      img.onload = () => setIsLoaded(true)
      img.onerror = () => setHasError(true)
    }
  }, [src, priority])

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

// Book Reader Component (same as in Studio.jsx and PublicStoryReader.jsx)
function BookReader({ story, onClose, isRTL, t, showCTA = true, localizedHref }) {
  const [currentPage, setCurrentPage] = useState(0)
  const { user } = useAuth()

  // Parse story pages - extract text from page objects
  const storyPages = Array.isArray(story.pages) ? story.pages : []

  // Character limit per chunk
  const maxCharsPerChunk = isRTL ? 140 : 200

  const textChunks = []
  let currentChunk = ''

  // Process each page, extracting text from objects
  storyPages.forEach((page) => {
    const pageText = typeof page === 'string' ? page : (page?.text || '')
    if (!pageText) return

    const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText]

    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) return

      if (currentChunk.length + trimmedSentence.length <= maxCharsPerChunk) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence
      } else {
        if (currentChunk) {
          textChunks.push({ text: currentChunk })
        }
        currentChunk = trimmedSentence
      }
    })
  })

  if (currentChunk) {
    textChunks.push({ text: currentChunk })
  }

  const numImages = story.images?.length || 0
  const spreads = []
  let textIndex = 0

  // Build spreads
  for (let imgIdx = 0; imgIdx < Math.min(numImages - 1, 2); imgIdx++) {
    spreads.push({
      type: 'image-text',
      imageIndex: imgIdx,
      textChunk: textChunks[textIndex] || null
    })
    textIndex++

    if (textChunks[textIndex]) {
      spreads.push({
        type: 'text-only',
        textChunk: textChunks[textIndex],
        textChunk2: textChunks[textIndex + 1] || null
      })
      textIndex += 2
    }
  }

  // Add remaining text pages
  while (textIndex < textChunks.length) {
    spreads.push({
      type: 'text-only',
      textChunk: textChunks[textIndex],
      textChunk2: textChunks[textIndex + 1] || null
    })
    textIndex += 2
  }

  // Add "The End" spread
  spreads.push({
    type: 'end',
    imageIndex: numImages - 1
  })

  const totalSpreads = spreads.length
  const currentSpread = spreads[currentPage] || spreads[0]

  const BOOK_CONTENT_HEIGHT = 'h-[320px] sm:h-[380px] md:h-[420px]'

  const longestChunkLength = Math.max(...textChunks.map(chunk => chunk.text.length), 0)
  const getBookFontSize = () => {
    if (longestChunkLength > 120) return isRTL ? 'text-base sm:text-lg md:text-xl' : 'text-sm sm:text-base md:text-lg'
    if (longestChunkLength > 80) return isRTL ? 'text-lg sm:text-xl md:text-2xl' : 'text-base sm:text-lg md:text-xl'
    return isRTL ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl'
  }
  const bookFontSize = getBookFontSize()

  const ImageSection = ({ imgIndex }) => (
    <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-100 to-orange-100 p-4 sm:p-6 flex items-center justify-center">
      <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-amber-200/50">
        {story.images?.[imgIndex]?.url ? (
          <OptimizedImage
            src={story.images[imgIndex].url}
            alt={`Illustration ${imgIndex + 1}`}
            className="w-full h-full"
            priority={true}
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-100 to-purple-100">
                <span className="text-4xl">📖</span>
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-100 to-purple-100">
            <span className="text-4xl">📖</span>
          </div>
        )}
      </div>
    </div>
  )

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

  // CTA for non-logged-in users
  const SignUpCTA = () => (
    <div className="mt-3 flex flex-col items-center gap-2">
      <Link
        to={localizedHref('/signup')}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-white text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        {isRTL ? 'צור סיפור משלך!' : 'Create Your Own Story!'}
      </Link>
      <p className="text-amber-700 text-xs text-center">
        {isRTL ? 'הצטרף וצור סיפורים קסומים לילדים שלך' : 'Join and create magical stories for your kids'}
      </p>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-5xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Book */}
        <div className="relative bg-gradient-to-br from-amber-800/20 to-amber-700/20 rounded-3xl p-2 sm:p-3 shadow-2xl border-4 border-amber-600/40 w-full">
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
                {story.title}
              </h1>
            </div>

            {/* Book content */}
            {currentSpread.type === 'end' ? (
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
                  <svg className="absolute bottom-16 left-6 w-4 h-4 sm:w-5 sm:h-5 text-pink-400 animate-pulse" style={{ animationDelay: '500ms' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                  <svg className="absolute bottom-12 right-4 w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-pulse" style={{ animationDelay: '700ms' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>

                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-2"
                    style={{
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontStyle: 'italic',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {isRTL ? 'הסוף' : 'The End'}
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
                  <NavigationDots />

                  {/* CTA for non-logged-in users */}
                  {showCTA && !user && <SignUpCTA />}
                </div>
              </div>
            ) : currentSpread.type === 'image-text' ? (
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
            ) : (
              <div className={`flex flex-col md:flex-row ${BOOK_CONTENT_HEIGHT} relative`}>
                <TextPage textChunk={currentSpread.textChunk} />
                <div className="hidden md:block w-0.5 bg-amber-200" />
                <TextPage textChunk={currentSpread.textChunk2} />
                <div className="py-2 sm:py-3 md:absolute md:bottom-2 md:left-0 md:right-0">
                  <NavigationDots />
                </div>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-0 -mr-3 sm:-mr-5' : 'left-0 -ml-3 sm:-ml-5'} w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/80 hover:bg-amber-500 rounded-full flex items-center justify-center shadow-lg transition-all ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${isRTL ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentPage(Math.min(totalSpreads - 1, currentPage + 1))}
            disabled={currentPage === totalSpreads - 1}
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-0 -ml-3 sm:-ml-5' : 'right-0 -mr-3 sm:-mr-5'} w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/80 hover:bg-amber-500 rounded-full flex items-center justify-center shadow-lg transition-all ${currentPage === totalSpreads - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            <svg className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StoryLibrary() {
  const { t, isRTL, language, localizedHref } = useLanguage()
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState(null)

  const isHebrew = language === 'he'

  // Fetch featured stories from database
  useEffect(() => {
    const fetchStories = async () => {
      try {
        // Fetch stories by share token (these will be shown first)
        const { data: tokenStories, error: tokenError } = await supabase
          .from('stories')
          .select('*, characters(name, image_url)')
          .in('share_token', FEATURED_SHARE_TOKENS)

        if (tokenError) {
          console.error('Error fetching token stories:', tokenError)
        }

        // Fetch stories by their titles
        const { data: titleStories, error: titleError } = await supabase
          .from('stories')
          .select('*, characters(name, image_url)')
          .in('title', FEATURED_STORY_TITLES)

        if (titleError) {
          console.error('Error fetching title stories:', titleError)
        }

        // Combine and deduplicate stories (token stories first, in order)
        const allStories = []
        const seenIds = new Set()

        // Add token stories first, in the order specified
        if (tokenStories) {
          FEATURED_SHARE_TOKENS.forEach(token => {
            const story = tokenStories.find(s => s.share_token === token)
            if (story && !seenIds.has(story.id)) {
              allStories.push(story)
              seenIds.add(story.id)
            }
          })
        }

        // Add title stories
        if (titleStories) {
          titleStories.forEach(story => {
            if (!seenIds.has(story.id)) {
              allStories.push(story)
              seenIds.add(story.id)
            }
          })
        }

        setStories(allStories)
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [])

  // Get adventure theme color
  const getThemeColor = (theme) => {
    const colors = {
      forest: 'from-emerald-500 to-teal-500',
      pirates: 'from-amber-500 to-orange-500',
      space: 'from-indigo-500 to-purple-500',
      underwater: 'from-blue-500 to-cyan-500',
      castle: 'from-purple-500 to-pink-500',
      dinosaurs: 'from-green-500 to-lime-500',
      superheroes: 'from-red-500 to-orange-500',
      candy: 'from-pink-500 to-rose-500',
      default: 'from-purple-500 to-pink-500'
    }
    return colors[theme] || colors.default
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">{isHebrew ? 'טוען סיפורים...' : 'Loading stories...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0A16] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to={localizedHref('/')}
            className={`flex items-center gap-2 text-gray-400 hover:text-white transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {isHebrew ? 'חזרה לדף הבית' : 'Back to Home'}
          </Link>

          {!user ? (
            <Link
              to={localizedHref('/signup')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              {isHebrew ? 'צור סיפור משלך' : 'Create Your Own'}
            </Link>
          ) : (
            <Link
              to={localizedHref('/dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              {isHebrew ? 'לסטודיו שלי' : 'My Studio'}
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm font-medium text-purple-300 mb-6">
            <span className="text-xl">📚</span>
            {isHebrew ? 'ספריית הסיפורים' : 'Story Library'}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {isHebrew ? (
              <>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">גלו את הקסם</span>
                <br />
                של סיפורי הילדים שלנו
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Discover the Magic</span>
                <br />
                of Our Children's Stories
              </>
            )}
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {isHebrew
              ? 'לחצו על כל סיפור כדי לקרוא אותו במלואו. כל סיפור נוצר עם דמויות מקוריות, הרפתקאות מרתקות ולקחים חשובים.'
              : 'Click on any story to read it in full. Each story is crafted with original characters, exciting adventures, and meaningful lessons.'
            }
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400">
              {isHebrew ? 'אין סיפורים להצגה כרגע' : 'No stories to display yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                onClick={() => setSelectedStory(story)}
              >
                {/* Story Cover Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getThemeColor(story.adventure_theme)} opacity-60`} />
                  {story.images?.[0]?.url && (
                    <OptimizedImage
                      src={story.images[0].url}
                      alt={story.title}
                      className="w-full h-full"
                      fallback={
                        <div className={`w-full h-full bg-gradient-to-br ${getThemeColor(story.adventure_theme)} flex items-center justify-center`}>
                          <span className="text-6xl">📖</span>
                        </div>
                      }
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A16] via-transparent to-transparent" />

                  {/* Character Badge */}
                  <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} flex items-center gap-3`}>
                    <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 overflow-hidden backdrop-blur-sm">
                      {story.characters?.image_url ? (
                        <OptimizedImage
                          src={story.characters.image_url}
                          alt={story.characters.name}
                          className="w-full h-full"
                          fallback={<div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">🎭</div>}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">🎭</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {story.characters?.name || (isHebrew ? 'דמות' : 'Character')}
                      </div>
                    </div>
                  </div>

                  {/* Read button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="px-6 py-3 bg-white/90 rounded-full font-bold text-gray-900 flex items-center gap-2 shadow-xl">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {isHebrew ? 'קרא סיפור' : 'Read Story'}
                    </div>
                  </div>
                </div>

                {/* Story Info */}
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                    {story.title}
                  </h3>

                  {/* Tags */}
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                    {story.moral_lesson && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full flex items-center gap-1">
                        <span>🎯</span>
                        {story.moral_lesson}
                      </span>
                    )}
                    {story.adventure_theme && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full flex items-center gap-1">
                        <span>🗺️</span>
                        {story.adventure_theme}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">✨</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {isHebrew ? 'רוצים ליצור סיפור משלכם?' : 'Want to Create Your Own Story?'}
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            {isHebrew
              ? 'צרו דמויות מקוריות, בחרו הרפתקאות ולקחים, ותנו לקסם של AI ליצור סיפורים מותאמים אישית לילדים שלכם.'
              : 'Create original characters, choose adventures and lessons, and let AI magic craft personalized stories for your children.'
            }
          </p>
          <Link
            to={localizedHref('/signup')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-105"
          >
            {isHebrew ? 'התחילו עכשיו - חינם!' : 'Start Now - Free!'}
            <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Book Reader Modal */}
      {selectedStory && (
        <BookReader
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          isRTL={isRTL}
          t={t}
          showCTA={true}
          localizedHref={localizedHref}
        />
      )}
    </div>
  )
}
