import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Import all translation files
import enCommon from '../locales/en/common.json'
import enHomepage from '../locales/en/homepage.json'
import enAuth from '../locales/en/auth.json'
import enSettings from '../locales/en/settings.json'
import enDashboard from '../locales/en/dashboard.json'
import enCharacters from '../locales/en/characters.json'
import enStories from '../locales/en/stories.json'
import enStudio from '../locales/en/studio.json'

import heCommon from '../locales/he/common.json'
import heHomepage from '../locales/he/homepage.json'
import heAuth from '../locales/he/auth.json'
import heSettings from '../locales/he/settings.json'
import heDashboard from '../locales/he/dashboard.json'
import heCharacters from '../locales/he/characters.json'
import heStories from '../locales/he/stories.json'
import heStudio from '../locales/he/studio.json'

const LanguageContext = createContext({})

export const useLanguage = () => useContext(LanguageContext)

// Merge all translations into single objects per language
const translations = {
  en: {
    common: enCommon,
    homepage: enHomepage,
    auth: enAuth,
    settings: enSettings,
    dashboard: enDashboard,
    characters: enCharacters,
    stories: enStories,
    studio: enStudio,
  },
  he: {
    common: heCommon,
    homepage: heHomepage,
    auth: heAuth,
    settings: heSettings,
    dashboard: heDashboard,
    characters: heCharacters,
    stories: heStories,
    studio: heStudio,
  }
}

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'he']
export const DEFAULT_LOCALE = 'en'

// Helper to get nested value from object using dot notation
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

// Helper to extract locale from URL path
export const getLocaleFromPath = (pathname) => {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (SUPPORTED_LOCALES.includes(firstSegment) && firstSegment !== DEFAULT_LOCALE) {
    return firstSegment
  }
  return DEFAULT_LOCALE
}

// Helper to build localized path
export const buildLocalizedPath = (path, locale) => {
  // Remove any existing locale prefix
  let cleanPath = path
  for (const loc of SUPPORTED_LOCALES) {
    if (path.startsWith(`/${loc}/`) || path === `/${loc}`) {
      cleanPath = path.slice(loc.length + 1) || '/'
      break
    }
  }

  // Add locale prefix only for non-default locales
  if (locale === DEFAULT_LOCALE) {
    return cleanPath || '/'
  }

  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}

// Helper to remove locale from path
export const removeLocaleFromPath = (pathname) => {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1)
    }
    if (pathname === `/${locale}`) {
      return '/'
    }
  }
  return pathname
}

export function LanguageProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine initial language from URL or localStorage
  const [language, setLanguageState] = useState(() => {
    // First check URL
    const urlLocale = getLocaleFromPath(window.location.pathname)
    if (urlLocale !== DEFAULT_LOCALE) {
      return urlLocale
    }

    // Then check localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('babu-language')
      if (saved && SUPPORTED_LOCALES.includes(saved)) {
        return saved
      }
    }

    return DEFAULT_LOCALE
  })

  const isRTL = language === 'he'

  // Update document attributes when language changes
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    localStorage.setItem('babu-language', language)
  }, [language, isRTL])

  // Sync language with URL on location change
  useEffect(() => {
    const urlLocale = getLocaleFromPath(location.pathname)
    if (urlLocale !== language) {
      setLanguageState(urlLocale)
    }
  }, [location.pathname])

  // Function to change language (navigates to new locale URL)
  const setLanguage = useCallback((newLocale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return
    if (newLocale === language) return

    // Save to localStorage
    localStorage.setItem('babu-language', newLocale)

    // Navigate to new localized path
    const currentPath = removeLocaleFromPath(location.pathname)
    const newPath = buildLocalizedPath(currentPath, newLocale)

    setLanguageState(newLocale)
    navigate(newPath, { replace: true })
  }, [language, location.pathname, navigate])

  // Translation function with namespace support
  // Usage: t('namespace.key.subkey') or t('common.buttons.save')
  const t = useCallback((key, params = {}) => {
    // Split key into namespace and path
    const [namespace, ...pathParts] = key.split('.')
    const path = pathParts.join('.')

    // Get translation from current language
    let translation = getNestedValue(translations[language]?.[namespace], path)

    // Fallback to English if not found
    if (translation === undefined) {
      translation = getNestedValue(translations[DEFAULT_LOCALE]?.[namespace], path)
    }

    // Fallback to key if still not found
    if (translation === undefined) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }

    // Replace parameters like {name} with actual values
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{(\w+)\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? params[paramName] : match
      })
    }

    return translation
  }, [language])

  // Helper to get all translations for a namespace (useful for lists)
  const getTranslations = useCallback((namespace) => {
    return translations[language]?.[namespace] || translations[DEFAULT_LOCALE]?.[namespace] || {}
  }, [language])

  // Helper for localized navigation
  const localizedNavigate = useCallback((path, options) => {
    const localizedPath = buildLocalizedPath(path, language)
    navigate(localizedPath, options)
  }, [language, navigate])

  // Helper to build a localized href
  const localizedHref = useCallback((path) => {
    return buildLocalizedPath(path, language)
  }, [language])

  const value = {
    language,
    setLanguage,
    isRTL,
    t,
    getTranslations,
    localizedNavigate,
    localizedHref,
    buildLocalizedPath: (path) => buildLocalizedPath(path, language),
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
