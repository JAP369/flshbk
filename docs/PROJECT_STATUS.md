# FLSHBK — Project Status

## Vision

A gamified, community-driven marketplace SaaS for toy/card collectors. Think Carousell meets Duolingo for Pop Mart, LEGO, Pokémon cards, Hot Toys, Hot Wheels, and more. Starting with Pokémon cards as the first vertical with a deal aggregator for Hong Kong marketplaces.

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **UI:** Tailwind CSS 4 + Framer Motion (existing dark theme — DO NOT CHANGE)
- **Backend:** Supabase (auth, database, storage, realtime)
- **Deployment:** Vercel
- **Repo:** https://github.com/JAP369/flshbk

## Current State

- Existing UI with 5 pages: Home, Trade Arena, Vault, Lucky Draw, Meetup
- All data is hardcoded/mock
- Dev-only auth context (no real auth)
- No database or backend

## Build Plan (Batches)

### Batch 1: Supabase Foundation ✅ PENDING

- Install Supabase client
- Create database schema (users, listings, trades, reviews, achievements)
- Replace dev auth with Supabase Auth
- Create API helpers and types
- Environment configuration

### Batch 2: Pokémon Card Aggregator ✅ PENDING

- Scrape/aggregate Pokémon card listings from HK marketplaces
- Deduplication and price comparison engine
- Aggregator search page with filters
- Deal alerts system

### Batch 3: Marketplace Listings ✅ PENDING

- CRUD for buy/sell/swap listings
- Image upload to Supabase Storage
- Listing detail pages
- Offer/counter-offer system
- Trade matching algorithm

### Batch 4: Gamification ✅ PENDING

- XP system (earn XP for trades, listings, reviews)
- Collector levels with titles
- Daily streaks
- Achievement badges
- Leaderboard

### Batch 5: Community ✅ PENDING

- User profiles with collection showcase
- Review/rating system for traders
- Follow/following
- Activity feed
- Chat improvements

### Batch 6: Commission & Payments ✅ PENDING

- Platform commission structure (2.5%)
- Escrow-like trade verification
- $NEXUS token economy
- Payout flow

### Batch 7: UX Polish & Launch ✅ PENDING

- Loading states and skeletons
- Error handling
- Toast notifications
- Search improvements
- Performance optimization
- Final push to GitHub

## Conventions

- All docs go in `/docs/`
- Each batch gets a `docs/batch-X.md` file tracking what was done
- Always verify changes are applied before pushing to GitHub
- NEVER change the existing UI theme (dark mode, neon red, glassmorphism)
- Focus on UX improvements and backend functionality
