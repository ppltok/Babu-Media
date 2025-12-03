import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { characterId, prompt, animalType, styleName } = await req.json()

    if (!characterId || !prompt) {
      throw new Error('Missing required fields: characterId, prompt')
    }

    // Get API keys from environment
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    const falKey = Deno.env.get('FAL_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!anthropicKey || !falKey) {
      throw new Error('Missing API keys')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Step 1: Use Claude to enhance the prompt for better image generation
    console.log('Enhancing prompt with Claude...')

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are an expert at writing image generation prompts for children's character illustrations.

Take this character description and enhance it into an optimal image generation prompt. The result should be a single, detailed prompt that will generate a cute, child-friendly character illustration.

Original description: ${prompt}

Requirements:
- Keep it child-friendly, adorable, and appealing to children ages 5-12
- Emphasize cute, expressive features with big sparkling eyes
- Include style keywords for the ${styleName} animation style
- Create a BEAUTIFUL, THEMED BACKGROUND that matches the character's personality and style (e.g., magical forest, cozy bedroom, adventure landscape, candy land, underwater scene, starry sky)
- The background should be colorful, whimsical, and complement the character
- Full body shot, character centered in the scene
- Add quality keywords: 4K resolution, ultra high detail, professional illustration, vibrant saturated colors, cinematic lighting, masterpiece quality
- Include: sharp focus, detailed textures, professional digital art, trending on artstation
- Keep the prompt under 250 words

Return ONLY the enhanced prompt, nothing else.`
        }]
      })
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json()
    const enhancedPrompt = claudeData.content[0].text

    console.log('Enhanced prompt:', enhancedPrompt)

    // Step 2: Generate image with Fal.ai using Nano Banana
    console.log('Generating image with Fal.ai Nano Banana...')

    const falResponse = await fetch('https://fal.run/fal-ai/nano-banana', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${falKey}`
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: "square_hd",
        num_images: 1,
        enable_safety_checker: true
      })
    })

    if (!falResponse.ok) {
      const errorText = await falResponse.text()
      console.error('Fal.ai API error:', errorText)
      throw new Error(`Fal.ai API error: ${falResponse.status} - ${errorText}`)
    }

    const falData = await falResponse.json()
    console.log('Fal.ai response:', JSON.stringify(falData))

    // Extract image URL from response
    let imageUrl = null

    if (falData.images && falData.images.length > 0) {
      imageUrl = falData.images[0].url
    } else if (falData.image) {
      imageUrl = falData.image.url || falData.image
    }

    if (!imageUrl) {
      console.error('No image URL in response:', falData)
      throw new Error('No image URL returned from Fal.ai')
    }

    console.log('Image URL:', imageUrl)

    // Update character with image URL
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        image_url: imageUrl,
        custom_prompt: enhancedPrompt
      })
      .eq('id', characterId)

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`)
    }

    console.log('Character updated successfully with image:', imageUrl)

    return new Response(
      JSON.stringify({ success: true, imageUrl, enhancedPrompt }),
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
