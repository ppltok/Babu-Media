import { useState, useEffect } from 'react'

// Fun facts organized by adventure theme
const funFactsByTheme = {
  space: [
    { emoji: '🚀', fact: 'A day on Venus is longer than a year on Venus!' },
    { emoji: '⭐', fact: 'There are more stars in space than grains of sand on Earth!' },
    { emoji: '🌙', fact: 'The Moon is slowly drifting away from Earth - about 4cm per year!' },
    { emoji: '🪐', fact: 'Saturn would float if you could put it in a giant bathtub!' },
    { emoji: '👨‍🚀', fact: 'Astronauts grow taller in space because there\'s no gravity!' },
    { emoji: '☀️', fact: 'The Sun is so big that 1 million Earths could fit inside it!' },
  ],
  underwater: [
    { emoji: '🐙', fact: 'Octopuses have three hearts and blue blood!' },
    { emoji: '🐬', fact: 'Dolphins sleep with one eye open!' },
    { emoji: '🦑', fact: 'The giant squid has eyes as big as dinner plates!' },
    { emoji: '🐠', fact: 'Clownfish can change from male to female!' },
    { emoji: '🐋', fact: 'Blue whales are the largest animals that ever lived - even bigger than dinosaurs!' },
    { emoji: '🦈', fact: 'Sharks have been around longer than trees!' },
  ],
  forest: [
    { emoji: '🌳', fact: 'The oldest tree is over 5,000 years old!' },
    { emoji: '🦊', fact: 'Foxes use the Earth\'s magnetic field to hunt!' },
    { emoji: '🦉', fact: 'Owls can rotate their heads almost all the way around!' },
    { emoji: '🐿️', fact: 'Squirrels plant thousands of trees every year by forgetting where they buried nuts!' },
    { emoji: '🍄', fact: 'The largest living thing on Earth is a honey fungus in Oregon!' },
    { emoji: '🦋', fact: 'Butterflies taste with their feet!' },
  ],
  castle: [
    { emoji: '🏰', fact: 'Some castles had secret tunnels for escape!' },
    { emoji: '👑', fact: 'Medieval knights started training at just 7 years old!' },
    { emoji: '🐉', fact: 'Dragon legends exist in almost every culture around the world!' },
    { emoji: '⚔️', fact: 'A knight\'s armor could weigh as much as a 7-year-old child!' },
    { emoji: '🎺', fact: 'Castle builders made spiral staircases go clockwise to give defenders an advantage!' },
    { emoji: '🦁', fact: 'Lions became royal symbols because of their bravery and strength!' },
  ],
  dinosaurs: [
    { emoji: '🦕', fact: 'Some dinosaurs were as small as chickens!' },
    { emoji: '🦖', fact: 'T-Rex couldn\'t run - it could only fast-walk!' },
    { emoji: '🥚', fact: 'The biggest dinosaur eggs were the size of a football!' },
    { emoji: '🌋', fact: 'Dinosaurs lived on Earth for over 160 million years!' },
    { emoji: '🦴', fact: 'We\'ve only discovered about 1,000 dinosaur species - there were probably many more!' },
    { emoji: '🐦', fact: 'Birds are actually living dinosaurs!' },
  ],
  pirates: [
    { emoji: '🏴‍☠️', fact: 'Pirates had their own code of rules called the Pirate Code!' },
    { emoji: '🦜', fact: 'Pirates kept parrots as pets because they could sell them for lots of money!' },
    { emoji: '🗺️', fact: 'Real treasure maps were super rare - pirates usually spent their gold quickly!' },
    { emoji: '⚓', fact: 'Pirates wore eye patches to see better in the dark below deck!' },
    { emoji: '🏝️', fact: 'A "pirate flag" wasn\'t always a skull - each captain had their own design!' },
    { emoji: '💰', fact: 'Some pirates were actually given permission by kings to attack enemy ships!' },
  ],
  superheroes: [
    { emoji: '🦸', fact: 'The first superhero comic was published in 1938!' },
    { emoji: '💪', fact: 'Real-life heroes like firefighters save thousands of lives every year!' },
    { emoji: '🦇', fact: 'Bats can eat up to 1,000 mosquitoes in an hour - tiny superheroes!' },
    { emoji: '🕷️', fact: 'Spiders are super strong - their webs can be stronger than steel!' },
    { emoji: '⚡', fact: 'Lightning is super hot - 5 times hotter than the surface of the Sun!' },
    { emoji: '🌟', fact: 'You have a unique superpower - your fingerprints are one of a kind!' },
  ],
  magic: [
    { emoji: '✨', fact: 'In many cultures, people believed rainbows were magical bridges!' },
    { emoji: '🦄', fact: 'Unicorns appear in stories from many different countries around the world!' },
    { emoji: '🔮', fact: 'The word "magic" comes from ancient Persian wizards called "magi"!' },
    { emoji: '🧙', fact: 'Some scientists were once called alchemists and tried to create real magic!' },
    { emoji: '🌈', fact: 'Rainbows are actually full circles - we just can\'t see the bottom half!' },
    { emoji: '🎩', fact: 'The first magic show was performed over 4,000 years ago in Egypt!' },
  ],
  safari: [
    { emoji: '🦁', fact: 'A lion\'s roar can be heard from 5 miles away!' },
    { emoji: '🦒', fact: 'Giraffes sleep only 30 minutes a day!' },
    { emoji: '🐘', fact: 'Elephants are the only animals that can\'t jump!' },
    { emoji: '🦓', fact: 'Every zebra has a unique stripe pattern - like a fingerprint!' },
    { emoji: '🦛', fact: 'Hippos are one of the most dangerous animals in Africa!' },
    { emoji: '🐆', fact: 'Cheetahs can go from 0 to 60 mph in just 3 seconds!' },
  ],
  arctic: [
    { emoji: '🐧', fact: 'Penguins can drink salt water!' },
    { emoji: '❄️', fact: 'Every snowflake has a unique shape - no two are exactly alike!' },
    { emoji: '🐻‍❄️', fact: 'Polar bear fur isn\'t actually white - it\'s transparent!' },
    { emoji: '🦭', fact: 'Seals can hold their breath for up to 2 hours!' },
    { emoji: '🌊', fact: 'The Arctic Ocean is the smallest and shallowest ocean!' },
    { emoji: '🐳', fact: 'Narwhals are real unicorns of the sea with a long spiral tusk!' },
  ],
  default: [
    { emoji: '🌟', fact: 'Every story you create is completely unique in the world!' },
    { emoji: '📚', fact: 'Reading stories together helps kids learn over 1,000 new words a year!' },
    { emoji: '🧠', fact: 'When you imagine a story, your brain lights up like you\'re really there!' },
    { emoji: '💡', fact: 'The best ideas often come from daydreaming!' },
    { emoji: '🎨', fact: 'Creating stories is one of the oldest human traditions - over 40,000 years!' },
    { emoji: '❤️', fact: 'Kids who read with their parents feel closer to them!' },
  ]
}

