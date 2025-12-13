# Alsatbedava.com - Fair Marketplace for Turkey

**Al, sat, komisyon ödeme — hepsi bedava!**

A modern, commission-free marketplace platform for Turkey, designed to compete with Sahibinden by offering a fairer, more affordable alternative for buyers and sellers.

🌐 **Live Demo**: [Your Manus deployment URL]  
📦 **GitHub**: https://github.com/tolga1408/alsatbedava

---

## 🎯 Vision

Alsatbedava.com aims to disrupt the Turkish classifieds market by eliminating the high commission fees that burden sellers on traditional platforms like Sahibinden (2,000 TL/month for real estate agents). Our mission is to create a truly fair marketplace where everyone can buy and sell without financial barriers.

### Key Differentiators

- **10x Lower Cost**: 200 TL/month vs Sahibinden's 2,000 TL/month
- **Zero Commission**: No transaction fees, no hidden costs
- **Modern UX**: Interactive map views, split-screen browsing, saved searches
- **Mobile-First**: Responsive design optimized for Turkish users
- **Advanced Features**: District-level filtering, listing comparison, email notifications

---

## 🚀 Features

### Core Marketplace
- ✅ **Multi-category listings** (Real Estate, Vehicles, Electronics, etc.)
- ✅ **Advanced search & filters** (City, district, price range, category)
- ✅ **Rich media support** (Multiple photos per listing, Unsplash integration)
- ✅ **User authentication** (Manus OAuth integration)
- ✅ **Listing management** (Create, edit, delete, status tracking)

### Map & Location
- ✅ **Interactive map view** with Leaflet.js & OpenStreetMap
- ✅ **Marker clustering** for performance with hundreds of listings
- ✅ **Precise lat/lng coordinates** for accurate property positioning
- ✅ **Split-screen mode** (map + list simultaneously)
- ✅ **Search as you move** with auto-update and debouncing
- ✅ **District-level filtering** (10+ districts for Istanbul, Ankara, Izmir)

### User Experience
- ✅ **Saved searches** with email notification toggles
- ✅ **Draggable split divider** (30-70% adjustable ratio)
- ✅ **localStorage persistence** for view preferences
- ✅ **Marker-to-listing highlighting** with auto-scroll
- ✅ **WhatsApp integration** for direct seller contact
- ✅ **View counters** and engagement metrics

### Design & Branding
- ✅ **Green/emerald color scheme** (trust & fairness)
- ✅ **Modern, clean UI** with Tailwind CSS 4 & shadcn/ui
- ✅ **Turkish localization** throughout
- ✅ **Trust signals** (user count, listing count, sales count)
- ✅ **Responsive mobile design**

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Wouter** for routing
- **React-Leaflet** for maps
- **tRPC** for type-safe API calls

### Backend
- **Node.js 22** with Express 4
- **tRPC 11** for end-to-end type safety
- **Drizzle ORM** with MySQL/TiDB
- **Manus OAuth** for authentication
- **Superjson** for seamless Date handling

### Infrastructure
- **Manus Platform** (hosting, database, storage, auth)
- **S3-compatible storage** for images
- **OpenStreetMap** tiles (no API key needed)
- **GitHub** for version control

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 22+
- pnpm (recommended) or npm
- MySQL/TiDB database
- Manus account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/tolga1408/alsatbedava.git
   cd alsatbedava
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy .env.example to .env and fill in your values
   cp .env.example .env
   ```

   Required environment variables:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `OAUTH_SERVER_URL` - Manus OAuth backend
   - `VITE_OAUTH_PORTAL_URL` - Manus login portal
   - `VITE_APP_ID` - Your Manus app ID
   - See `.env.example` for full list

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Seed the database** (optional, for demo data)
   ```bash
   node seed-db.mjs
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

---

## 🚢 Deployment

### Deploy to Manus (Recommended)

Alsatbedava.com is optimized for deployment on the Manus platform, which provides:
- Automatic SSL certificates
- Built-in database (MySQL/TiDB)
- S3-compatible file storage
- OAuth authentication
- Custom domain support
- Zero DevOps overhead

