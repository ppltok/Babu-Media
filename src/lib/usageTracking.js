import { supabase } from './supabase'

// Tier limits configuration
export const TIER_LIMITS = {
  free: {
    children: 1,           // 1 child profile max
    characters: 2,         // 2 characters per child (lifetime)
    stories: 1,           // 1 story total (lifetime)
    period: 'lifetime'
  },
  creator: {
    children: Infinity,    // Unlimited children
    characters: 5,         // 5 characters per month
    stories: 10,          // 10 stories per week
    characterPeriod: 'monthly',
    storyPeriod: 'weekly'
  },
  pro: {
    children: Infinity,    // Unlimited children
    characters: Infinity,  // Unlimited characters
    stories: Infinity,     // Unlimited stories
    characterPeriod: 'lifetime',
    storyPeriod: 'lifetime'
  }
}

// Get start of current period
const getPeriodStart = (periodType) => {
  const now = new Date()

  if (periodType === 'lifetime') {
    return new Date(0) // Epoch - for lifetime tracking
  }

  if (periodType === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  if (periodType === 'weekly') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    return new Date(now.getFullYear(), now.getMonth(), diff)
  }

  return now
}

// Get end of current period
const getPeriodEnd = (periodType, periodStart) => {
  if (periodType === 'lifetime') {
    return null
  }

  const start = new Date(periodStart)

  if (periodType === 'monthly') {
    return new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59)
  }

  if (periodType === 'weekly') {
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59)
    return end
  }

  return null
}

// Get user's subscription tier
export const getUserSubscription = async (userId) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // Not found is okay
    console.error('Error fetching subscription:', error)
    return { tier: 'free', status: 'active' }
  }

  // If no subscription found, create one
  if (!data) {
    const { data: newSub, error: insertError } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, tier: 'free', status: 'active' })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating subscription:', insertError)
      return { tier: 'free', status: 'active' }
    }
    return newSub
  }

  return data
}

// Check if user has dev bypass enabled
export const hasDevBypass = async (userId) => {
  const { data, error } = await supabase
    .from('dev_bypass')
    .select('bypass_enabled')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return data.bypass_enabled === true
}

// Get usage count for a specific resource and period
export const getUsageCount = async (userId, resourceType, periodType) => {
  const periodStart = getPeriodStart(periodType)

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .eq('period_type', periodType)
    .eq('period_start', periodStart.toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching usage:', error)
    return 0
  }

  return data?.count || 0
}

// Increment usage count
export const incrementUsage = async (userId, resourceType, periodType) => {
  const periodStart = getPeriodStart(periodType)
  const periodEnd = getPeriodEnd(periodType, periodStart)

  // Try to update existing record
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, count')
    .eq('user_id', userId)
    .eq('resource_type', resourceType)
    .eq('period_type', periodType)
    .eq('period_start', periodStart.toISOString())
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('usage_tracking')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating usage:', error)
      return false
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        resource_type: resourceType,
        period_type: periodType,
        period_start: periodStart.toISOString(),
        period_end: periodEnd?.toISOString() || null,
        count: 1
      })

    if (error) {
      console.error('Error inserting usage:', error)
      return false
    }
  }

  return true
}

// Feature flag to enable/disable payment walls
// Set VITE_ENABLE_PAYMENT_WALL=true in .env to activate payment restrictions
const PAYMENT_WALL_ENABLED = import.meta.env.VITE_ENABLE_PAYMENT_WALL === 'true'

