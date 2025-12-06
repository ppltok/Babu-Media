import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

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

export default function PublicStoryReader() {
  const { shareToken } = useParams()
  const navigate = useNavigate()
  const { t, isRTL, language, localizedHref } = useLanguage()
  const { user } = useAuth()

  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('stories')
          .select('*, characters(name, image_url)')
          .eq('share_token', shareToken)
          .single()

        if (fetchError) {
          throw fetchError
        }

        if (!data) {
          setError('Story not found')
          return
        }

        setStory(data)
      } catch (err) {
        console.error('Error fetching story:', err)
        setError('Story not found or has been removed')
      } finally {
        setLoading(false)
      }
    }

    if (shareToken) {
      fetchStory()
    }
  }, [shareToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">{t('common.buttons.loading') || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">📖</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {isRTL ? 'הסיפור לא נמצא' : 'Story Not Found'}
          </h1>
          <p className="text-gray-400 mb-8">
            {isRTL ? 'הסיפור הזה לא קיים או הוסר' : 'This story doesn\'t exist or has been removed'}
          </p>
          <Link
            to={localizedHref('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            {isRTL ? 'צור סיפור משלך' : 'Create Your Own Story'}
          </Link>
        </div>
      </div>
    )
  }

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
        <div className={`${isHalfWidth ? 'w-full md:w-1/2' : 'w-full'} bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-6 md:p-8 flex items-center justify-center overflow-hidden`}>
          <div className="text-amber-300 text-4xl">~</div>
        </div>
      )
    }

    return (
      <div
        className={`${isHalfWidth ? 'w-full md:w-1/2' : 'w-full'} bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-6 md:p-8 flex flex-col justify-center overflow-hidden`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div
          className={`text-center leading-relaxed space-y-1 sm:space-y-2 md:space-y-3 ${bookFontSize} max-w-full overflow-hidden`}
          style={{
            fontFamily: isRTL ? '"David Libre", "Frank Ruhl Libre", Georgia, serif' : 'Georgia, "Times New Roman", serif',
            lineHeight: isRTL ? '1.6' : '1.5',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {textChunk.text.split('\n').map((line, idx) => (
            <p key={idx} className="text-gray-900 font-medium px-1">{line}</p>
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
    <div className="mt-4 flex flex-col items-center gap-3">
      <Link
        to={localizedHref('/signup')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm sm:text-base"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        {isRTL ? 'צור סיפור משלך!' : 'Create Your Own Story!'}
      </Link>
      <p className="text-amber-700 text-xs sm:text-sm text-center">
        {isRTL ? 'הצטרף וצור סיפורים קסומים לילדים שלך' : 'Join and create magical stories for your kids'}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0B0A16] text-white py-6 sm:py-8 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Link
            to={localizedHref('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {isRTL ? 'חזרה לדף הבית' : 'Back to Home'}
          </Link>
          {!user && (
            <Link
              to={localizedHref('/signup')}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              {isRTL ? 'הרשמה' : 'Sign Up'}
            </Link>
          )}
        </div>
      </div>

      {/* Book Reader */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:min-h-[500px] md:flex md:items-center md:justify-center">
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
                    {t('studio.plotWorld.reader.theEnd') || 'The End'}
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
                  {!user && <SignUpCTA />}
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
              <div className={`flex flex-col md:flex-row ${BOOK_CONTENT_HEIGHT}`}>
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

      {/* Footer CTA for non-logged-in users (visible on all pages) */}
      {!user && currentSpread.type !== 'end' && (
        <div className="max-w-5xl mx-auto mt-8 text-center">
          <p className="text-gray-400 mb-4">
            {isRTL ? 'אהבת את הסיפור? צור סיפורים משלך!' : 'Loved this story? Create your own!'}
          </p>
          <Link
            to={localizedHref('/signup')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            {isRTL ? 'הרשמה חינם' : 'Sign Up Free'}
          </Link>
        </div>
      )}
    </div>
  )
}
