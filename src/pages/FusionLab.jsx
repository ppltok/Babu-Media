import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Art style images from public folder (using BASE_URL for production compatibility)
const baseUrl = import.meta.env.BASE_URL
const pixarStyle = `${baseUrl}art-styles/pixar-style.jpg`
const dreamworksStyle = `${baseUrl}art-styles/dreamworks-style.jpg`
const ghibliStyle = `${baseUrl}art-styles/ghibli-style.jpg`
const cartoonNetworkStyle = `${baseUrl}art-styles/Cartoon Network.jpg`
const nickelodeonStyle = `${baseUrl}art-styles/Nickelodeon.jpeg`
const animeStyle = `${baseUrl}art-styles/Anime Style.jpeg`
const disneyClassicStyle = `${baseUrl}art-styles/Disney Classic.jpg`
const illuminationStyle = `${baseUrl}art-styles/Illumination.jpeg`

// Animal types
const ANIMAL_TYPES = [
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'wolf', emoji: '🐺', name: 'Wolf' },
  { id: 'raccoon', emoji: '🦝', name: 'Raccoon' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐕', name: 'Dog' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'custom', emoji: '✨', name: 'Custom', isCustom: true },
]

// Visual styles based on popular shows with local images
const VISUAL_STYLES = [
  { id: 'pixar', name: 'Pixar/Disney', shows: 'Toy Story, Finding Nemo, Coco', color: 'from-blue-500 to-cyan-500', emoji: '🎬', image: pixarStyle },
  { id: 'dreamworks', name: 'DreamWorks', shows: 'Shrek, Kung Fu Panda, How to Train Your Dragon', color: 'from-green-500 to-emerald-500', emoji: '🐲', image: dreamworksStyle },
  { id: 'ghibli', name: 'Studio Ghibli', shows: 'Totoro, Spirited Away, Ponyo', color: 'from-sky-400 to-blue-500', emoji: '🌸', image: ghibliStyle },
  { id: 'cartoon-network', name: 'Cartoon Network', shows: 'Adventure Time, Powerpuff Girls, Steven Universe', color: 'from-pink-500 to-rose-500', emoji: '⭐', image: cartoonNetworkStyle },
  { id: 'nickelodeon', name: 'Nickelodeon', shows: 'SpongeBob, Paw Patrol, Dora', color: 'from-orange-500 to-amber-500', emoji: '🧽', image: nickelodeonStyle },
  { id: 'anime', name: 'Anime Style', shows: 'Pokemon, Naruto, Dragon Ball', color: 'from-purple-500 to-violet-500', emoji: '⚡', image: animeStyle },
  { id: 'disney-classic', name: 'Disney Classic', shows: 'Lion King, Aladdin, Little Mermaid', color: 'from-yellow-500 to-orange-500', emoji: '🦁', image: disneyClassicStyle },
  { id: 'illumination', name: 'Illumination', shows: 'Minions, Sing, Secret Life of Pets', color: 'from-yellow-400 to-yellow-600', emoji: '🍌', image: illuminationStyle },
]

// Personality traits (multi-select)
const PERSONALITY_TRAITS = [
  { id: 'brave', label: 'Brave', emoji: '🦸' },
  { id: 'curious', label: 'Curious', emoji: '🔍' },
  { id: 'kind', label: 'Kind', emoji: '💝' },
  { id: 'clever', label: 'Clever', emoji: '🧠' },
  { id: 'playful', label: 'Playful', emoji: '🎮' },
  { id: 'wise', label: 'Wise', emoji: '🦉' },
  { id: 'gentle', label: 'Gentle', emoji: '🌸' },
  { id: 'bold', label: 'Bold', emoji: '⚡' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'loyal', label: 'Loyal', emoji: '🤝' },
  { id: 'funny', label: 'Funny', emoji: '😄' },
  { id: 'adventurous', label: 'Adventurous', emoji: '🗺️' },
  { id: 'shy', label: 'Shy', emoji: '🙈' },
  { id: 'confident', label: 'Confident', emoji: '💪' },
  { id: 'caring', label: 'Caring', emoji: '🤗' },
  { id: 'magical', label: 'Magical', emoji: '✨' },
]

