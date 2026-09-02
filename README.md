# Alsat Bedava

Alsat Bedava is a marketplace application built with React, Vite, Express, tRPC, Drizzle, and MySQL.

## Setup

Install dependencies:

```bash
pnpm install
```

Create an environment file from the example:

```bash
cp .env.example .env
```

Configure these values before running the app:

```bash
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=replace-with-a-long-random-secret

VITE_OAUTH_AUTHORIZE_URL=https://auth.example.com/oauth/authorize
VITE_OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_TOKEN_URL=https://auth.example.com/oauth/token
OAUTH_USERINFO_URL=https://auth.example.com/oauth/userinfo
OAUTH_CLIENT_SECRET=your-oauth-client-secret
VITE_OAUTH_SCOPE=openid profile email
OWNER_OPEN_ID=your-owner-open-id

S3_ENDPOINT=https://s3.example.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=auto
S3_PUBLIC_URL=https://cdn.example.com
```

For temporary friend testing without production services, leave the database,
OAuth, and S3 values unset and set:

```bash
DEMO_MODE=true
JWT_SECRET=replace-with-a-long-random-secret
```

Demo mode uses in-memory data. It is reset whenever the server restarts and is
not intended for a real public launch.

Run database migrations:

```bash
pnpm run db:push
```

Start the development server:

```bash
pnpm run dev
```

## Scripts

```bash
pnpm run check
pnpm test
pnpm run build
pnpm run format
```

## Notes

Authentication uses standard OAuth endpoints configured by environment variables.

File storage uses S3-compatible object storage configured by environment variables.

The saved-search notification job currently logs outgoing emails in test mode. Replace the placeholder in `server/jobs/savedSearchNotifications.ts` with a real email provider before enabling production notifications.
