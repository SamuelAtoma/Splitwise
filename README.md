# SPLITWI$E

A location-based group shopping app that helps people in Nigeria pool online orders to split delivery fees and save money together.

---

## What It Does

SPLITWI$E lets users find nearby shoppers ordering from the same platform (Jumia, Konga, Amazon, etc.), form a group, coordinate via chat, and split the delivery cost equally — so everyone pays less.

**Core Flow:**
1. User opens the app and grants location access
2. The map shows nearby shoppers within a chosen radius (1–20km)
3. User taps a shopper pin → starts a group chat
4. The group coordinates their orders and goes live on the map
5. Delivery fee is split between all members

---

## Screens

| Screen | Description |
|---|---|
| **Onboarding** | 4-slide intro walkthrough |
| **Auth** | Email/password sign up & sign in |
| **Profile Setup** | Display name, avatar emoji, theme color |
| **Dashboard** | Stats overview (savings, groups, orders) |
| **Nearby Map** | Live Mapbox map with nearby shoppers |
| **Group Orders** | Create and manage group orders |
| **Chat** | Real-time group chat with bot assistant |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 55) |
| Language | TypeScript |
| Navigation | React Navigation (stack, drawer, bottom tabs) |
| Maps (Web) | Mapbox GL JS v2.15 |
| Maps (Native) | @rnmapbox/maps |
| Location | expo-location |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| State | Zustand |
| Chat UI | react-native-gifted-chat |
| Bundler | Metro (with CSS enabled) |
| Deployment | Vercel (web) |

---

## Project Structure

```
splitwise/
├── App.tsx                  # Root component — auth flow & screen routing
├── index.ts                 # Expo entry point
├── index.html               # Web HTML shell
├── lib/
│   └── supabase.ts          # Supabase client setup
├── components/
│   ├── Onboarding.tsx       # Onboarding slides
│   ├── AuthScreen.tsx       # Sign up / Sign in
│   ├── ProfileSetup.tsx     # Avatar & display name setup
│   ├── Dashboard.tsx        # Home dashboard
│   ├── DrawerNavigator.tsx  # Navigation shell (drawer + tabs)
│   ├── MapScreen.tsx        # Live map with Mapbox
│   ├── ChatScreen.tsx       # Group chat interface
│   └── GroupOrdersScreen.tsx # Group order management
├── assets/                  # Icons & splash screens
├── babel.config.js          # Babel config (babel-preset-expo)
├── metro.config.js          # Metro config (CSS enabled for web)
├── vercel.json              # Vercel deployment config
└── .env                     # Local env variables (not committed)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo`)
- A [Mapbox](https://mapbox.com) account (for the map token)
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/SamuelAtoma/Splitwise.git
cd Splitwise
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token_here
```

### Running the App

```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

---

## Supabase Schema

The app uses the following core tables:

| Table | Purpose |
|---|---|
| `profiles` | User profile data (name, avatar, theme) |
| `groups` | Group orders (market, pool status, location) |
| `group_members` | Group membership (group_id, user_id) |
| `messages` | Chat messages (content, sender, is_bot flag) |
| `map_users` | Live location data for the map |
| `markets` | Supported markets list |

---

## Deployment

The app deploys to Vercel via GitHub. On every push to `main`, Vercel:

1. Runs `npm run build:web` → `expo export --platform web`
2. Serves the `dist/` output as a static site
3. Rewrites all routes to `index.html` for SPA navigation

**Required Vercel Environment Variable:**
```
EXPO_PUBLIC_MAPBOX_TOKEN = your_mapbox_public_token
```

---

## Supported Markets

Jumia · Konga · Amazon · Jiji · Temu · AliExpress · Shoprite · Slot

---

## License

Private — All rights reserved.
