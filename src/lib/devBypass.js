import { supabase } from './supabase'

// Dev/test emails that automatically get bypass enabled
const DEV_EMAILS = [
  'Tom@ppltok.com',
  'tom@ppltok.com', // lowercase version just in case
]

// Check if current user should have dev bypass
export const checkDevBypass = async (userId, userEmail) => {
  // Check if email is in dev list
  if (DEV_EMAILS.includes(userEmail)) {
    await enableDevBypass(userId, 'Dev email list')
    return true
  }

  // Check localStorage for dev mode (client-side only)
  if (typeof window !== 'undefined') {
    const devMode = localStorage.getItem('babu_dev_mode')
    if (devMode === 'enabled') {
      await enableDevBypass(userId, 'Local dev mode')
      return true
    }
  }

  return false
}

// Enable dev bypass for a user
export const enableDevBypass = async (userId, reason = 'Manual override') => {
  const { error } = await supabase
    .from('dev_bypass')
    .upsert({
      user_id: userId,
      bypass_enabled: true,
      bypass_reason: reason,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error enabling dev bypass:', error)
    return false
  }

  console.log('Dev bypass enabled for user:', userId)
  return true
}

// Disable dev bypass for a user
export const disableDevBypass = async (userId) => {
  const { error } = await supabase
    .from('dev_bypass')
    .upsert({
      user_id: userId,
      bypass_enabled: false,
      bypass_reason: null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Error disabling dev bypass:', error)
    return false
  }

  console.log('Dev bypass disabled for user:', userId)
  return true
}

// Toggle dev mode in localStorage (for testing in browser console)
// Usage in browser console: window.toggleDevMode()
if (typeof window !== 'undefined') {
  window.toggleDevMode = () => {
    const current = localStorage.getItem('babu_dev_mode')
    if (current === 'enabled') {
      localStorage.removeItem('babu_dev_mode')
      console.log('Dev mode DISABLED - refresh the page')
      return false
    } else {
      localStorage.setItem('babu_dev_mode', 'enabled')
      console.log('Dev mode ENABLED - refresh the page')
      return true
    }
  }

  window.enableDevMode = () => {
    localStorage.setItem('babu_dev_mode', 'enabled')
    console.log('Dev mode ENABLED - refresh the page')
    return true
  }

  window.disableDevMode = () => {
    localStorage.removeItem('babu_dev_mode')
    console.log('Dev mode DISABLED - refresh the page')
    return false
  }

  window.checkDevMode = () => {
    const status = localStorage.getItem('babu_dev_mode') === 'enabled'
    console.log('Dev mode:', status ? 'ENABLED' : 'DISABLED')
    return status
  }
}
