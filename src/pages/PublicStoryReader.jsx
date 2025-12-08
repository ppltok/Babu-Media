import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ActionCard component for interactive bonding cues - bold italic on own row
// Supports both English and Hebrew action detection
const ActionCard = ({ instruction, isHebrew = false }) => {
  const getActionStyle = (text) => {
    const lower = text.toLowerCase()
    // English keywords
    if (lower.includes('sound') || lower.includes('roar') || lower.includes('noise') || lower.includes('shout') || lower.includes('call'))
      return { emoji: '🔊', color: 'text-blue-600' }
    if (lower.includes('whisper') || lower.includes('quiet') || lower.includes('softly') || lower.includes('gentle') || lower.includes('shhh'))
      return { emoji: '🤫', color: 'text-purple-600' }
    if (lower.includes('hug') || lower.includes('squeeze') || lower.includes('cuddle') || lower.includes('snuggle'))
      return { emoji: '🤗', color: 'text-pink-600' }
    if (lower.includes('ask') || lower.includes('what') || lower.includes('?') || lower.includes('think') || lower.includes('where'))
      return { emoji: '❓', color: 'text-amber-600' }
    if (lower.includes('wiggle') || lower.includes('dance') || lower.includes('move') || lower.includes('jump') || lower.includes('clap'))
      return { emoji: '💃', color: 'text-green-600' }
    if (lower.includes('count') || lower.includes('point') || lower.includes('find') || lower.includes('look'))
      return { emoji: '👆', color: 'text-cyan-600' }
    if (lower.includes('sing') || lower.includes('hum') || lower.includes('melody'))
      return { emoji: '🎵', color: 'text-indigo-600' }
    if (lower.includes('yawn') || lower.includes('tired') || lower.includes('sleepy'))
      return { emoji: '😴', color: 'text-indigo-600' }
    // Hebrew keywords
    if (text.includes('צליל') || text.includes('שאגה') || text.includes('קול'))
      return { emoji: '🔊', color: 'text-blue-600' }
    if (text.includes('לחש') || text.includes('שקט') || text.includes('ששש'))
      return { emoji: '🤫', color: 'text-purple-600' }
    if (text.includes('חיבוק') || text.includes('לחבק'))
      return { emoji: '🤗', color: 'text-pink-600' }
    if (text.includes('איפה') || text.includes('מה') || text.includes('?'))
      return { emoji: '❓', color: 'text-amber-600' }
    if (text.includes('רקוד') || text.includes('קפוץ') || text.includes('מחיאות'))
      return { emoji: '💃', color: 'text-green-600' }
    if (text.includes('פיהוק') || text.includes('עייף') || text.includes('ישנ'))
      return { emoji: '😴', color: 'text-indigo-600' }
    return { emoji: '✨', color: 'text-purple-600' }
  }

  const style = getActionStyle(instruction)

  return (
    <div className="block my-3 text-center">
      <span className={`${style.color} font-bold italic text-base sm:text-lg`}>
        {style.emoji} [{instruction}] {style.emoji}
      </span>
    </div>
  )
}

