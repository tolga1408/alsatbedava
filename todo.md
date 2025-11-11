# Alsatbedava.com - Development TODO

**Project Vision:** Fair marketplace platform for Turkey - starting with Emlak, expanding to all categories

**Brand:** Alsatbedava.com ("Buy, Sell, Free")  
**Tagline:** "Al, sat, komisyon ödeme — hepsi bedava!"  
**Positioning:** Free alternative to Sahibinden's high fees

---

## REDESIGN PHASE - World-Class UI/UX

### Design System
- [x] Research best marketplace designs (Airbnb, Zillow, Rightmove, Idealista)
- [x] Research Turkish marketplace expectations (Sahibinden, Hepsiemlak, Hürriyet Emlak)
- [x] Choose new color palette (Green/Emerald - trust & fairness vs Sahibinden's yellow)
- [x] Create typography system
- [x] Design component library
- [x] Create spacing/layout system

### Homepage Redesign
- [x] Hero section with search and stats
- [x] Trust signals (12,847 listings, 45,231 users, 3,421 sales)
- [x] Featured listings grid with photos
- [x] Category cards with better visuals
- [x] Social proof section ("Neden Alsatbedava?")
- [x] Strong CTA section
- [x] Mobile-optimized layout

### Listing Pages Redesign
- [x] Information-dense listing cards with phone/message buttons
- [x] Better photo galleries with navigation
- [x] Prominent contact buttons (WhatsApp, Phone, Message)
- [x] View counters on cards
- [x] Verification badges
- [ ] Similar listings section

### Advanced Features
- [ ] Demo/seed listings with real photos for showcase
- [x] Advanced filters (15 cities, price ranges with quick filters)
- [ ] Map integration
- [ ] Save search functionality
- [ ] Comparison tool

---

## Phase 1: Database Schema & Core Models
- [x] Design listings table (categories, pricing, location, images)
- [x] Design categories table (hierarchical structure)
- [x] Design favorites/watchlist table
- [x] Design messages table (buyer-seller communication)
- [x] Design reports/moderation table
- [x] Push database schema

## Phase 2: Core Backend (COMPLETE)
- [x] Database query functions for listings
- [x] Database query functions for categories
- [x] Database query functions for favorites
- [x] Database query functions for messages
- [x] tRPC API routes for all features

## Phase 3: Listing Features (COMPLETE)
- [x] Create listing form (multi-step wizard)
- [x] Image upload with S3 (drag & drop, preview)
- [x] Category selection
- [x] Location picker
- [x] Price input

## Phase 4: Search & Browse (COMPLETE)
- [x] Homepage with listings
- [x] Browse page with filters
- [x] Search functionality
- [x] Listing detail page

## Phase 5: Messaging (COMPLETE)
- [x] Message inbox
- [x] Chat interface
- [x] Send/receive messages
- [x] Unread indicators

## Phase 6: User Dashboard (COMPLETE)
- [x] My listings page
- [x] Delete listings

## Map View Feature (NEW)
- [x] Install Leaflet and React-Leaflet dependencies
- [x] Create MapView component with listing markers
- [x] Add map/list toggle to browse page
- [x] Implement custom price markers with popups
- [x] Add clickable markers with listing previews
- [x] Sync map bounds with search filters
- [x] Mobile-responsive map layout

## Search As I Move Map Feature (NEW)
- [x] Update MapView to expose bounds change callback
- [x] Add map bounds to search query parameters
- [x] Implement backend filtering by geographic bounds (city-level)
- [x] Add auto-update toggle in UI
- [x] Implement debouncing for smooth performance (500ms)
- [x] Show visual feedback when updating
- [x] Add refresh button for manual updates

## Marker-to-Listing Highlight Feature (NEW)
- [x] Add highlighted listing state in Browse page
- [x] Implement auto-scroll to highlighted listing
- [x] Update MapView to pass listing ID on marker click
- [x] Add visual highlight styles to listing cards (ring-4 ring-primary with scale-105)
- [x] Clear highlight when clicking elsewhere (3 second auto-clear)
- [x] Add smooth transition animations

## Split-Screen View Feature (NEW)
- [x] Add "Bölünmüş" (Split) view mode option
- [x] Update view toggle UI with three buttons (Liste/Harita/Bölünmüş)
- [x] Implement side-by-side layout for desktop (50/50 split with lg:flex-row)
- [x] Add responsive stacked layout for mobile (flex-col on mobile)
- [x] Ensure marker highlighting works in split view
- [x] Test auto-scroll behavior in split view
- [x] Add smooth transitions between view modes

## Database Seed Script (NEW)
- [x] Create seed-db.mjs script with realistic Turkish property data
- [x] Add 30 listings across Istanbul, Ankara, Izmir
- [x] Include property photos from Unsplash
- [x] Vary property types (apartment, house, villa, land, office, shop)
- [x] Realistic Turkish addresses and districts
- [x] Varied price ranges (1.1M - 15M TL)
- [x] Run seed script to populate database

## Draggable Split Divider (NEW)
- [x] Add draggable divider component between map and list panels
- [x] Implement mouse drag functionality with useEffect
- [x] Set min/max constraints (30% - 70%)
- [x] Update panel widths dynamically during drag
- [x] Add visual feedback (cursor, hover state, icon)
- [x] Persist split ratio in localStorage

## localStorage Persistence (NEW)
- [x] Save/restore view mode (Liste/Harita/Bölünmüş)
- [ ] Save/restore filter values (city, price range, search) - filters not persisted yet
- [x] Save/restore split ratio preference
- [x] Save/restore auto-update toggle state
- [x] Implement useLocalStorage custom hook
- [x] Handle edge cases (invalid data, version changes)
