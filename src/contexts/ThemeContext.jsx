import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('babu-theme')
      return saved || 'dark'
    }
    return 'dark'
  })

  // Sync with localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('babu-theme', theme)

    // Apply theme class to document root for global styling
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    } else {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'
  const isLight = theme === 'light'

  // Theme-aware color classes
  const themeColors = {
    // Backgrounds
    bgPrimary: isDark ? 'bg-[#0B0A16]' : 'bg-gray-50',
    bgSecondary: isDark ? 'bg-slate-900' : 'bg-white',
    bgCard: isDark ? 'bg-white/5' : 'bg-white',
    bgCardHover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50',

    // Text
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-500' : 'text-gray-400',

    // Borders
    border: isDark ? 'border-white/10' : 'border-gray-200',
    borderAccent: isDark ? 'border-white/20' : 'border-gray-300',

    // Inputs
    inputBg: isDark ? 'bg-white/5' : 'bg-white',
    inputBorder: isDark ? 'border-white/10' : 'border-gray-300',
    inputText: isDark ? 'text-white' : 'text-gray-900',
    inputPlaceholder: isDark ? 'placeholder-gray-500' : 'placeholder-gray-400',
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isDark,
      isLight,
      themeColors
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