// Parse and render story text with ACTION tags
const renderStoryText = (text, isHebrew = false) => {
  if (!text) return null

  // Split text by [ACTION: ...] patterns
  const parts = text.split(/\[ACTION:\s*([^\]]+)\]/gi)

  return parts.map((part, index) => {
    // Odd indices are the ACTION content (captured group)
    if (index % 2 === 1) {
      return <ActionCard key={index} instruction={part.trim()} isHebrew={isHebrew} />
    }
    // Even indices are regular text - skip empty parts
    if (!part.trim()) return null
    return <span key={index}>{part}</span>
  })
}

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
  const [fontSizeLevel, setFontSizeLevel] = useState(2) // 0=smallest, 1=small, 2=medium, 3=large, 4=largest

  // Gradient templates for book headlines - each story gets a consistent gradient based on its ID
  const HEADLINE_GRADIENTS = [
    'from-pink-400 via-purple-400 to-blue-400',
    'from-amber-400 via-orange-500 to-red-400',
    'from-emerald-400 via-teal-400 to-cyan-400',
    'from-violet-400 via-fuchsia-400 to-pink-400',
    'from-blue-400 via-indigo-400 to-purple-400',
    'from-rose-400 via-pink-400 to-orange-400',
    'from-cyan-400 via-sky-400 to-blue-400',
    'from-lime-400 via-green-400 to-emerald-400',
  ]

  // Get a consistent gradient for a story based on its ID
  const getStoryGradient = (storyId) => {
    if (!storyId) return HEADLINE_GRADIENTS[0]
    const sum = storyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return HEADLINE_GRADIENTS[sum % HEADLINE_GRADIENTS.length]
  }

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

  // Story language determines text direction - use story's language, not UI language
  // This ensures Hebrew books always read right-to-left, English books left-to-right
  // "Like holding a real book - it does not change"
  const storyIsRTL = story.language === 'he'

  // Character limit per chunk - based on story language
  const maxCharsPerChunk = storyIsRTL ? 140 : 200

  // Helper to split text into sentences while keeping ACTION tags intact
  const splitIntoSentences = (text) => {
    // First, temporarily replace ACTION tags with unique placeholders
    const actionTags = []
    let processedText = text.replace(/\[ACTION:\s*[^\]]+\]/gi, (match) => {
      const placeholder = `<<<ACTION_${actionTags.length}>>>`
      actionTags.push(match)
      return placeholder
    })

    // Split by sentences (match sentences ending with .!? and any trailing space)
    const sentenceMatches = processedText.match(/[^.!?]*[.!?]+\s*/g) || []

    // Check if there's remaining text after the last sentence
    const matchedLength = sentenceMatches.join('').length
    if (matchedLength < processedText.length) {
      const remaining = processedText.slice(matchedLength)
      if (remaining.trim()) {
        sentenceMatches.push(remaining)
      }
    }

    // If no sentences found, return the whole text
    if (sentenceMatches.length === 0) {
      sentenceMatches.push(processedText)
    }

    // Restore ACTION tags in each sentence
    return sentenceMatches.map(sentence => {
      return sentence.replace(/<<<ACTION_(\d+)>>>/g, (_, idx) => actionTags[parseInt(idx)] || '')
    })
  }

  // Helper to check if text has incomplete quotes
  const hasIncompleteQuote = (text) => {
    const quotes = text.match(/"/g) || []
    return quotes.length % 2 !== 0 // Odd number of quotes means incomplete
  }

  const textChunks = []
  let currentChunk = ''

  // Process each page, extracting text from objects
  storyPages.forEach((page) => {
    const pageText = typeof page === 'string' ? page : (page?.text || '')
    if (!pageText) return

    // Split by sentences while keeping ACTION tags intact
    const sentences = splitIntoSentences(pageText)

    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) return

      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + trimmedSentence
      // Don't split if it would break an ACTION tag or quote
      const hasIncompleteAction = potentialChunk.includes('[ACTION:') && !potentialChunk.match(/\[ACTION:[^\]]+\]/gi)
      const wouldBreakQuote = hasIncompleteQuote(currentChunk) && currentChunk.length > 0

      if (potentialChunk.length <= maxCharsPerChunk || hasIncompleteAction || wouldBreakQuote) {
        currentChunk = potentialChunk
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
  const isToddlerBook = story.age_mode === 'toddler'

  // TODDLER MODE: Simpler structure - each image with its text, then The End
  if (isToddlerBook && numImages >= 4) {
    // Toddler books: Show all 4 images spread throughout the book
    // Image 1: Pages 1-2, Image 2: Pages 3-4, Image 3: Pages 5-6, Image 4: The End (Pages 7-8)
    for (let imgIdx = 0; imgIdx < numImages - 1; imgIdx++) {
      // Each image gets 2 text chunks (representing 2 pages each)
      const chunk1 = textChunks[textIndex] || null
      const chunk2 = textChunks[textIndex + 1] || null

      if (chunk1) {
        spreads.push({
          type: 'image-text',
          imageIndex: imgIdx,
          textChunk: chunk1
        })
        textIndex++
      }

      if (chunk2) {
        spreads.push({
          type: 'image-text',
          imageIndex: imgIdx,
          textChunk: chunk2
        })
        textIndex++
      }
    }

    // Add any remaining text
    while (textIndex < textChunks.length) {
      spreads.push({
        type: 'text-only',
        textChunk: textChunks[textIndex],
        textChunk2: textChunks[textIndex + 1] || null
      })
      textIndex += 2
    }

    // Add "The End" with the 4th image
    spreads.push({
      type: 'end',
      imageIndex: numImages - 1
    })
  } else {
    // REGULAR MODE: Build spreads - use first 3 images for content, image 4 reserved for The End
    for (let imgIdx = 0; imgIdx < Math.min(numImages - 1, 3); imgIdx++) {
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
  }

  const totalSpreads = spreads.length
  const currentSpread = spreads[currentPage] || spreads[0]

  // Book uses 16:9 vertical (portrait) on mobile for more text space
  // On mobile: aspect-[9/16] gives tall portrait view
  // On tablet/desktop: fixed height for side-by-side layout
  const BOOK_CONTENT_HEIGHT = 'aspect-[9/16] sm:aspect-auto sm:h-[420px] md:h-[420px]'

  // Font size levels - user can adjust with +/- buttons
  // Use storyIsRTL for font sizing since Hebrew text needs slightly larger sizes
  const FONT_SIZE_CLASSES = [
    storyIsRTL ? 'text-xs sm:text-sm md:text-base' : 'text-xs sm:text-xs md:text-sm',      // 0 - smallest
    storyIsRTL ? 'text-sm sm:text-base md:text-lg' : 'text-sm sm:text-sm md:text-base',    // 1 - small
    storyIsRTL ? 'text-base sm:text-lg md:text-xl' : 'text-sm sm:text-base md:text-lg',    // 2 - medium (default)
    storyIsRTL ? 'text-lg sm:text-xl md:text-2xl' : 'text-base sm:text-lg md:text-xl',     // 3 - large
    storyIsRTL ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl',     // 4 - largest
  ]
  const bookFontSize = FONT_SIZE_CLASSES[fontSizeLevel] || FONT_SIZE_CLASSES[2]

  // Font size controls component
  const FontSizeControls = () => (
    <div className="flex items-center gap-1 bg-amber-100/80 rounded-full px-2 py-1 shadow-md border border-amber-300/50">
      <button
        onClick={() => setFontSizeLevel(prev => Math.max(0, prev - 1))}
        disabled={fontSizeLevel === 0}
        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${
          fontSizeLevel === 0
            ? 'text-amber-300 cursor-not-allowed'
            : 'text-amber-700 hover:bg-amber-200 active:scale-95'
        }`}
        title={isRTL ? 'הקטן טקסט' : 'Decrease text size'}
      >
        <span className="text-lg font-bold">A-</span>
      </button>
      <span className="text-amber-600 text-xs font-medium px-1">{fontSizeLevel + 1}/5</span>
      <button
        onClick={() => setFontSizeLevel(prev => Math.min(4, prev + 1))}
        disabled={fontSizeLevel === 4}
        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all ${
          fontSizeLevel === 4
            ? 'text-amber-300 cursor-not-allowed'
            : 'text-amber-700 hover:bg-amber-200 active:scale-95'
        }`}
        title={isRTL ? 'הגדל טקסט' : 'Increase text size'}
      >
        <span className="text-lg font-bold">A+</span>
      </button>
    </div>
  )

  // Image component - landscape on mobile, square on desktop
  const ImageSection = ({ imgIndex }) => (
    <div className="w-full md:w-1/2 bg-gradient-to-br from-amber-100 to-orange-100 p-3 sm:p-4 md:p-6 flex items-center justify-center flex-shrink-0">
      <div className="relative w-full max-w-[280px] sm:max-w-[220px] md:max-w-[280px] aspect-[4/3] md:aspect-square rounded-xl overflow-hidden shadow-lg border-4 border-amber-200/50">
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
        <div className={`${isHalfWidth ? 'w-full md:w-1/2' : 'w-full h-full'} bg-gradient-to-br from-amber-50 to-orange-50 p-2 sm:p-4 md:p-8 flex items-center justify-center overflow-hidden`}>
          <div className="text-amber-300 text-4xl">~</div>
        </div>
      )
    }

    return (
      <div
        className={`${isHalfWidth ? 'w-full md:w-1/2' : 'w-full h-full'} bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5 md:p-8 flex flex-col justify-center`}
        dir={storyIsRTL ? 'rtl' : 'ltr'}
      >
        <div
          className={`text-center leading-relaxed space-y-2 sm:space-y-2 md:space-y-3 ${bookFontSize} max-w-full`}
          style={{
            fontFamily: storyIsRTL ? '"David Libre", "Frank Ruhl Libre", Georgia, serif' : 'Georgia, "Times New Roman", serif',
            lineHeight: storyIsRTL ? '1.6' : '1.5',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {textChunk.text.split('\n').map((line, idx) => (
            <p key={idx} className="text-gray-900 font-medium px-2">{renderStoryText(line, storyIsRTL)}</p>
          ))}
        </div>
      </div>
    )
  }

  // Instagram-style story progress bars
  const NavigationDots = () => (
    <div className="flex justify-center gap-1 w-full max-w-[280px] sm:max-w-[320px] mx-auto px-2">
      {Array.from({ length: totalSpreads }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => setCurrentPage(idx)}
          className="flex-1 h-1 sm:h-1.5 rounded-full overflow-hidden bg-purple-200/50 transition-all hover:bg-purple-300/50"
          title={`${idx + 1}/${totalSpreads}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              idx < currentPage
                ? 'w-full bg-purple-500'
                : idx === currentPage
                  ? 'w-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse'
                  : 'w-0 bg-purple-400'
            }`}
          />
        </button>
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

          {/* Font size controls - top right */}
          <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20">
            <FontSizeControls />
          </div>

          {/* Inner book pages */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden shadow-inner flex flex-col">
            {/* Story Title - gradient varies per story */}
            <div className={`bg-gradient-to-r ${getStoryGradient(story?.id)} py-2 sm:py-3 px-4 sm:px-6 flex-shrink-0`}>
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
                    className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${getStoryGradient(story?.id)} bg-clip-text text-transparent mb-2`}
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
              <div className={`flex flex-col md:flex-row ${BOOK_CONTENT_HEIGHT} overflow-hidden`}>
                <ImageSection imgIndex={currentSpread.imageIndex} />
                <div className="hidden md:block w-0.5 bg-amber-200" />
                <div className="w-full md:w-1/2 flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 min-h-0 flex-1 overflow-hidden">
                  <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
                    <TextPage textChunk={currentSpread.textChunk} isHalfWidth={false} />
                  </div>
                  <div className="py-2 sm:py-3 border-t border-amber-200/50 flex-shrink-0">
                    <NavigationDots />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col ${BOOK_CONTENT_HEIGHT}`}>
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center">
                  <TextPage textChunk={currentSpread.textChunk} />
                  <div className="hidden md:block w-0.5 bg-amber-200" />
                  <TextPage textChunk={currentSpread.textChunk2} />
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-2 sm:py-3 border-t border-amber-200/50">
                  <NavigationDots />
                </div>
              </div>
            )}
          </div>

          {/* Navigation arrows - direction based on STORY language (like a real book) */}
          {/* Hebrew books: next page is on LEFT, previous on RIGHT */}
          {/* English books: next page is on RIGHT, previous on LEFT */}
          {/* Arrow icons always point in their natural direction - only positions swap */}
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={`absolute top-1/2 -translate-y-1/2 ${storyIsRTL ? 'right-0 -mr-3 sm:-mr-5' : 'left-0 -ml-3 sm:-ml-5'} w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/80 hover:bg-amber-500 rounded-full flex items-center justify-center shadow-lg transition-all ${currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            {/* Previous arrow - points left for English (on left side), points right for Hebrew (on right side) */}
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d={storyIsRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>

          <button
            onClick={() => setCurrentPage(Math.min(totalSpreads - 1, currentPage + 1))}
            disabled={currentPage === totalSpreads - 1}
            className={`absolute top-1/2 -translate-y-1/2 ${storyIsRTL ? 'left-0 -ml-3 sm:-ml-5' : 'right-0 -mr-3 sm:-mr-5'} w-10 h-10 sm:w-12 sm:h-12 bg-amber-600/80 hover:bg-amber-500 rounded-full flex items-center justify-center shadow-lg transition-all ${currentPage === totalSpreads - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}`}
          >
            {/* Next arrow - points right for English (on right side), points left for Hebrew (on left side) */}
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d={storyIsRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
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
