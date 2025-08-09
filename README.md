## Share — Mobile-first social app UI (React + TypeScript + Vite)

A modern, mobile-first social app UI with a glassmorphism aesthetic. Built with React 18, TypeScript, Vite, and React Router. Optimized for phones with a bottom navigation and smooth, infinite-scrolling feed.

### ✨ Features

- **📱 Mobile-first layout** with bottom navigation that auto-hides on scroll
- **🏠 Home feed** with infinite scroll using a container-based hook
- **🎞️ Shorts** placeholder screen
- **👤 Profile** page with stats and settings tabs
- **🔐 Auth** screen with basic validation and password strength meter
- **🎨 Glassmorphism** styling and dark theme
- **🧭 Routing** via React Router v6

### 🧰 Tech Stack

- React 18, TypeScript
- Vite 5 (dev server and build)
- React Router v6
- lucide-react icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (required by Vite 5)
- npm (or another Node package manager)

### Install & Run

```bash
git clone <your-repo-url>
cd sharebeta
npm install

# Start dev server
npm run dev  # alias: npm start
# Open http://localhost:5173

# Expose on local network
npm run start:network

# Production build + preview
npm run build
npm run preview  # http://localhost:4173
```

### Available Scripts

- `npm run dev` / `npm start`: Start Vite dev server
- `npm run start:network`: Dev server bound to your LAN IP
- `npm run build`: Production build
- `npm run preview`: Preview the production build locally
- `npm test`: Placeholder message (no test runner configured)

## 📁 Project Structure

```
src/
  components/
    BottomNavigation.tsx
    PostCard.tsx
  contexts/
    UIContext.tsx              # Scroll state + home reclick handler
  hooks/
    useInfiniteScroll.ts       # Window and container-based variants
  pages/
    Home.tsx                   # Infinite-scrolling feed
    Shorts.tsx                 # Placeholder screen
    Profile.tsx                # Stats + settings tabs
    Auth.tsx                   # Login/Register UI
  App.tsx                      # Routes and layout shell
  main.tsx                     # App bootstrap
```

### 🧭 Routes

- `/` → Home
- `/shorts` → Shorts
- `/profile` → Profile
- `/auth` → Auth (bottom nav hidden on this route)

## 🎨 Styling

- Plain CSS files per page/component (glassmorphism and dark theme)
- Font: Inter via Google Fonts

## 🔧 Customization

- Colors and theme tokens live in `src/index.css`
- Add components in `src/components/`, pages in `src/pages/`
- Register new routes in `src/App.tsx`

## 📦 Notes

- A basic `manifest.json` is provided; no service worker is configured by default
- Linting is configured via `eslint.config.js`

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/awesome`)
3. Commit (`git commit -m "feat: add awesome"`)
4. Push and open a PR

— Built with ❤️ using React, TypeScript, and Vite.