**Steps:**
1. Create a Manus account at https://manus.im
2. Create a new web project with `server`, `db`, and `user` features
3. Push your code or connect your GitHub repository
4. Click "Publish" in the Manus dashboard
5. Your marketplace is live!

### Deploy to Other Platforms

The codebase is platform-agnostic and can be deployed to:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Vercel**: Requires serverless function adaptation
- **VPS**: Use PM2 or Docker

**Note**: External hosting requires manual setup of:
- MySQL database
- S3-compatible storage (AWS S3, Cloudflare R2, etc.)
- OAuth provider (or replace with Auth.js)
- Environment variables

---

## 📊 Database Schema

### Core Tables
- **users** - User accounts (OAuth integration)
- **categories** - Listing categories (hierarchical)
- **listings** - Marketplace listings with location data
- **messages** - User-to-user messaging
- **reports** - Content moderation
- **savedSearches** - User saved search preferences

### Key Fields
- Listings include `latitude`, `longitude` for precise map positioning
- District-level location data for granular filtering
- JSON arrays for multiple images per listing
- Status tracking (active, sold, expired)

Run `pnpm db:push` to sync schema changes.

---

## 🎨 Customization

### Branding
- Update `VITE_APP_TITLE` and `VITE_APP_LOGO` in environment variables
- Modify color palette in `client/src/index.css` (CSS variables)
- Replace favicon in `client/public/`

### Categories
- Edit `drizzle/schema.ts` to add/modify categories
- Update category icons in UI components
- Seed new categories via database or admin panel

### Localization
- All Turkish text is in component files
- Create a translation system by extracting strings to `i18n` files
- Support multiple languages with `react-i18next`

---

## 📈 Launch Strategy

### Phase 1: Emlak (Real Estate) Focus
**Target**: Real estate agents in Istanbul, Ankara, Izmir

**Pricing**: 200 TL/month (vs Sahibinden's 2,000 TL/month)

**Marketing Channels**:
1. **Facebook Groups** - Turkish real estate agent communities
2. **LinkedIn** - Direct outreach to emlak offices
3. **Google Ads** - "Sahibinden alternatif" keywords
4. **WhatsApp** - Agent networks and referrals

**Success Metrics**:
- 50 paying agents in first 3 months
- 500+ active listings
- 10,000+ monthly visitors

### Phase 2: Expand Categories
- Vehicles (Araç)
- Electronics (Elektronik)
- Second-hand goods (İkinci El)

### Phase 3: Scale & Monetize
- Premium listings (featured placement)
- Banner advertising
- Lead generation for agents
- Mobile app (iOS/Android)

---

## 🔧 Development Roadmap

### Immediate (Pre-Launch)
- [ ] Email notification cron job for saved searches
- [ ] Listing comparison tool (side-by-side)
- [ ] Advanced property filters (rooms, sqm, age)
- [ ] Admin dashboard for moderation
- [ ] Analytics integration (Google Analytics, Plausible)

### Short-term (Month 1-3)
- [ ] Mobile app (React Native)
- [ ] Payment integration (Stripe, Iyzico)
- [ ] SMS notifications (Twilio)
- [ ] Advanced search (fuzzy matching, autocomplete)
- [ ] SEO optimization (meta tags, sitemaps)

### Long-term (Month 4-12)
- [ ] AI-powered listing recommendations
- [ ] Virtual tours (360° photos)
- [ ] Mortgage calculator
- [ ] Agent verification system
- [ ] Multi-language support (English, Arabic)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Manus Platform** for hosting and infrastructure
- **shadcn/ui** for beautiful UI components
- **OpenStreetMap** for free map tiles
- **Unsplash** for demo property photos
- **Turkish developer community** for inspiration

---

## 📞 Contact & Support

- **Website**: [alsatbedava.com](https://alsatbedava.com)
- **Email**: support@alsatbedava.com
- **GitHub Issues**: https://github.com/tolga1408/alsatbedava/issues
- **Twitter**: @alsatbedava

---

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub! ⭐

---

**Built with ❤️ in Turkey**
