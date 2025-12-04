import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
}

// Verify Lemon Squeezy webhook signature
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computedSignature === signature
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const webhookSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('x-signature') || ''

    // Verify webhook signature (optional but recommended)
    if (webhookSecret && signature) {
      const isValid = await verifySignature(body, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const payload = JSON.parse(body)
    const eventName = payload.meta?.event_name
    const customData = payload.meta?.custom_data || {}
    const data = payload.data?.attributes

    console.log('Lemon Squeezy webhook received:', eventName)
    console.log('Custom data:', JSON.stringify(customData))

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed': {
        // Extract user email from custom data or billing info
        const userEmail = customData.user_email || data?.user_email
        const customerEmail = data?.customer_email || userEmail

        if (!customerEmail) {
          console.error('No customer email found in webhook data')
          break
        }

        // Find user by email
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()
        if (userError) {
          console.error('Error listing users:', userError)
          break
        }

        const user = users.users.find(u => u.email === customerEmail)
        if (!user) {
          console.error('User not found for email:', customerEmail)
          break
        }

        // Update subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            tier: 'creator',
            lemon_squeezy_customer_id: data?.customer_id?.toString(),
            lemon_squeezy_subscription_id: payload.data?.id?.toString(),
            status: data?.status === 'active' ? 'active' : data?.status,
            current_period_start: data?.current_period_start,
            current_period_end: data?.current_period_end,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })

        if (updateError) {
          console.error('Error updating subscription:', updateError)
        } else {
          console.log('Subscription updated for user:', user.id)
        }
        break
      }

      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_paused': {
        const customerEmail = customData.user_email || data?.user_email || data?.customer_email

        if (!customerEmail) {
          console.error('No customer email found in webhook data')
          break
        }

        // Find user by email
        const { data: users } = await supabase.auth.admin.listUsers()
        const user = users?.users.find(u => u.email === customerEmail)

        if (!user) {
          console.error('User not found for email:', customerEmail)
          break
        }

        // Update subscription status
        const status = eventName === 'subscription_cancelled' ? 'cancelled'
          : eventName === 'subscription_expired' ? 'expired'
          : 'paused'

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status,
            tier: 'free', // Downgrade to free tier
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
        } else {
          console.log(`Subscription ${status} for user:`, user.id)
        }
        break
      }

      case 'order_created': {
        // One-time purchase or first subscription payment
        console.log('Order created:', payload.data?.id)
        break
      }

      default:
        console.log('Unhandled event type:', eventName)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
