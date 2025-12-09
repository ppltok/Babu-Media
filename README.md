# 🦊 Babu Media

> Transform passive screen time into active, creative bonding sessions.

Babu Media is a next-generation "Edutainment" platform that empowers children (ages 3-10) and their parents to create personalized characters and stories together using cutting-edge Generative AI.

## 🎯 Vision

We enable families to build their own "Disney World" — creating characters, writing stories, and interacting with their creations. Our platform addresses the "Simplicity Gap" in current children's apps by requiring and rewarding parental involvement, turning a 15-minute digital session into a lasting emotional memory.

## ✨ Core Features

### 🔐 Authentication
- Google Sign-In integration via Supabase Auth
- Secure session management
- Family-safe environment

### 👤 Onboarding
- Child profile creation (name, age, preferences)
- Parent/guardian information
- Personalized experience setup

### 🎬 Style Preferences
- Select favorite children's content styles (Minions, Paw Patrol, Pokemon, Avatar, etc.)
- AI learns preferred visual aesthetics
- Tailored character generation based on preferences

### 🧬 Fusion Lab (Character Creation)
- Choose from curated animal archetypes OR describe via custom prompt
- Define personality traits and visual details
- Generate unique AI characters using Nano Banana Pro
- Save characters as persistent "Anchors"

### 📖 Plot World (Story Generation)
- Write story plotlines with guided prompts
- Claude API generates engaging narratives
- Flux PuLID maintains character consistency across scenes
- Interactive storybook UI with text and generated images

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React Native (Expo) |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth (Google Sign-In) |
| Storage | Supabase Storage |
| LLM | Claude 3.5 Sonnet API |
| Character Gen | Nano Banana Pro |
| Scene Gen | Flux PuLID |

## 📁 Project Structure

```
babu-media/
├── app/                     # React Native app
│   ├── screens/
│   │   ├── Auth/           # Login, signup screens
│   │   ├── Onboarding/     # User onboarding flow
│   │   ├── FusionLab/      # Character creation
│   │   ├── PlotWorld/      # Story creation & reading
│   │   └── Library/        # Story collection
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layers
│   └── utils/              # Helper functions
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── create-character/
│   │   ├── generate-story/
│   │   └── generate-scene-images/
│   └── migrations/         # Database migrations
├── assets/                 # Images, fonts, icons
└── docs/                   # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase Account
- Claude API Key (Anthropic)
- Nano Banana Pro API Key
- Fal.ai Account (for Flux PuLID)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ppltok/Babu-Media.git
   cd Babu-Media
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_claude_api_key
   NANO_BANANA_API_KEY=your_nano_banana_key
   FAL_API_KEY=your_fal_api_key
   ```

4. **Set up Supabase**
   ```bash
   npx supabase init
   npx supabase db push
   npx supabase functions deploy
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```

## 📱 App Screens

| Screen | Description |
|--------|-------------|
| Login | Google authentication |
| Onboarding | Child profile setup & style preferences |
| Fusion Lab | Character creation studio |
| Library | Collection of created stories |
| Story Reader | Interactive storybook view |

## 🔌 API Endpoints (Edge Functions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/create-character` | POST | Generate new character with Nano Banana Pro |
| `/generate-story` | POST | Create story narrative with Claude API |
| `/generate-scene-images` | POST | Generate story images with Flux PuLID |

## 💰 Cost Structure (Per Story)

| Action | Provider | Est. Cost |
|--------|----------|-----------|
| Character Creation | Nano Banana Pro | $0.04 |
| Story Script | Claude 3.5 Sonnet | $0.01 |
| 5 Scene Images | Flux PuLID | $0.15 |
| **Total** | | **~$0.20** |

## 🗺️ Roadmap

- **Phase 1 (MVP)**: Fusion Lab + Plot World + iPad App
- **Phase 2**: Communication Rooms (Chat with characters)
- **Phase 3**: Classroom (Educational modules) + Playground (Games)
- **Phase 4**: Physical book printing + Video calls with characters

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Contact

- Website: [ppltok.github.io/Babu-Media](https://ppltok.github.io/Babu-Media)
- Email: contact@babumedia.com

---

Built with ❤️ for families who want to create together.