// Check if user can create a resource
export const canCreate = async (userId, resourceType, childId = null) => {
  // If payment wall is disabled, always allow
  if (!PAYMENT_WALL_ENABLED) {
    return { allowed: true, reason: 'Payment wall disabled' }
  }

  // Check for dev bypass first
  const bypass = await hasDevBypass(userId)
  if (bypass) {
    return { allowed: true, reason: 'Dev bypass enabled' }
  }

  // Get subscription
  const subscription = await getUserSubscription(userId)
  const tier = subscription.tier || 'free'
  const limits = TIER_LIMITS[tier]

  // Special handling for children
  if (resourceType === 'child') {
    const { count } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count >= limits.children) {
      return {
        allowed: false,
        reason: tier === 'free'
          ? 'Free tier allows only 1 child profile. Upgrade to Creator tier for unlimited children!'
          : 'You have reached your children limit.',
        currentCount: count,
        limit: limits.children,
        tier
      }
    }
    return { allowed: true, currentCount: count, limit: limits.children, tier }
  }

  // For characters
  if (resourceType === 'character') {
    const periodType = tier === 'free' ? 'lifetime' : limits.characterPeriod
    let currentCount = 0

    if (tier === 'free') {
      // For free tier, count TOTAL characters across ALL children (not per-child)
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', userId)

      if (children && children.length > 0) {
        const childIds = children.map(c => c.id)
        const { count } = await supabase
          .from('characters')
          .select('*', { count: 'exact', head: true })
          .in('child_id', childIds)
        currentCount = count || 0
      }
    } else {
      currentCount = await getUsageCount(userId, 'character', periodType)
    }

    if (currentCount >= limits.characters) {
      return {
        allowed: false,
        reason: tier === 'free'
          ? `Free tier allows ${limits.characters} characters total. Upgrade to Creator tier for more!`
          : `You've used ${currentCount}/${limits.characters} characters this ${periodType === 'monthly' ? 'month' : 'period'}.`,
        currentCount,
        limit: limits.characters,
        tier
      }
    }
    return { allowed: true, currentCount, limit: limits.characters, tier }
  }

  // For stories
  if (resourceType === 'story') {
    const periodType = tier === 'free' ? 'lifetime' : limits.storyPeriod
    let currentCount = 0

    if (tier === 'free') {
      // For free tier, count actual stories from table
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('user_id', userId)

      if (children && children.length > 0) {
        const childIds = children.map(c => c.id)
        const { count } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true })
          .in('child_id', childIds)
        currentCount = count || 0
      }
    } else {
      currentCount = await getUsageCount(userId, 'story', periodType)
    }

    if (currentCount >= limits.stories) {
      return {
        allowed: false,
        reason: tier === 'free'
          ? `Free tier allows ${limits.stories} story. Upgrade to Creator tier for more!`
          : `You've created ${currentCount}/${limits.stories} stories this ${periodType === 'weekly' ? 'week' : 'period'}.`,
        currentCount,
        limit: limits.stories,
        tier
      }
    }
    return { allowed: true, currentCount, limit: limits.stories, tier }
  }

  return { allowed: true, tier }
}

// Track resource creation
export const trackCreation = async (userId, resourceType) => {
  const subscription = await getUserSubscription(userId)
  const tier = subscription.tier || 'free'
  const limits = TIER_LIMITS[tier]

  let periodType = 'lifetime'

  if (tier === 'creator' || tier === 'pro') {
    if (resourceType === 'character') {
      periodType = limits.characterPeriod
    } else if (resourceType === 'story') {
      periodType = limits.storyPeriod
    }
  }

  return await incrementUsage(userId, resourceType, periodType)
}

// Get full usage summary for display
export const getUsageSummary = async (userId) => {
  const subscription = await getUserSubscription(userId)
  const tier = subscription.tier || 'free'
  const limits = TIER_LIMITS[tier]
  const bypass = await hasDevBypass(userId)

  // Get children count
  const { count: childrenCount } = await supabase
    .from('children')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get character usage - count from actual characters table for accurate display
  const characterPeriod = tier === 'free' ? 'lifetime' : limits.characterPeriod
  let characterCount = 0

  if (characterPeriod === 'lifetime') {
    // For lifetime, count all characters across all children for this user
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('user_id', userId)

    if (children && children.length > 0) {
      const childIds = children.map(c => c.id)
      const { count } = await supabase
        .from('characters')
        .select('*', { count: 'exact', head: true })
        .in('child_id', childIds)
      characterCount = count || 0
    }
  } else {
    characterCount = await getUsageCount(userId, 'character', characterPeriod)
  }

  // Get story usage - count from actual stories table for accurate display
  const storyPeriod = tier === 'free' ? 'lifetime' : limits.storyPeriod
  let storyCount = 0

  if (storyPeriod === 'lifetime') {
    // For lifetime, count all stories across all children for this user
    const { data: children } = await supabase
      .from('children')
      .select('id')
      .eq('user_id', userId)

    if (children && children.length > 0) {
      const childIds = children.map(c => c.id)
      const { count } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .in('child_id', childIds)
      storyCount = count || 0
    }
  } else {
    storyCount = await getUsageCount(userId, 'story', storyPeriod)
  }

  return {
    tier,
    bypass,
    subscription,
    children: {
      current: childrenCount || 0,
      limit: limits.children,
      remaining: Math.max(0, limits.children - (childrenCount || 0))
    },
    characters: {
      current: characterCount,
      limit: limits.characters,
      remaining: Math.max(0, limits.characters - characterCount),
      period: characterPeriod
    },
    stories: {
      current: storyCount,
      limit: limits.stories,
      remaining: Math.max(0, limits.stories - storyCount),
      period: storyPeriod
    }
  }
}
