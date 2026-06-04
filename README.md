This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

**FlashBK** is a collectibles trading platform for Hong Kong that aggregates deals across multiple marketplaces (Carousell, Facebook Marketplace, BrickLink, etc.). Users can:

- Browse the lowest-priced collectibles across all supported marketplaces
- Filter by category (Pokémon TCG, LEGO, Hot Toys, Pop Mart, Hot Wheels)
- Set price alerts and compare vendor offers
- Trade verified collectibles with other users

### Key Features

- 🌍 **Multi-Marketplace Aggregator**: Scrapes and normalizes deals from 6+ sources
- 💰 **Deal Scoring**: Automatic deal quality scoring based on price, seller rating, and history
- 🎯 **Smart Filtering**: Category, price range, source, and deal-only filters
- 🏪 **Live Dashboard**: Real-time cheapest deals with status badges (Live/Preview)
- 📊 **Enhanced Cards**: Show discount %, deal score, condition, and marketplace source
- 🔔 **Price Alerts**: Notify users when items drop below their target price
- ✅ **Verified Trading**: Community-driven trust system with ratings and reviews

---

## Documentation

- **[IMPROVEMENTS.md](docs/IMPROVEMENTS.md)** - Comprehensive roadmap of planned enhancements across 7 phases
- **[IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)** - Detailed summary of Phase 1 & 2 implementation (status badges, card metadata)
- **[PROJECT_STATUS.md](docs/PROJECT_STATUS.md)** - Historical project progress and milestones

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
