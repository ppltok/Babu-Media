import { useState, useEffect, useCallback, useRef } from 'react'
import RunnerGame from './RunnerGame'

// ============================================
// DRAWING CANVAS GAME
// ============================================
const DrawingCanvasGame = ({ characterName, animalType, isRTL, onBack }) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#FFD700') // Yellow
  const [brushSize, setBrushSize] = useState(8)
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const lastPosRef = useRef({ x: 0, y: 0 })

  // Drawing prompts
  const prompts = [
    {
      en: `Draw ${characterName || 'your character'} eating their favorite food!`,
      he: `צייר/י את ${characterName || 'הדמות שלך'} אוכל/ת את האוכל האהוב!`,
      emoji: '🍕'
    },
    {
      en: `Draw ${characterName || 'your character'} in a magical forest!`,
      he: `צייר/י את ${characterName || 'הדמות שלך'} ביער קסום!`,
      emoji: '🌲'
    },
    {
      en: `Draw ${characterName || 'your character'}'s best friend!`,
      he: `צייר/י את החבר הכי טוב של ${characterName || 'הדמות שלך'}!`,
      emoji: '💕'
    },
    {
      en: `Draw ${characterName || 'your character'} flying in the sky!`,
      he: `צייר/י את ${characterName || 'הדמות שלך'} עף/ה בשמיים!`,
      emoji: '✈️'
    },
    {
      en: `Draw ${characterName || 'your character'}'s dream house!`,
      he: `צייר/י את בית החלומות של ${characterName || 'הדמות שלך'}!`,
      emoji: '🏠'
    },
    {
      en: `Draw ${characterName || 'your character'} as a superhero!`,
      he: `צייר/י את ${characterName || 'הדמות שלך'} כגיבור על!`,
      emoji: '🦸'
    }
  ]

  const colors = [
    '#FF6B6B', // Red
    '#FFD700', // Yellow
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96E6A1', // Green
    '#DDA0DD', // Plum
    '#FF9F43', // Orange
    '#FFFFFF', // White
  ]

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    lastPosRef.current = pos
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    lastPosRef.current = pos
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const nextPrompt = () => {
    setCurrentPrompt((prev) => (prev + 1) % prompts.length)
    clearCanvas()
  }

  const prompt = prompts[currentPrompt]

  return (
    <div className="bg-gradient-to-br from-pink-900/30 to-orange-900/30 border border-pink-500/30 rounded-2xl p-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm font-medium transition-all flex items-center gap-1"
      >
        ← {isRTL ? 'חזרה' : 'Back'}
      </button>

      {/* Header with prompt */}
      <div className="text-center mb-3">
        <span className="text-3xl mb-1 block">{prompt.emoji}</span>
        <h3 className="text-base font-bold text-pink-300">
          {isRTL ? '🎨 לוח ציור!' : '🎨 Drawing Board!'}
        </h3>
        <p className="text-xs text-white/80 mt-1">
          {isRTL ? prompt.he : prompt.en}
        </p>
      </div>

      {/* Canvas */}
      <div className="relative mb-3 rounded-xl overflow-hidden border-2 border-white/20">
        <canvas
          ref={canvasRef}
          width={350}
          height={250}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Color palette */}
      <div className="flex justify-center gap-2 mb-3">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full transition-all ${
              color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Brush size */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-xs text-gray-400">{isRTL ? 'גודל:' : 'Size:'}</span>
        <input
          type="range"
          min="2"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-24 accent-pink-500"
        />
        <div
          className="rounded-full"
          style={{
            width: brushSize,
            height: brushSize,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-all"
        >
          {isRTL ? '🗑️ נקה' : '🗑️ Clear'}
        </button>
        <button
          onClick={nextPrompt}
          className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-300 text-sm font-medium transition-all"
        >
          {isRTL ? '🎲 אתגר חדש' : '🎲 New prompt'}
        </button>
      </div>
    </div>
  )
}

// ============================================
// MEMORY MATCH GAME
// ============================================
const MemoryMatchGame = ({ isRTL, onBack }) => {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Emoji pairs for the memory game - kid-friendly animals and objects
  const emojiSets = [
    ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼'],
    ['🌟', '🌈', '🌸', '🎈', '🍎', '🍪'],
    ['🚀', '🎸', '🎨', '⚽', '🎪', '🎠'],
    ['🦋', '🐢', '🐸', '🦄', '🐘', '🦁']
  ]

  // Initialize game
  const initGame = useCallback(() => {
    const selectedSet = emojiSets[Math.floor(Math.random() * emojiSets.length)]
    const pairs = [...selectedSet, ...selectedSet]
    const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }))
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameWon(false)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  // Handle card click
  const handleCardClick = useCallback((cardId) => {
    if (isChecking) return
    if (flipped.length >= 2) return
    if (flipped.includes(cardId)) return
    if (matched.includes(cardId)) return

    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setIsChecking(true)

      const [first, second] = newFlipped
      const firstCard = cards.find(c => c.id === first)
      const secondCard = cards.find(c => c.id === second)

      if (firstCard.emoji === secondCard.emoji) {
        // Match found!
        const newMatched = [...matched, first, second]
        setMatched(newMatched)
        setFlipped([])
        setIsChecking(false)

        // Check win condition
        if (newMatched.length === cards.length) {
          setGameWon(true)
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlipped([])
          setIsChecking(false)
        }, 800)
      }
    }
  }, [cards, flipped, matched, isChecking])

  const isCardFlipped = (cardId) => flipped.includes(cardId) || matched.includes(cardId)

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border border-green-500/30 rounded-2xl p-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm font-medium transition-all flex items-center gap-1"
      >
        ← {isRTL ? 'חזרה' : 'Back'}
      </button>

      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl">🧠</span>
          <div>
            <h3 className="text-lg font-bold text-green-300">
              {isRTL ? 'משחק זיכרון!' : 'Memory Match!'}
            </h3>
            <p className="text-xs text-gray-400">
              {isRTL ? 'מצאו את הזוגות התואמים' : 'Find the matching pairs'}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-sm">
          <span className="text-yellow-400">
            {isRTL ? `מהלכים: ${moves}` : `Moves: ${moves}`}
          </span>
          <span className="text-green-400">
            {isRTL ? `נמצאו: ${matched.length / 2}/6` : `Found: ${matched.length / 2}/6`}
          </span>
        </div>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-4 gap-2 mb-4 max-w-xs mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={isCardFlipped(card.id) || isChecking}
            className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-300 transform ${
              isCardFlipped(card.id)
                ? matched.includes(card.id)
                  ? 'bg-green-500/40 border-2 border-green-400 scale-95'
                  : 'bg-white/20 border-2 border-white/40 rotate-0'
                : 'bg-gradient-to-br from-teal-600 to-green-600 border-2 border-teal-400/50 hover:scale-105 hover:border-white/50 cursor-pointer'
            }`}
            style={{
              transform: isCardFlipped(card.id) ? 'rotateY(0deg)' : 'rotateY(180deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {isCardFlipped(card.id) ? card.emoji : '❓'}
          </button>
        ))}
      </div>

      {/* Win message */}
      {gameWon && (
        <div className="bg-gradient-to-r from-yellow-500/30 to-green-500/30 border border-yellow-400/50 rounded-xl p-4 mb-4 text-center animate-pulse">
          <span className="text-3xl mb-2 block">🎉</span>
          <p className="text-yellow-300 font-bold text-lg">
            {isRTL ? 'כל הכבוד!' : 'Amazing!'}
          </p>
          <p className="text-white text-sm">
            {isRTL ? `סיימת ב-${moves} מהלכים!` : `You did it in ${moves} moves!`}
          </p>
        </div>
      )}

      {/* Play again button */}
      <div className="flex justify-center">
        <button
          onClick={initGame}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-all"
        >
          {isRTL ? '🔄 משחק חדש' : '🔄 New Game'}
        </button>
      </div>
    </div>
  )
}

// ============================================
// RUNNER GAME WRAPPER WITH BACK BUTTON
// ============================================
const RunnerGameWrapper = ({ characterImage, characterName, isRTL, onBack }) => {
  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm font-medium transition-all flex items-center gap-1"
      >
        ← {isRTL ? 'חזרה' : 'Back'}
      </button>
      <RunnerGame
        characterImage={characterImage}
        characterName={characterName}
        isRTL={isRTL}
      />
    </div>
  )
}

// ============================================
// GAME SELECTOR SCREEN
// ============================================
const GameSelector = ({ onSelectGame, isRTL }) => {
  const games = [
    {
      id: 'runner',
      emoji: '🎮',
      name: { en: 'Jump & Run', he: 'קפוץ ורוץ' },
      desc: { en: 'Jump over obstacles!', he: 'קפוץ מעל מכשולים!' },
      gradient: 'from-purple-500 to-indigo-500',
      border: 'border-purple-500/30'
    },
    {
      id: 'memory',
      emoji: '🧠',
      name: { en: 'Memory Match', he: 'משחק זיכרון' },
      desc: { en: 'Find matching pairs!', he: 'מצאו זוגות תואמים!' },
      gradient: 'from-green-500 to-teal-500',
      border: 'border-green-500/30'
    },
    {
      id: 'drawing',
      emoji: '🎨',
      name: { en: 'Drawing Board', he: 'לוח ציור' },
      desc: { en: 'Draw & create!', he: 'צייר ויצור!' },
      gradient: 'from-pink-500 to-orange-500',
      border: 'border-pink-500/30'
    }
  ]

  return (
    <div className="text-center">
      <div className="mb-4">
        <span className="text-4xl mb-2 block">🎪</span>
        <h3 className="text-xl font-bold text-white mb-1">
          {isRTL ? 'בחר משחק!' : 'Choose a Game!'}
        </h3>
        <p className="text-sm text-gray-400">
          {isRTL ? 'בזמן שהסיפור שלך נוצר...' : 'While your story is being created...'}
        </p>
      </div>

      <div className="space-y-3">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className={`w-full p-4 bg-gradient-to-r ${game.gradient} bg-opacity-20 border ${game.border} rounded-xl hover:scale-[1.02] transition-all flex items-center gap-4`}
          >
            <span className="text-4xl">{game.emoji}</span>
            <div className="text-left">
              <div className="font-bold text-white text-lg">
                {isRTL ? game.name.he : game.name.en}
              </div>
              <div className="text-sm text-white/70">
                {isRTL ? game.desc.he : game.desc.en}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// MAIN WAITING GAMES COMPONENT
// ============================================
export default function WaitingGames({ characterName, characterImage, animalType, theme, isRTL = false }) {
  const [activeGame, setActiveGame] = useState(null) // null = selector, 'runner', 'memory', 'drawing'

  const handleBack = useCallback(() => {
    setActiveGame(null)
  }, [])

  return (
    <div className="w-full max-w-md mx-auto">
      {activeGame === null ? (
        <GameSelector onSelectGame={setActiveGame} isRTL={isRTL} />
      ) : activeGame === 'runner' ? (
        <RunnerGameWrapper
          characterImage={characterImage}
          characterName={characterName}
          isRTL={isRTL}
          onBack={handleBack}
        />
      ) : activeGame === 'memory' ? (
        <MemoryMatchGame
          isRTL={isRTL}
          onBack={handleBack}
        />
      ) : activeGame === 'drawing' ? (
        <DrawingCanvasGame
          characterName={characterName}
          animalType={animalType}
          isRTL={isRTL}
          onBack={handleBack}
        />
      ) : null}
    </div>
  )
}
