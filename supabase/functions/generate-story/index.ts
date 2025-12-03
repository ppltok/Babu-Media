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
    const { storyId, characterName, characterTraits, adventureTheme, moralLesson, visualStyle } = await req.json()

    if (!storyId || !characterName || !adventureTheme) {
      throw new Error('Missing required fields: storyId, characterName, adventureTheme')
    }

    // Get API key from environment
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!anthropicKey) {
      throw new Error('Missing Anthropic API key')
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Build the story generation prompt
    const moralInstruction = moralLesson
      ? `The story should teach a valuable lesson about: ${moralLesson}. Weave this lesson naturally into the narrative without being preachy.`
      : ''

    console.log('Generating story with Claude...')

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `You are a children's story writer creating magical, engaging stories for children ages 5-12.

Create an illustrated children's story with the following details:

MAIN CHARACTER: ${characterName}
CHARACTER TRAITS: ${characterTraits || 'Brave and curious'}
ADVENTURE THEME: ${adventureTheme}
${moralInstruction}

REQUIREMENTS:
- Create exactly 6 pages (scenes) for the story
- Each page should have 3-4 sentences (about 40-60 words per page)
- Put each sentence on its own line using \\n for line breaks
- The language should be simple, engaging, and age-appropriate
- Include vivid descriptions that can be illustrated
- Make the story exciting with a clear beginning, middle, and end
- ${characterName} should be the ONLY main character in the story - no other named characters
- The character should face a challenge and overcome it
- End on a positive, heartwarming note

ALSO create image prompts for 3 illustrations (one for every 2 pages):
- Image 1: For pages 1-2 (story beginning)
- Image 2: For pages 3-4 (story middle/challenge)
- Image 3: For pages 5-6 (story resolution/ending)

CRITICAL IMAGE PROMPT REQUIREMENTS:
- ${characterName} MUST be the ONLY character in EVERY image - no other characters, people, or creatures
- ${characterName} MUST be prominently placed in the CENTER of the image, taking up a significant portion of the frame
- The image should be a close-up or medium shot focusing on ${characterName}
- Do NOT include any other named characters, sidekicks, friends, or companions in any image
- Be detailed enough for AI image generation
- Match the ${visualStyle || 'Pixar/Disney'} animation style
- Be child-friendly and colorful
- Include the setting and action from those pages
- Always start the prompt with: "A ${visualStyle || 'Pixar/Disney'} style illustration with ${characterName} prominently centered in the frame..."

Return your response in this exact JSON format:
{
  "title": "The story title",
  "pages": [
    {"pageNumber": 1, "text": "First sentence.\\nSecond sentence.\\nThird sentence.\\nFourth sentence."},
    {"pageNumber": 2, "text": "First sentence.\\nSecond sentence.\\nThird sentence.\\nFourth sentence."},
    {"pageNumber": 3, "text": "First sentence.\\nSecond sentence.\\nThird sentence.\\nFourth sentence."},
    {"pageNumber": 4, "text": "First sentence.\\nSecond sentence.\\nThird sentence.\\nFourth sentence."},
    {"pageNumber": 5, "text": "First sentence.\\nSecond sentence.\\nThird sentence.\\nFourth sentence."},
    {"pageNumber": 6, "text": "First sentence.\\nSecond sentence.\\nThird sentence.\\nFourth sentence."}
  ],
  "imagePrompts": [
    {"imageNumber": 1, "forPages": [1, 2], "prompt": "A ${visualStyle || 'Pixar/Disney'} style illustration with ${characterName} prominently centered in the frame..."},
    {"imageNumber": 2, "forPages": [3, 4], "prompt": "A ${visualStyle || 'Pixar/Disney'} style illustration with ${characterName} prominently centered in the frame..."},
    {"imageNumber": 3, "forPages": [5, 6], "prompt": "A ${visualStyle || 'Pixar/Disney'} style illustration with ${characterName} prominently centered in the frame..."}
  ]
}

Return ONLY the JSON, no other text.`
        }]
      })
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json()
    const storyContent = claudeData.content[0].text

    console.log('Story generated:', storyContent)

    // Parse the JSON response
    let storyData
    try {
      // Clean the response in case there's any extra text
      const jsonMatch = storyContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        storyData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Failed to parse story response')
    }

    // Update story with generated content
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        title: storyData.title,
        pages: storyData.pages,
        image_prompts: storyData.imagePrompts,
        status: 'story_generated'
      })
      .eq('id', storyId)

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`)
    }

    console.log('Story saved successfully')

    return new Response(
      JSON.stringify({ success: true, story: storyData }),
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
