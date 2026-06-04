# FlashBK Improvement Plan

**Last Updated**: June 3, 2026

## Overview

This document outlines a comprehensive improvement plan for the FlashBK collectibles trading platform, focusing on enhancing the dashboard, aggregator, user experience, and data quality.

---

## Phase 1: Dashboard & Aggregator Enhancements (Priority: High)

### 1.1 Live Deal Display with Source Comparison

**Status**: In Progress

- [x] Wire live aggregator data to homepage
- [x] Add fallback to mock data
- [ ] Add vendor badges to each deal card
- [ ] Show deal score alongside price
- [ ] Display source marketplace tag (Carousell, Facebook, etc.)

**Files to Update**:

- `app/page.tsx` - Add source badges and deal score to cards
- `components/CollectibleCard.tsx` - Support source display

**Expected Outcome**: Users see which vendor has the cheapest item and can compare deals at a glance.

---

### 1.2 Dashboard Search & Filters

**Status**: Not Started

- [ ] Add search input on homepage
- [ ] Add category filter pills
- [ ] Add price range filter
- [ ] Add "deals only" toggle
- [ ] Add source/marketplace filter

**Files to Create/Update**:

- `components/DashboardFilters.tsx` - New component for filter UI
- `app/page.tsx` - Integrate filters, wire to aggregator API

**Expected Outcome**: Users can quickly narrow down deals instead of scrolling all categories.

---

### 1.3 Data Status Badge

**Status**: Ready to Implement

- [ ] Show "Live" badge when homepage uses real aggregator data
- [ ] Show "Preview" badge when using mock/fallback data
- [ ] Add timestamp of last update

**Files to Update**:

- `app/page.tsx` - Add status indicator near deal section header

**Expected Outcome**: Users know whether they're seeing real or preview data.

---

## Phase 2: Listing & Card Enhancements (Priority: High)

### 2.1 Real Images Instead of Emojis

**Status**: Partially Complete

- [x] Create placeholder image URLs
- [ ] Integrate `next/image` into `CollectibleCard.tsx`
- [ ] Add fallback for missing images
- [ ] Optimize image loading with dynamic imports

**Files to Update**:

- `components/CollectibleCard.tsx` - Replace emoji cards with images
- `lib/data/mockData.ts` - Ensure all listings have image URLs

**Expected Outcome**: Card listings look professional and match real marketplace items.

---

### 2.2 Enhanced Card Metadata

**Status**: Not Started

- [ ] Show condition badges (Mint, PSA 10, Sealed, etc.)
- [ ] Display seller reputation score
- [ ] Show discount percentage for deals
- [ ] Add "verify source" link

**Files to Update**:

- `components/CollectibleCard.tsx` - Add metadata display
- `lib/types/database.ts` - Ensure types support all metadata

**Expected Outcome**: Users get more context for each listing without leaving the card.

---

### 2.3 Source & Seller Badges

**Status**: Not Started

- [ ] Show marketplace source (Carousell, Facebook, Sideshow, etc.)
- [ ] Add seller/source trust indicators
- [ ] Link to source URL directly from card

**Files to Update**:

- `components/CollectibleCard.tsx` - Add source badge
- `lib/api/aggregator.ts` - Ensure source data is available

**Expected Outcome**: Users can immediately identify where each deal comes from.

---

## Phase 3: Category & Discovery (Priority: Medium)

### 3.1 Trending Categories Display

**Status**: Not Started

- [ ] Add trending deals counter per category
- [ ] Show "most active" sources per category
- [ ] Surface top 3 cheapest items per category

**Files to Update**:

- `app/page.tsx` - Replace static category cards with trending data
- `lib/api/aggregator.ts` - Add trending deals endpoint

**Expected Outcome**: Users quickly discover hot categories and deals.

---

### 3.2 Category Alias Normalization

**Status**: Partially Complete

- [x] Create category mapping in `normalizeCategory()`
- [ ] Add comprehensive tests for all aliases
- [ ] Document supported aliases in README

**Files to Update**:

- `app/api/aggregator/route.ts` - Verify aliases are complete
- `lib/data/categories.ts` - Add alias documentation

**Expected Outcome**: `/categories/tcg`, `/categories/pokemon`, and `/categories/pokemon_card` all work correctly.

---

## Phase 4: Aggregator Data Quality (Priority: Medium)

### 4.1 Enhanced Mock Data Generator

**Status**: Complete

- [x] Create 30 listings per category
- [x] Add realistic titles and pricing
- [x] Support category-specific templates
- [ ] Add more deal score variation
- [ ] Add seller reputation variation

**Files**:

- `lib/data/mockData.ts` - Current implementation

**Next Steps**: Expand templates and add more realistic price variations.

---

### 4.2 Fallback Strategy Improvement

**Status**: In Progress

- [x] Only use mock when live API returns empty
- [ ] Add explicit fallback reason to API response
- [ ] Log fallback triggers for monitoring
- [ ] Cache recent aggregator results

