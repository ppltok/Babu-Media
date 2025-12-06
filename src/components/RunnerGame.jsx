import { useState, useEffect, useRef, useCallback } from 'react'

// Simple endless runner game for kids while waiting for story generation
export default function RunnerGame({ characterImage, characterName, isRTL = false }) {
  const [gameState, setGameState] = useState('idle') // 'idle', 'playing', 'gameover'
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  // Use refs for game state that changes rapidly
  const characterYRef = useRef(0)
  const velocityRef = useRef(0)
  const obstaclesRef = useRef([])
  const starsRef = useRef([])
  const frameRef = useRef(null)
  const lastTimeRef = useRef(0)
  const scoreRef = useRef(0)

  // Force re-render for visual updates
  const [, forceUpdate] = useState(0)

  const GROUND_Y = 0
  const JUMP_VELOCITY = 12
  const GRAVITY = 0.6
  const GAME_SPEED = 4
  const CHARACTER_LEFT = 60
  const CHARACTER_SIZE = 50
  const OBSTACLE_WIDTH = 30
  const GAME_WIDTH = 380

  // Reset game state
  const resetGame = useCallback(() => {
    characterYRef.current = GROUND_Y
    velocityRef.current = 0
    obstaclesRef.current = []
    starsRef.current = []
    scoreRef.current = 0
    setScore(0)
    lastTimeRef.current = 0
  }, [])

  // Jump function
  const jump = useCallback(() => {
    if (characterYRef.current <= 5) { // Only jump if on or near ground
      velocityRef.current = JUMP_VELOCITY
    }
  }, [])

  // Start game
  const startGame = useCallback(() => {
    resetGame()
    setGameState('playing')
  }, [resetGame])

  // Handle tap/click
  const handleTap = useCallback(() => {
    if (gameState === 'idle' || gameState === 'gameover') {
      startGame()
    } else if (gameState === 'playing') {
      jump()
    }
  }, [gameState, startGame, jump])

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTap])

  // Main game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      return
    }

    let obstacleTimer = 0
    let starTimer = 0

    const gameLoop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = Math.min(timestamp - lastTimeRef.current, 50) // Cap delta
      lastTimeRef.current = timestamp

      // Update character physics
      velocityRef.current -= GRAVITY
      characterYRef.current += velocityRef.current

      // Ground collision
      if (characterYRef.current < GROUND_Y) {
        characterYRef.current = GROUND_Y
        velocityRef.current = 0
      }

      // Spawn obstacles
      obstacleTimer += deltaTime
      if (obstacleTimer > 1800) {
        obstacleTimer = 0
        const heights = [35, 45, 55]
        obstaclesRef.current.push({
          id: Date.now(),
          x: GAME_WIDTH,
          height: heights[Math.floor(Math.random() * heights.length)],
          passed: false
        })
      }

      // Spawn stars
      starTimer += deltaTime
      if (starTimer > 2500) {
        starTimer = 0
        starsRef.current.push({
          id: Date.now() + 1,
          x: GAME_WIDTH,
          y: 50 + Math.random() * 60
        })
      }

      // Move obstacles and check collision
      const charLeft = CHARACTER_LEFT
      const charRight = CHARACTER_LEFT + CHARACTER_SIZE - 10
      const charBottom = characterYRef.current
      const charTop = characterYRef.current + CHARACTER_SIZE - 10

      let hitObstacle = false

      obstaclesRef.current = obstaclesRef.current
        .map(obs => ({ ...obs, x: obs.x - GAME_SPEED }))
        .filter(obs => {
          // Check collision
          const obsLeft = obs.x + 5
          const obsRight = obs.x + OBSTACLE_WIDTH - 5
          const obsTop = obs.height

          if (
            charRight > obsLeft &&
            charLeft < obsRight &&
            charBottom < obsTop
          ) {
            hitObstacle = true
          }

          // Score for passing obstacle
          if (!obs.passed && obs.x + OBSTACLE_WIDTH < charLeft) {
            obs.passed = true
            scoreRef.current += 5
          }

          return obs.x > -OBSTACLE_WIDTH
        })

      // Move stars and check collection
      starsRef.current = starsRef.current
        .map(star => ({ ...star, x: star.x - GAME_SPEED }))
        .filter(star => {
          const starLeft = star.x
          const starRight = star.x + 25
          const starBottom = star.y
          const starTop = star.y + 25

          // Check collection
          if (
            charRight > starLeft &&
            charLeft < starRight &&
            charTop > starBottom &&
            charBottom < starTop
          ) {
            scoreRef.current += 10
            return false // Remove star
          }

          return star.x > -30
        })

      // Update score display
      setScore(scoreRef.current)

      // Check game over
      if (hitObstacle) {
        setGameState('gameover')
        setHighScore(prev => Math.max(prev, scoreRef.current))
        return
      }

      // Force re-render for smooth animation
      forceUpdate(n => n + 1)

      // Continue loop
      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [gameState])

  const characterY = characterYRef.current
  const obstacles = obstaclesRef.current
  const stars = starsRef.current
  const isJumping = characterY > 5

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Game title */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-purple-300">
          {isRTL ? '🎮 קפוץ והתחמק!' : '🎮 Jump & Dodge!'}
        </h3>
        <p className="text-xs text-gray-400">
          {isRTL ? 'לחץ או הקש כדי לקפוץ' : 'Tap or press Space to jump'}
        </p>
      </div>

      {/* Score display */}
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="text-sm font-bold text-yellow-400">
          ⭐ {score}
        </div>
        <div className="text-xs text-gray-500">
          {isRTL ? 'שיא:' : 'Best:'} {highScore}
        </div>
      </div>

      {/* Game area */}
      <div
        className="relative bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 rounded-xl overflow-hidden cursor-pointer select-none touch-none"
        style={{ height: '200px', width: '100%', maxWidth: '400px', margin: '0 auto' }}
        onClick={handleTap}
        onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
      >
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 50}%`,
              }}
            />
          ))}
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-green-800 to-green-600">
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-400/50" />
        </div>

        {/* Character */}
        <div
          className="absolute"
          style={{
            left: `${CHARACTER_LEFT}px`,
            bottom: `${40 + characterY}px`,
            width: `${CHARACTER_SIZE}px`,
            height: `${CHARACTER_SIZE}px`,
            transform: isJumping ? 'rotate(-15deg) scale(1.05)' : 'rotate(0deg) scale(1)',
            transition: 'transform 0.1s ease-out'
          }}
        >
          {characterImage ? (
            <img
              src={characterImage}
              alt={characterName || 'Character'}
              className="w-full h-full object-cover rounded-full border-3 border-yellow-400 shadow-lg shadow-yellow-400/30"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl border-3 border-yellow-400 shadow-lg">
              🦊
            </div>
          )}
          {/* Jump trail effect */}
          {isJumping && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-yellow-400/30 rounded-full blur-sm" />
          )}
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            className="absolute"
            style={{
              left: `${obs.x}px`,
              bottom: '40px',
              width: `${OBSTACLE_WIDTH}px`,
              height: `${obs.height}px`
            }}
          >
            {/* Cactus-like obstacle */}
            <div className="w-full h-full bg-gradient-to-t from-red-700 to-red-500 rounded-t-lg relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500" />
              <div className="absolute top-1/3 -left-2 w-2 h-3 bg-red-600 rounded-l-full" />
              <div className="absolute top-1/2 -right-2 w-2 h-3 bg-red-600 rounded-r-full" />
            </div>
          </div>
        ))}

        {/* Collectible stars */}
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute text-xl"
            style={{
              left: `${star.x}px`,
              bottom: `${40 + star.y}px`,
              animation: 'pulse 0.5s ease-in-out infinite'
            }}
          >
            ⭐
          </div>
        ))}

        {/* Start screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-5xl mb-3 animate-bounce">🎮</div>
              <p className="text-white font-bold text-xl mb-1">
                {isRTL ? 'לחץ להתחלה!' : 'Tap to Start!'}
              </p>
              <p className="text-gray-300 text-sm">
                {isRTL ? 'קפוץ מעל המכשולים' : 'Jump over obstacles'}
              </p>
            </div>
          </div>
        )}

        {/* Game over screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-4xl mb-2">🌟</div>
              <p className="text-yellow-400 font-bold text-xl mb-1">
                {isRTL ? 'כל הכבוד!' : 'Great Job!'}
              </p>
              <p className="text-white text-lg mb-1">
                {isRTL ? `ניקוד: ${score}` : `Score: ${score}`}
              </p>
              {score >= highScore && score > 0 && (
                <p className="text-green-400 text-sm mb-2">
                  {isRTL ? '🏆 שיא חדש!' : '🏆 New High Score!'}
                </p>
              )}
              <p className="text-gray-300 text-sm animate-pulse mt-2">
                {isRTL ? 'לחץ לשחק שוב' : 'Tap to play again'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-gray-500 mt-2">
        {isRTL ? '🌟 אסוף כוכבים וקפוץ מעל מכשולים!' : '🌟 Collect stars and jump over obstacles!'}
      </p>
    </div>
  )
}