// Outfit presets
const OUTFIT_PRESETS = [
  { id: 'superhero', label: 'Superhero Cape', emoji: '🦸', desc: 'A flowing superhero cape with a bold emblem' },
  { id: 'detective', label: 'Detective', emoji: '🔍', desc: 'Trench coat with a magnifying glass' },
  { id: 'princess', label: 'Princess/Prince', emoji: '👑', desc: 'Royal gown or suit with a crown' },
  { id: 'pirate', label: 'Pirate', emoji: '🏴‍☠️', desc: 'Pirate hat, eye patch, and adventure gear' },
  { id: 'astronaut', label: 'Astronaut', emoji: '🚀', desc: 'Space suit ready for cosmic adventures' },
  { id: 'wizard', label: 'Wizard/Witch', emoji: '🧙', desc: 'Magical robes with a pointed hat' },
  { id: 'sports', label: 'Sports Star', emoji: '⚽', desc: 'Athletic jersey and sneakers' },
  { id: 'artist', label: 'Artist', emoji: '🎨', desc: 'Colorful smock with a beret' },
  { id: 'scientist', label: 'Scientist', emoji: '🔬', desc: 'Lab coat with goggles' },
  { id: 'ninja', label: 'Ninja', emoji: '🥷', desc: 'Stealthy ninja outfit' },
  { id: 'fairy', label: 'Fairy', emoji: '🧚', desc: 'Sparkly wings and magical outfit' },
  { id: 'casual', label: 'Casual', emoji: '👕', desc: 'Comfortable everyday clothes' },
]

