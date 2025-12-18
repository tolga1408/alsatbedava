# Deployment Readiness Checklist - Alsatbedava.com

**Last Updated**: December 18, 2024  
**Status**: Ready for Manus Deployment (with configuration)

---

## ✅ What's Already Done

### Core Application
- ✅ **Full-stack marketplace application** built with React 19 + Node.js 22
- ✅ **Database schema** defined with Drizzle ORM (MySQL/TiDB compatible)
- ✅ **User authentication** via Manus OAuth integration
- ✅ **Listing management** (create, edit, delete, search)
- ✅ **Interactive map** with Leaflet.js and marker clustering
- ✅ **Saved searches** with email notification toggles
- ✅ **Messaging system** for buyer-seller communication
- ✅ **Image upload** to S3-compatible storage
- ✅ **Mobile-responsive design** with Tailwind CSS 4

### Backend Infrastructure
- ✅ **tRPC API** with type-safe endpoints
- ✅ **Express server** configured for production
- ✅ **Database migrations** ready with Drizzle Kit
- ✅ **Seed data script** (30 demo listings)
- ✅ **Build scripts** for production deployment
- ✅ **Admin panel** with manual notification trigger

### Email Notification System
- ✅ **Notification job logic** implemented (`server/jobs/savedSearchNotifications.ts`)
- ✅ **tRPC endpoint** for triggering notifications (admin-only)
- ✅ **Admin UI** for manual testing
- ✅ **Test file** for notification job
- ⚠️ **Email service integration** pending (currently logs to console)

---

## 🔧 Required Before Deployment

### 1. Environment Variables Setup

Create a `.env` file or configure in Manus dashboard with these variables:

```bash
# Database (provided by Manus)
DATABASE_URL=mysql://username:password@host:port/database_name

# Authentication (provided by Manus)
JWT_SECRET=your-jwt-secret-here
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your-manus-app-id

# Storage (provided by Manus)
S3_ENDPOINT=your-s3-endpoint
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=auto

# Application
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Alsatbedava.com
VITE_APP_LOGO=/logo.png

# Owner (for notifications)
OWNER_OPEN_ID=your-manus-open-id
```

### 2. Database Setup

**On Manus Platform:**
1. Database is automatically provisioned
2. Run database migrations:
   ```bash
   pnpm db:push
   ```
3. (Optional) Seed demo data:
   ```bash
   node seed-db.mjs
   ```

**Manual Setup:**
- Ensure MySQL 8.0+ or TiDB is available
- Create database: `CREATE DATABASE alsatbedava;`
- Run migrations as above

### 3. Email Service Integration (Optional but Recommended)

The notification system is ready but needs an email service. Choose one:

**Option A: SendGrid (Recommended)**
```bash
pnpm add @sendgrid/mail
```
Add to `.env`:
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
```

**Option B: AWS SES**
```bash
pnpm add @aws-sdk/client-ses
```
Add to `.env`:
```bash
AWS_SES_REGION=eu-west-1
AWS_SES_ACCESS_KEY=your-access-key
AWS_SES_SECRET_KEY=your-secret-key
```

**Option C: Resend**
```bash
pnpm add resend
```
Add to `.env`:
```bash
RESEND_API_KEY=your-resend-api-key
```

Then update `server/jobs/savedSearchNotifications.ts` (lines 38-65) to replace the test mode with actual email sending.

---

## 🚀 Deployment Steps (Manus Platform)

### Step 1: Create Manus Project
1. Go to https://manus.im
2. Create new project: **Web App with Database and User Auth**
3. Select features:
   - ✅ Server (Node.js)
   - ✅ Database (MySQL/TiDB)
   - ✅ User Authentication (OAuth)
   - ✅ File Storage (S3)

### Step 2: Connect GitHub Repository
1. In Manus dashboard, go to **Settings** → **GitHub Integration**
2. Connect repository: `tolga1408/alsatbedava`
3. Select branch: `main`
4. Auto-deploy on push: ✅ Enabled

### Step 3: Configure Environment Variables
1. In Manus dashboard, go to **Settings** → **Environment Variables**
2. Add all variables from section 1 above
3. Manus auto-fills: `DATABASE_URL`, `JWT_SECRET`, OAuth vars, S3 vars

### Step 4: Deploy
1. Click **Deploy** button in Manus dashboard
2. Wait for build to complete (~2-3 minutes)
3. Manus will:
   - Install dependencies (`pnpm install`)
   - Build frontend (`vite build`)
   - Build backend (`esbuild server`)
   - Start server (`node dist/index.js`)

### Step 5: Initialize Database
1. In Manus dashboard, open **Terminal**
2. Run migrations:
   ```bash
   pnpm db:push
   ```
3. (Optional) Seed demo data:
   ```bash
   node seed-db.mjs
   ```

### Step 6: Verify Deployment
1. Visit your Manus URL (e.g., `https://your-app.manus.app`)
2. Test login with Manus OAuth
3. Create a test listing
4. Search and filter listings
5. Test map view
6. Create a saved search

---

## 📧 Setting Up Automated Notifications

### Option 1: Manual Trigger (Current)
1. Login as admin user
2. Go to `/admin` page
3. Click "Bildirimleri Manuel Tetikle" button
4. Check console logs for results