**Files to Update**:

- `app/api/aggregator/route.ts` - Enhance fallback logic
- `lib/api/aggregator.ts` - Add fallback metadata

**Expected Outcome**: Clear distinction between "no data available" and "using cache/mock".

---

## Phase 5: Performance & UX (Priority: Medium)

### 5.1 Image Optimization

**Status**: Not Started

- [ ] Replace `<img>` with `next/image` in category pages
- [ ] Add image lazy loading
- [ ] Implement responsive image sizes
- [ ] Add blur placeholders

**Files to Update**:

- `app/categories/[category]/page.tsx` - Replace `<img>` elements
- `components/CollectibleCard.tsx` - Use `next/image`

**Expected Outcome**: Faster page loads, better Core Web Vitals.

---

### 5.2 Aggregator Request Caching

**Status**: Not Started

- [ ] Add ISR (Incremental Static Regeneration) for homepage
- [ ] Cache aggregator responses for 30 seconds
- [ ] Add cache invalidation on new deal detection

**Files to Update**:

- `app/page.tsx` - Add caching headers
- `app/api/aggregator/route.ts` - Add cache metadata

**Expected Outcome**: Faster dashboard loads, reduced API calls.

---

### 5.3 Mobile-First Layout

**Status**: Partial

- [ ] Test dashboard sections on mobile
- [ ] Adjust category grid for small screens (1 column)
- [ ] Make filter panel mobile-friendly
- [ ] Optimize CollectibleCard for portrait

**Files to Update**:

- `app/page.tsx` - Add responsive grid classes
- `components/DashboardFilters.tsx` - Mobile-friendly filter UI

**Expected Outcome**: Dashboard works seamlessly on phones.

---

## Phase 6: User Personalization (Priority: Low)

### 6.1 Price Alerts from Dashboard

**Status**: Not Started

- [ ] Add quick "set alert" button to each deal card
- [ ] Show user's active alerts on dashboard
- [ ] Add alert notification summary

**Files to Create/Update**:

- `components/SetAlertButton.tsx` - New quick-alert component
- `app/page.tsx` - Integrate alert button

**Expected Outcome**: Users can set alerts directly from the dashboard.

---

### 6.2 Saved Deals & Watchlist

**Status**: Not Started

- [ ] Add "save" button to cards
- [ ] Show saved deals on dashboard (if logged in)
- [ ] Persist to database

**Files to Create/Update**:

- `components/SaveDealButton.tsx` - New component
- `app/api/saved-deals/route.ts` - New API route

**Expected Outcome**: Users can bookmark deals for later.

---

### 6.3 Recently Viewed Tracking

**Status**: Not Started

- [ ] Track viewed listings in localStorage or database
- [ ] Show "Recently viewed" section on dashboard
- [ ] Clear history option

**Files to Create/Update**:

- `lib/api/recently-viewed.ts` - New helper
- `app/page.tsx` - Add recently viewed section

**Expected Outcome**: Users easily return to previously viewed deals.

---

## Phase 7: Gamification & Community (Priority: Low)

### 7.1 Deal Finder Badges

**Status**: Not Started

- [ ] Award badge for finding the top deal of the day
- [ ] Award badge for verified listings
- [ ] Display badges on profile and leaderboard

**Files to Update**:

- `lib/data/mockData.ts` - Add badge logic
- `app/leaderboard/page.tsx` - Display badges

**Expected Outcome**: Encourages user engagement with deals.

---

### 7.2 Marketplace Comparison Page

**Status**: Not Started

- [ ] Add `/comparisons` page
- [ ] Show lowest/highest prices by source per category
- [ ] Generate weekly price reports

**Files to Create**:

- `app/comparisons/page.tsx` - New comparison page
- `lib/api/comparisons.ts` - New analysis helper

**Expected Outcome**: Users get market insights and transparency.

---

## Implementation Roadmap

### Week 1 (Immediate)

1. Dashboard search & filters (Phase 2.2)
2. Data status badge (Phase 1.3)
3. Enhanced card metadata (Phase 2.2)

### Week 2

1. Image optimization & next/image migration (Phase 5.1)
2. Source badges (Phase 2.3)
3. Mobile-first adjustments (Phase 5.3)

### Week 3

1. Trending categories (Phase 3.1)
2. Aggregator caching (Phase 5.2)
3. Fallback strategy improvements (Phase 4.2)

### Week 4+

1. Personalization features (Phase 6)
2. Gamification (Phase 7)
3. Marketplace comparison (Phase 7.2)

---

## Success Metrics

- Dashboard load time < 2s
- 80%+ mobile usability score
- Aggregator API coverage: all 5 categories with 25+ listings each
- User engagement: CTR on deals > 15%
- Mock data fallback rate < 5%

---

## Dependencies & Notes

- Ensure all category aliases are tested before Phase 3
- Coordinate image optimization with CDN strategy
- Schedule aggregator API testing for real marketplace integration
- Plan database schema for saved deals and alerts
