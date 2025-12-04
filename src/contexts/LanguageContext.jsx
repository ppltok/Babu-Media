import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext({})

export const useLanguage = () => useContext(LanguageContext)

// Translations object - Claude will generate Hebrew content dynamically for stories
// This is just for UI elements
const translations = {
  en: {
    // Dashboard
    welcomeToStudio: "Welcome to the Studio",
    selectChildProfile: "Select a child profile to start creating characters",
    addChild: "Add Child",
    addFirstChild: "Add your first child",
    signOut: "Sign Out",

    // Add Child
    addNewChild: "Add New Child",
    childName: "Child's Name",
    childNamePlaceholder: "Enter child's name",
    chooseAvatar: "Choose an Avatar",
    cancel: "Cancel",
    adding: "Adding...",

    // Fusion Lab
    fusionLab: "Fusion Lab",
    createCharacter: "Create New Character",
    yourCharacters: "Your Characters",
    noCharactersYet: "No characters yet",
    createFirstCharacter: "Create your first character!",
    characterName: "Character Name",
    characterNamePlaceholder: "Enter character name",
    chooseAnimalType: "Choose Animal Type",
    chooseArtStyle: "Choose Your Favorite Art Style",
    artStyleHint: "Pick the style that reminds you of your favorite shows!",
    choosePersonality: "Choose Personality Traits",
    selectAtLeast: "Select at least 1 trait",
    chooseOutfit: "Choose an Outfit (Optional)",
    customOutfit: "Or describe a custom outfit",
    customOutfitPlaceholder: "Describe a custom outfit...",
    characterPreview: "Character Preview",
    back: "Back",
    nextChooseStyle: "Next: Choose Style",
    nextChoosePersonality: "Next: Choose Personality",
    createCharacterBtn: "Create Character",
    generating: "Generating...",
    deleteCharacter: "Delete Character",
    confirmDelete: "Are you sure?",
    deleting: "Deleting...",
    delete: "Delete",

    // Studio (Plot World)
    plotWorld: "Plot World",
    createNewStory: "Create New Story",
    yourStories: "Your Stories",
    noStoriesYet: "No stories yet",
    createFirstStory: "Create your first story!",
    selectCharacter: "Select a Character",
    selectCharacterHint: "Choose which character will star in your story",
    chooseAdventure: "Choose an Adventure",
    chooseAdventureHint: "What kind of adventure will your character have?",
    chooseMoral: "Choose a Lesson (Optional)",
    chooseMoralHint: "What should the story teach?",
    storyPreview: "Story Preview",
    createStory: "Create Story",
    creatingStory: "Creating your magical story...",
    creatingIllustration: "Creating illustration",
    readStory: "Read Story",
    page: "Page",
    of: "of",
    theEnd: "The End",
    close: "Close",

    // Settings
    settings: "Settings",
    language: "Language",
    english: "English",
    hebrew: "Hebrew",

    // Common
    loading: "Loading...",
    error: "Error",
    save: "Save",
    custom: "Custom",

    // Animal types
    fox: "Fox",
    wolf: "Wolf",
    raccoon: "Raccoon",
    unicorn: "Unicorn",
    lion: "Lion",
    owl: "Owl",
    dragon: "Dragon",
    bunny: "Bunny",
    cat: "Cat",
    dog: "Dog",
    bear: "Bear",
    panda: "Panda",

    // Personality traits
    brave: "Brave",
    curious: "Curious",
    kind: "Kind",
    clever: "Clever",
    playful: "Playful",
    shy: "Shy",
    adventurous: "Adventurous",
    creative: "Creative",
  },
  he: {
    // Dashboard
    welcomeToStudio: "ברוכים הבאים לסטודיו",
    selectChildProfile: "בחרו פרופיל ילד כדי להתחיל ליצור דמויות",
    addChild: "הוסף ילד",
    addFirstChild: "הוסיפו את הילד הראשון",
    signOut: "התנתק",

    // Add Child
    addNewChild: "הוספת ילד חדש",
    childName: "שם הילד",
    childNamePlaceholder: "הכניסו את שם הילד",
    chooseAvatar: "בחרו אווטאר",
    cancel: "ביטול",
    adding: "מוסיף...",

    // Fusion Lab
    fusionLab: "מעבדת היצירה",
    createCharacter: "צור דמות חדשה",
    yourCharacters: "הדמויות שלך",
    noCharactersYet: "אין עדיין דמויות",
    createFirstCharacter: "צרו את הדמות הראשונה!",
    characterName: "שם הדמות",
    characterNamePlaceholder: "הכניסו שם לדמות",
    chooseAnimalType: "בחרו סוג חיה",
    chooseArtStyle: "בחרו סגנון אמנותי אהוב",
    artStyleHint: "בחרו את הסגנון שמזכיר לכם את הסדרות האהובות!",
    choosePersonality: "בחרו תכונות אופי",
    selectAtLeast: "בחרו לפחות תכונה אחת",
    chooseOutfit: "בחרו תלבושת (אופציונלי)",
    customOutfit: "או תארו תלבושת מותאמת",
    customOutfitPlaceholder: "תארו תלבושת מותאמת...",
    characterPreview: "תצוגה מקדימה",
    back: "חזרה",
    nextChooseStyle: "הבא: בחירת סגנון",
    nextChoosePersonality: "הבא: בחירת אישיות",
    createCharacterBtn: "צור דמות",
    generating: "יוצר...",
    deleteCharacter: "מחק דמות",
    confirmDelete: "האם אתם בטוחים?",
    deleting: "מוחק...",
    delete: "מחק",

    // Studio (Plot World)
    plotWorld: "עולם הסיפורים",
    createNewStory: "צור סיפור חדש",
    yourStories: "הסיפורים שלך",
    noStoriesYet: "אין עדיין סיפורים",
    createFirstStory: "צרו את הסיפור הראשון!",
    selectCharacter: "בחרו דמות",
    selectCharacterHint: "בחרו איזו דמות תככב בסיפור",
    chooseAdventure: "בחרו הרפתקה",
    chooseAdventureHint: "איזו הרפתקה תהיה לדמות שלכם?",
    chooseMoral: "בחרו מסר (אופציונלי)",
    chooseMoralHint: "מה הסיפור צריך ללמד?",
    storyPreview: "תצוגה מקדימה",
    createStory: "צור סיפור",
    creatingStory: "יוצר את הסיפור הקסום שלכם...",
    creatingIllustration: "יוצר איור",
    readStory: "קרא סיפור",
    page: "עמוד",
    of: "מתוך",
    theEnd: "סוף",
    close: "סגור",

    // Settings
    settings: "הגדרות",
    language: "שפה",
    english: "אנגלית",
    hebrew: "עברית",

    // Common
    loading: "טוען...",
    error: "שגיאה",
    save: "שמור",
    custom: "מותאם אישית",

    // Animal types
    fox: "שועל",
    wolf: "זאב",
    raccoon: "דביבון",
    unicorn: "חד קרן",
    lion: "אריה",
    owl: "ינשוף",
    dragon: "דרקון",
    bunny: "ארנב",
    cat: "חתול",
    dog: "כלב",
    bear: "דוב",
    panda: "פנדה",

    // Personality traits
    brave: "אמיץ",
    curious: "סקרן",
    kind: "טוב לב",
    clever: "חכם",
    playful: "שובב",
    shy: "ביישן",
    adventurous: "הרפתקן",
    creative: "יצירתי",
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or default to 'en'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('babu-language') || 'en'
    }
    return 'en'
  })

  const isRTL = language === 'he'

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('babu-language', language)

    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language, isRTL])

  // Translation function
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  const value = {
    language,
    setLanguage,
    isRTL,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
