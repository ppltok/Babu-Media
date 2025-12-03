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
    const { storyId, imageNumber, prompt, characterImageUrl, visualStyle, animalType } = await req.json()

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
    console.log('Animal type:', animalType)
    console.log('Original prompt:', prompt)

    // Transform the prompt to use animal type instead of character name
    // This helps the image generator focus on the animal type rather than a random name
    let transformedPrompt = prompt

    // Replace any character name with "the [animal type]"
    // Common patterns: "[Name] is...", "[Name]'s...", "with [Name]..."
    if (animalType) {
      const animalDescription = `the ${animalType}`

      // Replace character names that appear at the start or in the middle
      // This regex matches capitalized names followed by typical sentence patterns
      transformedPrompt = transformedPrompt
        .replace(/prominently centered in the frame/gi, '')
        .replace(/centered composition/gi, '')
        .replace(/medium shot of/gi, '')
        // Replace "A [style] illustration with [Name]" patterns
        .replace(/illustration with \w+/gi, `illustration with ${animalDescription}`)
        // Replace standalone capitalized words that look like names before verbs
        .replace(/\b[A-Z][a-z]+\b(?=\s+(is|was|has|had|looks|stands|sits|runs|walks|flies|swims|explores|discovers|finds|sees|watches|plays|holds|carries|enters|reaches|climbs|jumps))/g, animalDescription)
        // Replace possessive forms like "Name's"
        .replace(/\b[A-Z][a-z]+'s\b/g, `${animalDescription}'s`)
    }

    // Build the final prompt for Seedream
    const finalPrompt = `${visualStyle || 'Pixar/Disney'} animation style, children's book illustration. ${transformedPrompt}. Vibrant colors, magical atmosphere, beautiful background, professional quality, high detail.`

    console.log('Transformed prompt:', finalPrompt)

    let falResponse
    let falData

    if (characterImageUrl) {
      // Use ByteDance Seedream v4.5 Edit for image editing with character reference
      console.log('Using ByteDance Seedream v4.5 Edit...')

      falResponse = await fetch('https://fal.run/fal-ai/bytedance/seedream/v4.5/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          image_urls: [characterImageUrl],
          image_size: 'square',
          num_images: 1
        })
      })

      // Fallback 2: Standard SDXL image-to-image if Seedream fails
      if (!falResponse.ok) {
        console.log('Seedream failed, trying SDXL Lightning...')
        falResponse = await fetch('https://fal.run/fal-ai/fast-lightning-sdxl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            image_url: characterImageUrl,
            strength: 0.55,
            num_images: 1,
            image_size: 'square',
            num_inference_steps: 4,
            enable_safety_checker: true
          })
        })
      }
    } else {
      // No character image - use ByteDance Seedream v4.5 text-to-image
      console.log('No character image, using ByteDance Seedream v4.5...')

      falResponse = await fetch('https://fal.run/fal-ai/bytedance/seedream/v4.5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          image_size: 'square',
          num_images: 1
        })
      })

      // Fallback to nano-banana if Seedream fails
      if (!falResponse.ok) {
        console.log('Seedream text-to-image failed, trying nano-banana...')
        falResponse = await fetch('https://fal.run/fal-ai/nano-banana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            image_size: 'square',
            num_images: 1,
            enable_safety_checker: true
          })
        })
      }
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
      prompt: finalPrompt
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