export default function FusionLab() {
  const { childId } = useParams()
  const navigate = useNavigate()

  const [child, setChild] = useState(null)
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)

  // Character creation state
  const [step, setStep] = useState(1)
  const [characterName, setCharacterName] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [customAnimalName, setCustomAnimalName] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedTraits, setSelectedTraits] = useState([])
  const [selectedOutfit, setSelectedOutfit] = useState(null)
  const [customOutfit, setCustomOutfit] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCharacter, setGeneratedCharacter] = useState(null)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchChildAndCharacters()
  }, [childId])

  const fetchChildAndCharacters = async () => {
    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()

    if (childData) {
      setChild(childData)
    }

    const { data: charactersData } = await supabase
      .from('characters')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })

    if (charactersData) {
      setCharacters(charactersData)
    }

    setLoading(false)
  }

  const toggleTrait = (traitId) => {
    setSelectedTraits(prev =>
      prev.includes(traitId)
        ? prev.filter(t => t !== traitId)
        : prev.length < 4 ? [...prev, traitId] : prev
    )
  }

  const getOutfitDescription = () => {
    if (customOutfit.trim()) return customOutfit.trim()
    if (selectedOutfit) {
      const preset = OUTFIT_PRESETS.find(o => o.id === selectedOutfit)
      return preset?.desc || ''
    }
    return ''
  }

  // Get the actual animal name (handles custom animals)
  const getAnimalName = () => {
    if (selectedAnimal?.isCustom && customAnimalName.trim()) {
      return customAnimalName.trim()
    }
    return selectedAnimal?.name || ''
  }

  // Check if animal selection is valid
  const isAnimalValid = () => {
    if (!selectedAnimal) return false
    if (selectedAnimal.isCustom) return customAnimalName.trim().length > 0
    return true
  }

  const handleGenerate = async () => {
    if (!characterName || !isAnimalValid() || !selectedStyle || selectedTraits.length === 0) {
      return
    }

    setIsGenerating(true)

    const animalName = getAnimalName()
    const traitLabels = selectedTraits.map(t => PERSONALITY_TRAITS.find(p => p.id === t)?.label).join(', ')
    const styleName = VISUAL_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle
    const outfitDesc = getOutfitDescription()

    // Build the prompt
    const prompt = `A ${styleName} style illustration of a cute anthropomorphic ${animalName.toLowerCase()} character named ${characterName}. The character has these personality traits: ${traitLabels}. ${outfitDesc ? `Wearing ${outfitDesc}.` : ''} Child-friendly, colorful, expressive face, full body shot, white background, high quality character design.`

    // Store the animal type - use custom name for custom animals
    const animalTypeId = selectedAnimal.isCustom ? `custom:${animalName}` : selectedAnimal.id

    try {
      // First, save character to database
      const { data, error } = await supabase
        .from('characters')
        .insert({
          child_id: childId,
          name: characterName,
          animal_type: animalTypeId,
          personality_trait: traitLabels,
          visual_style: selectedStyle,
          outfit_description: outfitDesc,
          custom_prompt: prompt,
          image_url: null
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving character:', error)
        setIsGenerating(false)
        return
      }

      // Update UI immediately with the character (without image)
      setGeneratedCharacter(data)
      setCharacters([data, ...characters])

      // Now call the Edge Function to generate the image
      const response = await supabase.functions.invoke('generate-character', {
        body: {
          characterId: data.id,
          prompt: prompt,
          animalType: animalName,
          styleName: styleName
        }
      })

      if (response.error) {
        console.error('Edge function error:', response.error)
        // Character is saved, just without image
        setStep(5)
        setIsGenerating(false)
        return
      }

      const result = response.data

      if (result.success && result.imageUrl) {
        // Update the character in state with the new image
        const updatedCharacter = { ...data, image_url: result.imageUrl }
        setGeneratedCharacter(updatedCharacter)
        setCharacters(prev => prev.map(c => c.id === data.id ? updatedCharacter : c))
      }

      setStep(5)
    } catch (err) {
      console.error('Generation error:', err)
    }

    setIsGenerating(false)
  }

  const handleDeleteCharacter = async (characterId) => {
    setIsDeleting(true)

    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId)

    if (!error) {
      setCharacters(characters.filter(c => c.id !== characterId))
    }

    setDeleteConfirm(null)
    setIsDeleting(false)
  }

  const resetForm = () => {
    setStep(1)
    setCharacterName('')
    setSelectedAnimal(null)
    setCustomAnimalName('')
    setSelectedStyle(null)
    setSelectedTraits([])
    setSelectedOutfit(null)
    setCustomOutfit('')
    setGeneratedCharacter(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0A16] text-white">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">Delete Character?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <span className="text-white font-medium">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCharacter(deleteConfirm.id)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-3">
            <span className="text-2xl">{child?.avatar_emoji}</span>
            <span className="font-semibold">{child?.name}'s Fusion Lab</span>
          </div>

          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Character Creator */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">🧬</span>
                Create New Character
              </h2>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      s <= step ? 'bg-purple-500' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Step 1: Name & Animal */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Character Name
                    </label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Detective Dash, Captain Whiskers..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Choose Animal Type
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {ANIMAL_TYPES.map((animal) => (
                        <button
                          key={animal.id}
                          onClick={() => {
                            setSelectedAnimal(animal)
                            if (!animal.isCustom) setCustomAnimalName('')
                          }}
                          className={`p-3 rounded-xl text-center transition-all ${
                            selectedAnimal?.id === animal.id
                              ? 'bg-purple-500/30 border-2 border-purple-500'
                              : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                          }`}
                        >
                          <div className="text-3xl mb-1">{animal.emoji}</div>
                          <div className="text-xs font-medium">{animal.name}</div>
                        </button>
                      ))}
                    </div>

                    {/* Custom animal input */}
                    {selectedAnimal?.isCustom && (
                      <div className="mt-4">
                        <input
                          type="text"
                          value={customAnimalName}
                          onChange={(e) => setCustomAnimalName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="Enter any animal (e.g., Dinosaur, Border Collie, Penguin...)"
                          autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Type any animal you can imagine - real or fantasy!
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!characterName || !isAnimalValid()}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    Next: Choose Style
                  </button>
                </div>
              )}

              {/* Step 2: Visual Style (Shows) */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Choose Your Favorite Art Style
                    </label>
                    <p className="text-gray-500 text-sm mb-4">Pick the style that reminds you of your favorite shows!</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {VISUAL_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`rounded-xl text-left transition-all overflow-hidden ${
                            selectedStyle === style.id
                              ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0B0A16]'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <div className="flex">
                            {/* Style image with emoji fallback */}
                            <div className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br ${style.color} overflow-hidden flex items-center justify-center relative`}>
                              <span className="text-4xl sm:text-5xl absolute">{style.emoji}</span>
                              <img
                                src={style.image}
                                alt={style.name}
                                className="w-full h-full object-cover relative z-10"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                            {/* Style info */}
                            <div className={`flex-1 p-3 bg-white/5 ${selectedStyle === style.id ? 'bg-purple-500/20' : ''}`}>
                              <div className={`text-sm font-bold mb-1 bg-gradient-to-r ${style.color} bg-clip-text text-transparent`}>
                                {style.name}
                              </div>
                              <div className="text-xs text-gray-400 line-clamp-2">{style.shows}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!selectedStyle}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      Next: Personality
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Personality (Multi-select) */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Choose Personality Traits
                    </label>
                    <p className="text-gray-500 text-sm mb-4">Select up to 4 traits that describe your character</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PERSONALITY_TRAITS.map((trait) => (
                        <button
                          key={trait.id}
                          onClick={() => toggleTrait(trait.id)}
                          className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            selectedTraits.includes(trait.id)
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <span>{trait.emoji}</span>
                          <span>{trait.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {selectedTraits.length}/4
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={selectedTraits.length === 0}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      Next: Outfit
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Outfit & Generate */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Choose an Outfit
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {OUTFIT_PRESETS.map((outfit) => (
                        <button
                          key={outfit.id}
                          onClick={() => {
                            setSelectedOutfit(outfit.id)
                            setCustomOutfit('')
                          }}
                          className={`p-3 rounded-xl text-left transition-all ${
                            selectedOutfit === outfit.id && !customOutfit
                              ? 'bg-purple-500/30 border-2 border-purple-500'
                              : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{outfit.emoji}</span>
                            <span className="text-sm font-medium">{outfit.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-[#0B0A16] text-gray-500">or describe your own</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={customOutfit}
                      onChange={(e) => {
                        setCustomOutfit(e.target.value)
                        if (e.target.value) setSelectedOutfit(null)
                      }}
                      className="w-full mt-4 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Describe a custom outfit..."
                    />
                  </div>

                  {/* Preview */}
                  <div className="bg-black/20 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Character Preview</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-6xl">{selectedAnimal?.emoji}</div>
                        <div className="text-xs text-gray-500 mt-1">{getAnimalName()}</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{characterName}</div>
                        <div className="text-gray-400 text-sm">
                          {selectedTraits.map(t => PERSONALITY_TRAITS.find(p => p.id === t)?.label).join(', ')}
                        </div>
                        <div className="text-purple-400 text-sm mt-1">
                          {VISUAL_STYLES.find(s => s.id === selectedStyle)?.name} Style
                        </div>
                        {getOutfitDescription() && (
                          <div className="text-emerald-400 text-sm mt-1">
                            Outfit: {getOutfitDescription()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <span>✨</span> Bring to Life!
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Success */}
              {step === 5 && generatedCharacter && (
                <div className="text-center py-8">
                  {generatedCharacter.image_url ? (
                    <div className="relative w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/30">
                      <img
                        src={generatedCharacter.image_url}
                        alt={generatedCharacter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-8xl mb-6">{selectedAnimal?.emoji}</div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{generatedCharacter.name} is Ready!</h3>
                  <p className="text-gray-400 mb-8">
                    {generatedCharacter.image_url
                      ? "Your character has been created with AI magic!"
                      : "Your character has been saved. Image generation may take a moment."}
                  </p>
                  <button
                    onClick={resetForm}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    Create Another Character
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Character Gallery */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🎭</span> {child?.name}'s Characters
            </h3>

            {characters.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-400">
                No characters yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-3">
                {characters.map((char) => {
                  const animal = ANIMAL_TYPES.find(a => a.id === char.animal_type)
                  return (
                    <div
                      key={char.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {char.image_url ? (
                          <img
                            src={char.image_url}
                            alt={char.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="text-4xl">{animal?.emoji || '🎭'}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{char.name}</div>
                          <div className="text-sm text-gray-400 truncate">
                            {char.personality_trait}
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(char)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 transition-all"
                          title="Delete character"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