### Option 2: Scheduled Cron Job (Recommended)

**Using Manus Scheduler:**
1. In Manus dashboard, go to **Jobs** → **Create Job**
2. Name: `Saved Search Notifications`
3. Schedule: `0 */12 * * *` (every 12 hours)
4. Command: `node -e "import('./dist/index.js').then(m => m.processSavedSearchNotifications())"`
5. Save and enable

**Using External Cron (Alternative):**
- Use a service like **cron-job.org** or **EasyCron**
- Schedule HTTP POST to: `https://your-app.manus.app/api/trpc/savedSearches.triggerNotifications`
- Include admin auth token in headers

**Using Node.js Cron (In-App):**
```bash
pnpm add node-cron
```

Create `server/jobs/scheduler.ts`:
```typescript
import cron from 'node-cron';
import { processSavedSearchNotifications } from './savedSearchNotifications';

// Run every 12 hours at 8 AM and 8 PM
cron.schedule('0 8,20 * * *', async () => {
  console.log('[Scheduler] Running saved search notifications...');
  await processSavedSearchNotifications();
});

export function startScheduler() {
  console.log('[Scheduler] Started - notifications will run every 12 hours');
}
```

Add to `server/_core/index.ts`:
```typescript
import { startScheduler } from '../jobs/scheduler';

// After server starts
startScheduler();
```

---

## 🔍 Post-Deployment Verification

### Functional Tests
- [ ] Homepage loads correctly
- [ ] User can login via Manus OAuth
- [ ] User can create a listing with images
- [ ] Search and filters work
- [ ] Map view displays listings
- [ ] Saved searches can be created
- [ ] Messaging works between users
- [ ] Admin panel accessible (admin users only)

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Map renders smoothly with 30+ markers
- [ ] Image uploads work
- [ ] No console errors

### Security Tests
- [ ] Non-admin users cannot access `/admin`
- [ ] Users can only edit/delete their own listings
- [ ] SQL injection protection (Drizzle ORM handles this)
- [ ] XSS protection (React handles this)

---

## 📊 Monitoring & Analytics (Recommended)

### Error Monitoring
**Sentry** (Free tier available):
```bash
pnpm add @sentry/node @sentry/react
```

Add to `.env`:
```bash
SENTRY_DSN=your-sentry-dsn
```

### Analytics
**Google Analytics** or **Plausible** (privacy-friendly):
```bash
pnpm add react-ga4
```

Add to `.env`:
```bash
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🎯 Launch Checklist

### Pre-Launch (Do These First)
- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] Deployment successful and verified
- [ ] Email service integrated (or scheduled for later)
- [ ] Admin account created and tested
- [ ] Terms of Service page created
- [ ] Privacy Policy page created
- [ ] Contact information added

### Launch Day
- [ ] Point custom domain (if purchased)
- [ ] Enable SSL certificate (Manus auto-provides)
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Announce on social media
- [ ] Monitor error logs

### Post-Launch (First Week)
- [ ] Monitor user signups
- [ ] Check for errors in Sentry
- [ ] Review analytics data
- [ ] Gather user feedback
- [ ] Fix any critical bugs
- [ ] Enable automated email notifications

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (requires 22+)
- Verify all dependencies installed: `pnpm install`
- Check TypeScript errors: `pnpm check`

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from server
- Ensure migrations ran: `pnpm db:push`

### OAuth Login Not Working
- Verify `VITE_APP_ID` matches Manus app ID
- Check `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL`
- Ensure `JWT_SECRET` is set

### Images Not Uploading
- Verify S3 credentials in environment variables
- Check S3 bucket permissions
- Ensure CORS is configured on S3 bucket

### Notifications Not Sending
- Check if email service is configured
- Verify admin user can access `/admin`
- Check console logs for errors
- Ensure saved searches exist with `emailNotifications=1`

---

## 📝 Notes

### Free vs Paid Model
- Current README mentions "200 TL/month" pricing
- You indicated the site will be **free** (at least initially)
- Update marketing materials to reflect free model
- Consider future monetization: premium features, ads, or donations

### Missing Files
- No `.env.example` file in repository
- Consider creating one as a template for contributors

### Next Steps After Deployment
1. Test the notification system with real users
2. Integrate email service (SendGrid recommended)
3. Set up automated cron job for notifications
4. Add Terms of Service and Privacy Policy pages
5. Implement analytics and error monitoring
6. Optimize for SEO (meta tags, sitemap)
7. Launch marketing campaign

---

## ✅ Summary

**The application is deployment-ready** with these caveats:

1. ✅ **Code is complete** - All features implemented
2. ✅ **Database schema ready** - Migrations prepared
3. ✅ **Build process works** - Tested locally
4. ⚠️ **Environment variables needed** - Must configure in Manus
5. ⚠️ **Email service pending** - Currently in test mode
6. ⚠️ **Cron job not automated** - Manual trigger only

**Recommended deployment path:**
1. Deploy to Manus platform (easiest, all infrastructure provided)
2. Configure environment variables
3. Run database migrations
4. Test core functionality
5. Integrate email service
6. Set up automated cron job
7. Launch!

**Estimated time to deploy:** 30-60 minutes (assuming Manus account ready)
