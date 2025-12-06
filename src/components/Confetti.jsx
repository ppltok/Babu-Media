import { useEffect, useState, useMemo } from 'react'

// Simple confetti component that creates falling confetti pieces
export default function Confetti({ active = false, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(false)

  // Generate pieces once when active becomes true
  const pieces = useMemo(() => {
    if (!active) return []

    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA', '#FFD93D', '#6BCB77']

    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 6,
      delay: Math.random() * 0.8,
      fallDuration: Math.random() * 2 + 2.5,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 150,
      wobble: Math.random() * 30
    }))
  }, [active])

  useEffect(() => {
    if (active) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [active, duration])

  if (!isVisible || pieces.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0);
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(var(--rotation)) translateX(var(--drift));
            opacity: 0;
          }
        }
        @keyframes confetti-wobble {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(var(--wobble)); }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
        {pieces.map((piece) => (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              left: `${piece.x}%`,
              top: 0,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `confetti-fall ${piece.fallDuration}s ease-out ${piece.delay}s forwards`,
              '--drift': `${piece.drift}px`,
              '--rotation': `${piece.rotation + 720}deg`,
              '--wobble': `${piece.wobble}px`,
              boxShadow: `0 0 3px ${piece.color}`
            }}
          />
        ))}
      </div>
    </>
  )
}
