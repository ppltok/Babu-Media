import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This function gets called by a database webhook when a new user signs up
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()

    // Extract user info from the webhook payload
    const { record } = payload // 'record' contains the new user data
    const userEmail = record?.email || 'Unknown'
    const userId = record?.id || 'Unknown'
    const createdAt = record?.created_at || new Date().toISOString()
    const fullName = record?.raw_user_meta_data?.full_name || 'Not provided'

    // Get notification email from environment
    const notifyEmail = Deno.env.get('NOTIFY_EMAIL') || 'tom@babumedia.com'
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    console.log('New user signup:', { userEmail, userId, fullName, createdAt })

    // If Resend API key is configured, send email notification
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Babu Media <notifications@babumedia.com>',
          to: [notifyEmail],
          subject: `🎉 New Babu Media Signup: ${userEmail}`,
          html: `
            <h2>New User Signed Up!</h2>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Signed up at:</strong> ${new Date(createdAt).toLocaleString()}</p>
            <hr>
            <p>Go to <a href="https://supabase.com/dashboard/project/zbnkhlxlxgrmrpmpeuwz/auth/users">Supabase Dashboard</a> to view all users.</p>
          `
        })
      })

      if (!emailResponse.ok) {
        const error = await emailResponse.text()
        console.error('Failed to send email:', error)
      } else {
        console.log('Email notification sent successfully')
      }
    } else {
      // Fallback: Just log to console (visible in Supabase Edge Function logs)
      console.log('=== NEW USER SIGNUP NOTIFICATION ===')
      console.log(`Email: ${userEmail}`)
      console.log(`Name: ${fullName}`)
      console.log(`User ID: ${userId}`)
      console.log(`Time: ${createdAt}`)
      console.log('=====================================')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
