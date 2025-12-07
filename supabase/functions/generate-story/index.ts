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
    const { storyId, characterName, characterTraits, adventureTheme, moralLesson, visualStyle, animalType, gender = 'male', language = 'en' } = await req.json()

    if (!storyId || !characterName || !adventureTheme) {
      throw new Error('Missing required fields: storyId, characterName, adventureTheme')
    }

    // Language-specific settings
    const isHebrew = language === 'he'

    // Gender-specific pronouns and grammar
    const pronouns = gender === 'female'
      ? { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself' }
      : { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself' }

    // Hebrew gender instructions (Hebrew has grammatical gender affecting verbs and adjectives)
    const hebrewGenderInstruction = gender === 'female'
      ? `CRITICAL HEBREW GRAMMAR: The character is FEMALE (נקבה). Use feminine verb conjugations (e.g., הלכה not הלך, ראתה not ראה, אמרה not אמר). Use feminine adjectives (e.g., אמיצה not אמיץ, קטנה not קטן, יפה stays יפה). Use היא not הוא.`
      : `CRITICAL HEBREW GRAMMAR: The character is MALE (זכר). Use masculine verb conjugations (e.g., הלך not הלכה, ראה not ראתה, אמר not אמרה). Use masculine adjectives (e.g., אמיץ not אמיצה, קטן not קטנה). Use הוא not היא.`

    const englishGenderInstruction = `PRONOUNS: Use ${pronouns.subject}/${pronouns.object}/${pronouns.possessive} pronouns for ${characterName}. Example: "${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} wagged ${pronouns.possessive} tail" or "${pronouns.subject} found ${pronouns.reflexive} in a magical forest."`

    const genderInstruction = isHebrew ? hebrewGenderInstruction : englishGenderInstruction

    const languageInstruction = isHebrew
      ? `LANGUAGE: Write the ENTIRE story in Hebrew (עברית). All page text must be in Hebrew. The title must be in Hebrew. Use natural, child-friendly Hebrew language.\n\n${hebrewGenderInstruction}`
      : `LANGUAGE: Write the entire story in English.\n\n${englishGenderInstruction}`

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

    // Detect if the character type is a human/person or an animal
    const humanTypes = ['boy', 'girl', 'child', 'kid', 'baby', 'person', 'human', 'prince', 'princess', 'knight', 'wizard', 'witch', 'fairy', 'superhero', 'pirate', 'astronaut', 'cowboy', 'cowgirl', 'ninja', 'samurai', 'ילד', 'ילדה', 'נסיך', 'נסיכה', 'אביר', 'קוסם', 'מכשפה', 'פיה', 'גיבור על', 'פיראט', 'אסטרונאוט', 'נינג\'ה']
    const isHumanCharacter = animalType ? humanTypes.some(type => animalType.toLowerCase().includes(type)) : false

    // Build character description based on whether it's human or animal
    let characterDescription
    if (isHumanCharacter) {
      characterDescription = `${characterName} is a cute, animated ${animalType} character (a human character, like in Pixar/Disney movies). Describe ${characterName} as "the ${animalType}" or "the little ${animalType}" throughout the story. Give them human features and clothing appropriate for a ${animalType}.`
    } else if (animalType) {
      characterDescription = `${characterName} is a cute, anthropomorphic ${animalType} character (an animal, NOT a human). Always describe ${characterName} as "the ${animalType}" or "the little ${animalType}" in the story. Describe ${characterName} with animal features (paws, fur, tail, whiskers, etc. as appropriate for a ${animalType}).`
    } else {
      characterDescription = `${characterName} is the main character.`
    }

    console.log('Generating story with Claude...')
    console.log('Character type:', animalType)
    console.log('Is human character:', isHumanCharacter)
    console.log('Gender:', gender)
    console.log('Character description:', characterDescription)
    console.log('Language:', language)

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5000,
        messages: [{
          role: 'user',
          content: `You are a DISNEY-LEVEL children's story writer creating magical, immersive bedtime stories for children ages 3-8. Your stories must be as memorable as "The Gruffalo" or "Goodnight Moon."

Create an illustrated children's story with the following details:

${languageInstruction}

MAIN CHARACTER: ${characterName}
CHARACTER TYPE: ${characterDescription}
CHARACTER TRAITS: ${characterTraits || 'Brave and curious'}
ADVENTURE THEME: ${adventureTheme}
${moralInstruction}

═══════════════════════════════════════════════════════════════
MODULE A: CHARACTER FLAW (Relatability)
═══════════════════════════════════════════════════════════════
Perfect characters are boring. ${characterName} MUST have ONE silly, endearing flaw:
- A fear (afraid of the dark, scared of loud noises, worried about getting messy)
- A quirk (always forgets things, hiccups when nervous, trips over own feet)
- A weakness (too curious, can't resist snacks, talks too fast)

This flaw MUST:
1. Be introduced early in the story
2. Cause a minor funny problem in the middle
3. Be overcome or embraced by the end

═══════════════════════════════════════════════════════════════
MODULE B: THE REFRAIN (Rhythm & Repetition)
═══════════════════════════════════════════════════════════════
Children LOVE repetition. Create a 1-2 line CATCHPHRASE or RHYME for ${characterName}.
Examples: "I think I can!" / "Clank, clunk, beep!" / "Hop, hop, stop!"

This refrain MUST appear EXACTLY 3 times:
1. When ${characterName} sets out on the adventure (pages 2-3)
2. When ${characterName} faces the main obstacle (pages 5-6)
3. When ${characterName} succeeds at the end (pages 7-8)

═══════════════════════════════════════════════════════════════
MODULE C: SENSORY IMMERSION (Show, Don't Tell)
═══════════════════════════════════════════════════════════════
Bad: "It was a nice forest."
Good: "The moss felt like a soft sponge and the air smelled like pine needles."

EVERY location description MUST include:
- At least ONE sound (onomatopoeia: WHOOSH, CRUNCH, SPLASH, BUZZ)
- At least ONE texture OR smell (soft, scratchy, sticky, sweet-smelling)
DO NOT rely only on visual descriptions!

═══════════════════════════════════════════════════════════════
MODULE D: PARENT-CHILD BONDING CUES (Interaction)
═══════════════════════════════════════════════════════════════
Insert [ACTION: instruction] tags at emotional moments for parent interaction:

Examples:
- When a character makes a sound: [ACTION: Make this sound together!]
- When something scary happens: [ACTION: Give your child a little squeeze!]
- When whispering: [ACTION: Whisper this part softly]
- When something exciting happens: [ACTION: Ask: What do you think happens next?]
- When character is happy: [ACTION: Do a little happy wiggle together!]

Include 3-4 [ACTION] tags spread throughout the story.

═══════════════════════════════════════════════════════════════
MODULE E: THE SLEEPY LANDING (Bedtime Wind-Down)
═══════════════════════════════════════════════════════════════
This is a BEDTIME story. The energy curve MUST be:
- Pages 1-2: HIGH energy, curiosity, excitement
- Pages 3-6: ADVENTURE energy, challenges, action
- Pages 7-8: DECREASING energy, calm, cozy, sleepy

The FINAL PAGE (page 8) is CRITICAL:
- Use ONLY calm, sleepy words: soft, warm, cozy, gentle, moonlight, stars, quiet, peaceful, drifting, heavy (eyelids), safe
- AVOID action verbs (run, jump, play, shout)
- The story MUST end with ${characterName} falling asleep, getting cozy, or settling down to rest
- Final sentences should have a hypnotic, lullaby quality

═══════════════════════════════════════════════════════════════
CHARACTER REQUIREMENTS
═══════════════════════════════════════════════════════════════
- ${characterName} is a ${animalType || 'character'}${isHumanCharacter ? ' (a human character)' : ' (NOT a human - an animal character)'}
- Always refer to ${characterName} as "the ${animalType}" or "the little ${animalType}" throughout the story
- ${isHumanCharacter ? `Give ${characterName} human features, expressions, and appropriate clothing` : `Describe ${characterName} with animal features (paws, fur, tail, whiskers, etc. as appropriate for a ${animalType})`}
- ${characterName} should act like a cute animated character (like in Pixar/Disney movies)
- ${characterName} should be the ONLY main character - no other named characters

═══════════════════════════════════════════════════════════════
STRUCTURE REQUIREMENTS
═══════════════════════════════════════════════════════════════
- Create exactly 8 pages (scenes) for the story
- Each page should have 3-4 sentences (about 40-60 words per page)
- Put each sentence on its own line using \\n for line breaks
- The language should be simple, engaging, and age-appropriate for ages 3-8

═══════════════════════════════════════════════════════════════
IMAGE PROMPT REQUIREMENTS
═══════════════════════════════════════════════════════════════
Create 4 image prompts (one for every 2 pages):
- Image 1: Pages 1-2 (introduction/setting)
- Image 2: Pages 3-4 (adventure begins)
- Image 3: Pages 5-6 (challenge/climax)
- Image 4: Pages 7-8 (resolution/sleepy ending)

Each image prompt MUST:
- Start with: "A ${visualStyle || 'Pixar/Disney'} style illustration of a cute ${animalType}..."
- Have the ${animalType} as the ONLY character, prominently centered
- ${isHumanCharacter ? `Include human features appropriate for a ${animalType}` : `Include ${animalType}-specific features (fur, paws, ears, tail, etc.)`}
- Match the ${visualStyle || 'Pixar/Disney'} animation style
- Be child-friendly and colorful
- Image 4 should show a peaceful, sleepy scene (moonlight, cozy bed, closed eyes)

═══════════════════════════════════════════════════════════════

Return your response in this exact JSON format:
{
  "title": "The story title",
  "characterFlaw": "Brief description of the character's silly flaw",
  "refrain": "The catchphrase/rhyme that repeats 3 times",
  "pages": [
    {"pageNumber": 1, "text": "First sentence.\\\\nSecond sentence.\\\\nThird sentence.\\\\nFourth sentence."},
    {"pageNumber": 2, "text": "..."},
    {"pageNumber": 3, "text": "..."},
    {"pageNumber": 4, "text": "..."},
    {"pageNumber": 5, "text": "..."},
    {"pageNumber": 6, "text": "..."},
    {"pageNumber": 7, "text": "..."},
    {"pageNumber": 8, "text": "..."}
  ],
  "imagePrompts": [
    {"imageNumber": 1, "forPages": [1, 2], "prompt": "A ${visualStyle || 'Pixar/Disney'} style illustration of a cute ${animalType}..."},
    {"imageNumber": 2, "forPages": [3, 4], "prompt": "A ${visualStyle || 'Pixar/Disney'} style illustration of a cute ${animalType}..."},
    {"imageNumber": 3, "forPages": [5, 6], "prompt": "A ${visualStyle || 'Pixar/Disney'} style illustration of a cute ${animalType}..."},
    {"imageNumber": 4, "forPages": [7, 8], "prompt": "A ${visualStyle || 'Pixar/Disney'} style illustration of a cute ${animalType}..."}
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

    console.log('Story generated successfully')
    console.log('Story content length:', storyContent.length)

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

    // For Hebrew stories, run a grammar/language correction pass
    // This fixes issues where Claude sometimes outputs Arabic letters or grammar errors
    if (isHebrew) {
      console.log('Running Hebrew grammar correction pass...')

      const hebrewCorrectionResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: `You are a Hebrew language editor. Your task is to correct a children's story written in Hebrew.

IMPORTANT CORRECTIONS TO MAKE:
1. Replace ANY Arabic letters with the correct Hebrew letters (e.g., ا→א, ب→ב, ت→ת, etc.)
2. Fix any Hebrew grammar errors (verb conjugations, gender agreement, etc.)
3. Ensure natural, child-friendly Hebrew language
4. Keep the story content and meaning EXACTLY the same - only fix language issues
5. The character ${characterName} is ${gender === 'female' ? 'FEMALE (נקבה)' : 'MALE (זכר)'} - ensure all verbs and adjectives match this gender

Here is the story to correct:

Title: ${storyData.title}

${storyData.pages.map((p: { pageNumber: number; text: string }) => `Page ${p.pageNumber}:\n${p.text}`).join('\n\n')}

Return ONLY a JSON object with the corrected text in this exact format:
{
  "title": "הכותרת המתוקנת",
  "pages": [
    {"pageNumber": 1, "text": "טקסט מתוקן..."},
    {"pageNumber": 2, "text": "..."},
    {"pageNumber": 3, "text": "..."},
    {"pageNumber": 4, "text": "..."},
    {"pageNumber": 5, "text": "..."},
    {"pageNumber": 6, "text": "..."},
    {"pageNumber": 7, "text": "..."},
    {"pageNumber": 8, "text": "..."}
  ]
}

Return ONLY the JSON, no other text. Keep \\n line breaks in the text.`
          }]
        })
      })

      if (hebrewCorrectionResponse.ok) {
        const correctionData = await hebrewCorrectionResponse.json()
        const correctionContent = correctionData.content[0].text

        try {
          const correctionJsonMatch = correctionContent.match(/\{[\s\S]*\}/)
          if (correctionJsonMatch) {
            const correctedStory = JSON.parse(correctionJsonMatch[0])
            // Update only title and pages, keep original imagePrompts (they're in English for image generation)
            storyData.title = correctedStory.title
            storyData.pages = correctedStory.pages
            console.log('Hebrew correction applied successfully')
          }
        } catch (correctionParseError) {
          console.error('Hebrew correction parse error (using original):', correctionParseError)
          // Continue with original story if correction fails
        }
      } else {
        console.error('Hebrew correction API error (using original):', await hebrewCorrectionResponse.text())
        // Continue with original story if correction fails
      }
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
    console.log('=== DISNEY-LEVEL STORY MODULES ===')
    console.log('Character Flaw:', storyData.characterFlaw || 'Not specified')
    console.log('Refrain:', storyData.refrain || 'Not specified')
    console.log('==================================')

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
