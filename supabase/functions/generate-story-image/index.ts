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
    const { storyId, imageNumber, prompt, characterImageUrl, visualStyle } = await req.json()

    if (!storyId || !imageNumber || !prompt) {
      throw new Error('Missing required fields: storyId, imageNumber, prompt')
    }

    // Get API keys from environment
    const falKey = Deno.env.get('FAL_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!falKey) {
      throw new Error('Missing FAL API key')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    console.log('=== STORY IMAGE GENERATION ===')
    console.log('Character image URL:', characterImageUrl)
    console.log('Visual style:', visualStyle)
    console.log('Scene prompt:', prompt)

    // Skip Claude enhancement - use direct image-to-image with the CHARACTER as the base
    // This ensures the character from the reference is ACTUALLY used, not just described

    let falResponse
    let falData

    if (characterImageUrl) {
      // USE IMAGE-TO-IMAGE: Take the character image and transform it into the scene
      // This GUARANTEES the character appearance is preserved
      console.log('Using FAST image-to-image with character as base...')

      // Extract scene/action from the prompt (remove character name references)
      const sceneDescription = prompt
        .replace(/prominently centered in the frame/gi, '')
        .replace(/centered composition/gi, '')
        .replace(/medium shot of/gi, '')

      // Build a scene-focused prompt that transforms the character into the scene
      const transformPrompt = `${visualStyle || 'Pixar/Disney'} animation style, children's book illustration. Scene: ${sceneDescription}. Same character in a new pose and setting. Vibrant colors, magical atmosphere, beautiful background, professional quality, 4K.`

      console.log('Transform prompt:', transformPrompt)

      // Primary: Use SDXL Lightning for FAST image-to-image (very fast!)
      falResponse = await fetch('https://fal.run/fal-ai/fast-lightning-sdxl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`
        },
        body: JSON.stringify({
          prompt: transformPrompt,
          image_url: characterImageUrl,
          strength: 0.55,
          num_images: 1,
          image_size: 'landscape_4_3',
          num_inference_steps: 4,
          enable_safety_checker: true
        })
      })

      // Fallback 1: Standard SDXL image-to-image
      if (!falResponse.ok) {
        console.log('Fast Lightning failed, trying standard SDXL...')
        falResponse = await fetch('https://fal.run/fal-ai/fast-sdxl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`
          },
          body: JSON.stringify({
            prompt: transformPrompt,
            image_url: characterImageUrl,
            strength: 0.5,
            num_images: 1,
            image_size: 'landscape_4_3',
            num_inference_steps: 8,
            enable_safety_checker: true
          })
        })
      }

      // Fallback 2: Flux dev image-to-image
      if (!falResponse.ok) {
        console.log('SDXL failed, trying Flux...')
        falResponse = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`
          },
          body: JSON.stringify({
            prompt: transformPrompt,
            image_url: characterImageUrl,
            strength: 0.5,
            num_images: 1,
            image_size: 'landscape_4_3',
            num_inference_steps: 20,
            enable_safety_checker: true
          })
        })
      }
    } else {
      // Fallback to regular nano-banana if no character image
      falResponse = await fetch('https://fal.run/fal-ai/nano-banana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image_size: 'landscape_16_9',
          num_images: 1,
          enable_safety_checker: true
        })
      })
    }

    if (!falResponse.ok) {
      const errorText = await falResponse.text()
      console.error('Fal.ai API error:', errorText)
      throw new Error(`Fal.ai API error: ${falResponse.status} - ${errorText}`)
    }

    falData = await falResponse.json()
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

    // Get current story to update the correct image
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('images')
      .eq('id', storyId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch story: ${fetchError.message}`)
    }

    // Update images array
    const currentImages = story?.images || []
    currentImages[imageNumber - 1] = {
      imageNumber,
      url: imageUrl,
      prompt: enhancedPrompt
    }

    // Update story with new image
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        images: currentImages
      })
      .eq('id', storyId)

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`)
    }

    console.log('Story image saved successfully')

    return new Response(
      JSON.stringify({ success: true, imageUrl, imageNumber }),
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
