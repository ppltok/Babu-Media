import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fusionLabImage from './Images/Fusion lab.jpg';
import raccoonImage from './Images/Racoon having fun.png';
import detectiveDashImage from './Images/Fox Driving a Car .png';
import shadowHunterImage from './Images/Hunter the fox.png';
import unicornImage from './Images/Unicorn.png';
import plotWorldImage from './Images/Story time .png';
import charlieImage from './Images/Charlie Brave, Curious.png';
import jackyImage from './Images/Jack Shy.png';

// --- ICONS (Compacted for cleanliness) ---
const SparklesIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);
const MoonIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const BookIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>);
const PaletteIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>);
const PlayIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const StarIcon = ({ className }) => (<svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>);
const ChevronLeftIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);
const ChevronRightIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>);
const HeartIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>);
const ZapIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const ShieldIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
const UsersIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const ClockIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const WandIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const CheckIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const InfinityIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.781 0-4.781 8 0 8 5.606 0 7.644-8 12.74-8z" /></svg>);
const GameIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>);
const ChatIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const SchoolIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>);

export default function BabuMediaLanding() {
  const navigate = useNavigate();
  const [characterIndex, setCharacterIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [fusionLabImageIndex, setFusionLabImageIndex] = useState(0);
  const [pricingIndex, setPricingIndex] = useState(1);

  // Fusion Lab Images Array
  const fusionLabImages = [
    fusionLabImage,
    detectiveDashImage,
    shadowHunterImage,
    raccoonImage,
    unicornImage
  ];

  // Data Models
  const characters = [
    { name: "Detective Dash", type: "Fox Detective", trait: "Clever & Curious", emoji: "🦊", image: detectiveDashImage, color: "from-amber-500 to-orange-500", bg: "bg-orange-950" },
    { name: "Shadow Hunter", type: "Cyber Wolf", trait: "Brave & Strong", emoji: "🐺", image: shadowHunterImage, color: "from-blue-500 to-cyan-500", bg: "bg-blue-950" },
    { name: "Eco Rocky", type: "Friendly Raccoon", trait: "Kind & Helpful", emoji: "🦝", image: raccoonImage, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-950" },
    { name: "Uni the Unicorn", type: "Magical Unicorn", trait: "Wise & Magical", emoji: "🦄", image: unicornImage, color: "from-purple-500 to-pink-500", bg: "bg-purple-950" },
    { name: "Charlie", type: "King Charles Cavalier", trait: "Brave & Curious", emoji: "🐕", image: charlieImage, color: "from-sky-500 to-indigo-500", bg: "bg-indigo-950" },
    { name: "Jacky", type: "Shy Dragon", trait: "Shy & Gentle", emoji: "🐉", image: jackyImage, color: "from-violet-500 to-purple-500", bg: "bg-violet-950" }
  ];

  const pillars = [
    {
      icon: <PaletteIcon className="w-6 h-6" />,
      title: "1. The Fusion Lab",
      desc: "Don't just choose a character. Build one. Your child's imagination + our AI = A 3D hero that lasts forever.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BookIcon className="w-6 h-6" />,
      title: "2. The Plot World",
      desc: "Bedtime reimagined. You and your child co-direct the plot, and we generate a 5-page book with animated climaxes.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <SchoolIcon className="w-6 h-6" />,
      title: "3. The Classroom",
      desc: "Learning is easier when it's fun. Your custom character teaches math, reading, and science lessons.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <GameIcon className="w-6 h-6" />,
      title: "4. The Playground",
      desc: "Play casual games starring YOUR character. Why play Mario when you can play as 'Detective Dash'?",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <ChatIcon className="w-6 h-6" />,
      title: "5. Comm Rooms",
      desc: "Build confidence. Your child can text or FaceTime their character to practice social skills in a safe space.",
      color: "from-rose-500 to-red-500"
    }
  ];

  const testimonials = [
    { quote: "For the first time, bedtime isn't a battle. My daughter asks for 'Sparkle stories' every night.", author: "David M.", role: "Father of Emma, 6", rating: 5 },
    { quote: "The 'Ikea Effect' is real. Because he built the Raccoon himself, he listens to it when it teaches him math.", author: "Michael R.", role: "Father of James, 5", rating: 5 },
    { quote: "Finally, an app that makes ME the hero sidekick instead of replacing me with a screen.", author: "Sarah K.", role: "Mother of Lily, 7", rating: 5 }
  ];

  // Auto-advance hero character on tablet to show "Live" demo feel
  useEffect(() => {
    const charInterval = setInterval(() => setCharacterIndex(i => (i + 1) % characters.length), 3000);
    const testInterval = setInterval(() => setTestimonialIndex(i => (i + 1) % testimonials.length), 5000);
    return () => { clearInterval(charInterval); clearInterval(testInterval); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0A16] text-white selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0A16]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Babu Media</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#pillars" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">The 5 Pillars</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">How It Works</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2 rounded-full text-sm font-semibold transition-all">
            Login
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Copy */}
          <div className="text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
              <MoonIcon className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200 text-sm font-medium">Reimagining Bedtime Stories</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Build Your Own <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                Disney World
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Transform <span className="text-red-500 font-semibold">Passive Screen Time</span><br /> into <span className="text-purple-400 font-semibold">Active Bonding</span>. 
              <br />You and your child build the characters, write the stories, and play the games together.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="group relative bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-105 flex items-center gap-2">
                 <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></span>
                 <span className="relative flex items-center gap-2">
                   Start Creating Free
                   <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </span>
              </button>
              <button className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold border border-white/10 hover:bg-white/5 transition-all">
                <PlayIcon className="w-5 h-5" />
                See the Magic
              </button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              <span className="text-emerald-400">★ 4.9/5</span> from 1,000+ Fathers
            </p>
          </div>

          {/* Right: Dynamic Tablet Demo */}
          <div className="relative z-10 flex justify-center lg:justify-end">
            {/* The "Glow" behind tablet */}
            <div className={`absolute inset-0 bg-gradient-to-r ${characters[characterIndex].color} blur-[60px] opacity-30 transition-all duration-1000`}></div>
            
            <div className="relative w-full max-w-md bg-slate-900 rounded-[2.5rem] border-[8px] border-slate-800 shadow-2xl overflow-visible">
              {/* Fake Tablet UI Header */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-slate-800 z-20 flex justify-center items-center rounded-t-[2rem]">
                 <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
              </div>

              {/* Dynamic Screen Content */}
              <div className={`relative pt-6 transition-all duration-1000 ${characters[characterIndex].bg} flex flex-col min-h-[600px] rounded-[2.5rem]`}>
                {/* Top Bar */}
                <div className="p-6 pt-10 flex justify-between items-center gap-2">
                  <button 
                    onClick={() => setCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                    aria-label="Previous character"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <div className="text-base sm:text-lg font-semibold tracking-wide uppercase opacity-70 text-center break-words flex-1 px-2">Make Your Best Friend Come to Life</div>
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                </div>

                {/* Character Preview */}
                <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-4 md:px-6 text-center relative overflow-hidden">
                  <div className="relative mb-4 sm:mb-6 md:mb-8 group">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative text-[5rem] sm:text-[8rem] md:text-[10rem] cursor-pointer flex items-center justify-center overflow-hidden">
                      {characters[characterIndex].image ? (
                        <img
                          src={characters[characterIndex].image}
                          alt={characters[characterIndex].name}
                          className="w-full h-full object-contain rounded-2xl"
                        />
                      ) : (
                        characters[characterIndex].emoji
                      )}
                    </div>
                    {/* Navigation Arrows */}
                    <button
                      onClick={() => setCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
                      aria-label="Previous character"
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => setCharacterIndex((prev) => (prev + 1) % characters.length)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10"
                      aria-label="Next character"
                    >
                      <ChevronRightIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  
                  <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${characters[characterIndex].color} text-sm font-bold mb-4`}>
                    {characters[characterIndex].type}
                  </div>
                  
                  {/* Stats/Traits */}
                  <div className="w-full max-w-xs">
                    <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                      <div className="text-xs opacity-60 uppercase mb-1">Trait</div>
                      <div className="font-semibold">{characters[characterIndex].trait}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-6 pb-8 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="w-full py-4 bg-white text-black font-bold rounded-xl text-center shadow-lg transform active:scale-95 transition-transform">
                    Bring to Life
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-8 text-center divide-x divide-white/10">
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">20m</div>
              <div className="text-gray-400 text-sm mt-1">Avg. Bonding Time</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">3-10</div>
              <div className="text-gray-400 text-sm mt-1">Prime Imagination Years</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">∞</div>
              <div className="text-gray-400 text-sm mt-1">Story Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5 PILLARS (BENTO GRID) --- */}
      <section id="pillars" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              The <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">5 Pillars</span> of Imagination
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Babu Media isn't just a story app. It's a complete digital ecosystem designed to spark creativity and build confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-6 gap-6">
            {/* Feature 1: Large Left */}
            <div className="md:col-span-3 bg-gradient-to-br from-purple-900/40 to-slate-900/40 border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/50 transition-colors group flex flex-col">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillars[0].color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {pillars[0].icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{pillars[0].title}</h3>
              <p className="text-gray-400 leading-relaxed mb-6">{pillars[0].desc}</p>
              <div className="mt-auto aspect-square rounded-xl bg-black/30 border border-white/5 overflow-hidden">
                 <img
                   src={fusionLabImage}
                   alt="Character Fusion Lab UI Preview"
                   className="w-full h-full object-cover rounded-xl"
                 />
              </div>
            </div>

            {/* Feature 2: Large Right */}
            <div className="md:col-span-3 bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/20 rounded-3xl p-8 hover:border-blue-500/50 transition-colors group flex flex-col">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillars[1].color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {pillars[1].icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{pillars[1].title}</h3>
              <p className="text-gray-400 leading-relaxed mb-6">{pillars[1].desc}</p>
               <div className="mt-auto aspect-square rounded-xl bg-black/30 border border-white/5 overflow-hidden">
                 <img
                   src={plotWorldImage}
                   alt="Plot World Story Book Preview"
                   className="w-full h-full object-cover rounded-xl"
                 />
              </div>
            </div>

            {/* Feature 3, 4, 5: Smaller Bottom Row */}
            {pillars.slice(2).map((pillar, i) => (
              <div key={i} className="md:col-span-2 bg-slate-900/40 border border-white/10 rounded-3xl p-6 hover:bg-slate-800/40 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4`}>
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-400">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Timeline) --- */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">Magic in <span className="text-purple-400">3 Steps</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line with Glow */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/80 to-purple-500/0 blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/60 to-purple-500/0"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/40 to-pink-500/0 blur-md"></div>
            </div>

            {[
              { step: "01", title: "Create Character", desc: "Pick animal, style, outfit. AI brings it to life.", time: "3 min" },
              { step: "02", title: "Choose Adventure", desc: "Any idea becomes a 5-page illustrated story.", time: "2 min" },
              { step: "03", title: "Read Together", desc: "Swipe through pages. Watch the animated climax.", time: "10 min" }
            ].map((item, index) => (
              <div key={index} className="relative bg-slate-950 border border-white/10 p-8 rounded-2xl text-center z-10">
                <div className="w-24 h-8 bg-slate-900 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-400 font-mono text-sm shadow-lg shadow-purple-900/20">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
                <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-lg">
                  <ClockIcon className="w-3 h-3" /> {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center gap-1">
             {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-6 h-6 text-amber-400" />)}
          </div>
          <h2 className="text-2xl md:text-4xl font-medium leading-relaxed mb-8">
            "{testimonials[testimonialIndex].quote}"
          </h2>
          <div>
            <div className="font-bold text-lg text-white">{testimonials[testimonialIndex].author}</div>
            <div className="text-purple-400">{testimonials[testimonialIndex].role}</div>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setTestimonialIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${testimonialIndex === index ? 'w-8 bg-purple-500' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-[#0B0A16] to-[#1a1630]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-400">Invest in their imagination for less than a movie ticket.</p>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${pricingIndex * 100}%)` }}>
                {/* Free Tier */}
                <div className="min-w-full flex-shrink-0 px-6">
                  <div className={`bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all ${pricingIndex === 0 ? 'scale-100' : 'scale-95 opacity-60'}`}>
                    <div className="text-lg font-semibold mb-2">Explorer</div>
                    <div className="text-4xl font-bold mb-6">$0</div>
                    <ul className="space-y-4 mb-8 text-gray-300">
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-gray-500" /> 1 Character Creation</li>
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-gray-500" /> 1 Story per week</li>
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-gray-500" /> Standard Generation Speed</li>
                    </ul>
                    <button className="w-full py-3 rounded-full border border-white/20 hover:bg-white/10 font-semibold transition-all">
                      Start Free
                    </button>
                  </div>
                </div>

                {/* Premium Tier */}
                <div className="min-w-full flex-shrink-0 px-6">
                  <div className={`relative bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500 rounded-3xl p-8 shadow-2xl shadow-purple-900/50 transition-all ${pricingIndex === 1 ? 'scale-100' : 'scale-95 opacity-60'}`}>
                    <div className="absolute top-0 right-0 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                      MOST POPULAR
                    </div>
                    <div className="text-lg font-semibold mb-2 text-purple-200">Creator</div>
                    <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg font-normal text-purple-300">/mo</span></div>
                    <ul className="space-y-4 mb-8 text-white">
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> 5 Characters</li>
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> 10 Stories per week</li>
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Animated "Climax" Scenes</li>
                    </ul>
                    <button className="w-full py-3 rounded-full bg-white text-purple-900 font-bold hover:shadow-lg hover:shadow-white/20 transition-all">
                      Start 7-Day Free Trial
                    </button>
                  </div>
                </div>

                {/* Pro Tier */}
                <div className="min-w-full flex-shrink-0 px-6">
                  <div className={`relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-all shadow-xl shadow-blue-900/30 ${pricingIndex === 2 ? 'scale-100' : 'scale-95 opacity-60'}`}>
                    <div className="absolute top-0 right-0 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                      COMING SOON
                    </div>
                    <div className="text-lg font-semibold mb-2 text-blue-200">Pro</div>
                    <div className="text-4xl font-bold mb-6">$19.99<span className="text-lg font-normal text-blue-300">/mo</span></div>
                    <ul className="space-y-4 mb-8 text-white">
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Unlimited Characters</li>
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Access to Classroom & Games</li>
                      <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Comm Rooms</li>
                    </ul>
                    <button className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                      Start 7-Day Free Trial
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={() => setPricingIndex((prev) => (prev - 1 + 3) % 3)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
              aria-label="Previous pricing"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setPricingIndex((prev) => (prev + 1) % 3)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
              aria-label="Next pricing"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
            
            {/* Indicator Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setPricingIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    pricingIndex === index 
                      ? 'w-8 bg-purple-500' 
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to pricing ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 items-center">
            {/* Free Tier */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="text-lg font-semibold mb-2">Explorer</div>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="space-y-4 mb-8 text-gray-300">
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-gray-500" /> 1 Character Creation</li>
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-gray-500" /> 1 Story per week</li>
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-gray-500" /> Standard Generation Speed</li>
              </ul>
              <button className="w-full py-3 rounded-full border border-white/20 hover:bg-white/10 font-semibold transition-all">
                Start Free
              </button>
            </div>

            {/* Premium Tier */}
            <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500 rounded-3xl p-8 shadow-2xl shadow-purple-900/50 transform md:scale-105">
              <div className="absolute top-0 right-0 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                MOST POPULAR
              </div>
              <div className="text-lg font-semibold mb-2 text-purple-200">Creator</div>
              <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg font-normal text-purple-300">/mo</span></div>
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> 5 Characters</li>
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> 10 Stories per week</li>
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Animated "Climax" Scenes</li>
              </ul>
              <button className="w-full py-3 rounded-full bg-white text-purple-900 font-bold hover:shadow-lg hover:shadow-white/20 transition-all">
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Pro Tier */}
            <div className="relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/50 transition-colors shadow-xl shadow-blue-900/30">
              <div className="absolute top-0 right-0 bg-gray-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                COMING SOON
              </div>
              <div className="text-lg font-semibold mb-2 text-blue-200">Pro</div>
              <div className="text-4xl font-bold mb-6">$19.99<span className="text-lg font-normal text-blue-300">/mo</span></div>
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Unlimited Characters</li>
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Access to Classroom & Games</li>
                <li className="flex gap-3"><CheckIcon className="w-5 h-5 text-emerald-400" /> Comm Rooms</li>
              </ul>
              <button className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                Start 7-Day Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-black/20 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="font-bold">Babu Media</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <div className="text-xs text-gray-600">
            © 2025 Babu Media. Built for Dads & Kids.
          </div>
        </div>
      </footer>
    </div>
  );
}