// Hebrew translations
const funFactsByThemeHe = {
  space: [
    { emoji: '🚀', fact: 'יום על נוגה ארוך יותר משנה על נוגה!' },
    { emoji: '⭐', fact: 'יש יותר כוכבים בחלל מגרגירי חול על כדור הארץ!' },
    { emoji: '🌙', fact: 'הירח מתרחק מאיתנו לאט - כ-4 סנטימטר בשנה!' },
    { emoji: '🪐', fact: 'שבתאי היה צף במים אם היתה אמבטיה מספיק גדולה!' },
    { emoji: '👨‍🚀', fact: 'אסטרונאוטים גדלים בגובה בחלל כי אין כבידה!' },
    { emoji: '☀️', fact: 'השמש כל כך גדולה שמיליון כדורי ארץ יכולים להיכנס לתוכה!' },
  ],
  underwater: [
    { emoji: '🐙', fact: 'לתמנונים יש שלושה לבבות ודם כחול!' },
    { emoji: '🐬', fact: 'דולפינים ישנים עם עין אחת פתוחה!' },
    { emoji: '🦑', fact: 'לדיונון הענק יש עיניים בגודל של צלחת ארוחה!' },
    { emoji: '🐠', fact: 'דג ליצן יכול להפוך מזכר לנקבה!' },
    { emoji: '🐋', fact: 'לווייתנים כחולים הם החיות הגדולות שאי פעם חיו - גדולים יותר מדינוזאורים!' },
    { emoji: '🦈', fact: 'כרישים חיים על כדור הארץ לפני שהיו עצים!' },
  ],
  forest: [
    { emoji: '🌳', fact: 'העץ הזקן ביותר בן יותר מ-5,000 שנה!' },
    { emoji: '🦊', fact: 'שועלים משתמשים בשדה המגנטי של כדור הארץ לציד!' },
    { emoji: '🦉', fact: 'ינשופים יכולים לסובב את הראש כמעט עד הסוף!' },
    { emoji: '🐿️', fact: 'סנאים נוטעים אלפי עצים כל שנה כי הם שוכחים איפה קברו אגוזים!' },
    { emoji: '🍄', fact: 'היצור החי הגדול ביותר על פני כדור הארץ הוא פטריית דבש באורגון!' },
    { emoji: '🦋', fact: 'פרפרים טועמים עם הרגליים שלהם!' },
  ],
  default: [
    { emoji: '🌟', fact: 'כל סיפור שאתם יוצרים הוא ייחודי לחלוטין בעולם!' },
    { emoji: '📚', fact: 'קריאת סיפורים ביחד עוזרת לילדים ללמוד מעל 1,000 מילים חדשות בשנה!' },
    { emoji: '🧠', fact: 'כשמדמיינים סיפור, המוח נדלק כאילו אתם באמת שם!' },
    { emoji: '💡', fact: 'הרעיונות הטובים ביותר מגיעים לפעמים מחלימה בהקיץ!' },
    { emoji: '🎨', fact: 'יצירת סיפורים היא אחת המסורות העתיקות ביותר של האנושות - מעל 40,000 שנה!' },
    { emoji: '❤️', fact: 'ילדים שקוראים עם ההורים מרגישים קרובים יותר אליהם!' },
  ]
}

export default function FunFacts({ theme = 'default', isRTL = false, className = '' }) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Get facts based on language and theme
  const factsSource = isRTL ? funFactsByThemeHe : funFactsByTheme
  const facts = factsSource[theme] || factsSource.default

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length)
        setIsVisible(true)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [facts.length])

  const currentFact = facts[currentFactIndex]

  return (
    <div className={`${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center mb-3">
        <span className="text-sm font-medium text-purple-300 uppercase tracking-wider">
          {isRTL ? '💡 הידעת?' : '💡 Did You Know?'}
        </span>
      </div>

      <div
        className={`bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-xl p-4 sm:p-6 transition-all duration-300 ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="text-4xl flex-shrink-0 animate-bounce">{currentFact.emoji}</span>
          <p className="text-white text-sm sm:text-base leading-relaxed font-medium">
            {currentFact.fact}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {facts.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentFactIndex
                ? 'w-6 bg-purple-400'
                : 'w-1.5 bg-purple-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
