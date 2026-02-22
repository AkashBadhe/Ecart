
# Ecart

## Introduction
Ecart is a multi-store e-commerce monorepo with:
- REST API (`api/rest`, NestJS + MongoDB)
- Admin Panel (`admin/rest`, Next.js)
- Shop Frontend (`shop`, Next.js)

## Prerequisites
- Node.js 18+
- pnpm 10+
- MongoDB Atlas/local MongoDB connection string

## Environment Setup
Create/fill these environment files:
- `api/rest/.env`
- `admin/rest/.env`
- `shop/.env`

Minimum important values:
- `api/rest/.env` → `PORT=5050`, `MONGODB_URI=...`
- `admin/rest/.env` → `NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:5050/api`
- `shop/.env` → `NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:5050/api`, `FRAMEWORK_PROVIDER=rest`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...`

## OAuth Setup (Google & Facebook Login)

### Google OAuth Configuration

1. **Create OAuth Client ID** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Authorized redirect URIs**:
   - Local: `http://localhost:5050/api/oauth/google/callback`
   - Production: `https://your-api-domain.com/api/oauth/google/callback`
3. **Authorized JavaScript origins**:
   - Local: `http://localhost:5050`
   - Production: `https://your-api-domain.com`
4. **Add credentials to `api/rest/.env`**:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   API_BASE_URL=http://localhost:5050/api
   ```

### Facebook OAuth Configuration

1. **Create Facebook App** in [Meta for Developers](https://developers.facebook.com/)
2. **Add Facebook Login product** to your app
3. **Valid OAuth Redirect URIs**:
   - Local: `http://localhost:5050/api/oauth/facebook/callback`
   - Production: `https://your-api-domain.com/api/oauth/facebook/callback`
4. **Site URL** (Settings > Basic):
   - Local: `http://localhost:5050`
   - Production: `https://your-api-domain.com`
5. **Add credentials to `api/rest/.env`**:
   ```
   FACEBOOK_CLIENT_ID=your_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
   API_BASE_URL=http://localhost:5050/api
   ```

### Google Maps API Setup

For address autocomplete and map picker features:

1. **Enable APIs** in [Google Cloud Console](https://console.cloud.google.com/apis/library):
   - Maps JavaScript API
   - Places API
   - Geocoding API
2. **Create API Key** with restrictions (HTTP referrers for production)
3. **Add to `shop/.env`**:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

## Install Dependencies
From repository root:

```bash
pnpm install
```

## Run (REST stack)

### Option A: Start all REST apps together
```bash
pnpm dev:rest
```

### Option B: Start individually
```bash
# API
pnpm --dir api/rest start:dev

# Admin REST
pnpm --dir admin/rest dev

# Shop REST
pnpm --dir shop dev:rest
```

## URLs
- REST API: `http://localhost:5050/api`
- Swagger: `http://localhost:5050/docs`
- Admin REST: `http://localhost:3002`
- Shop REST: `http://localhost:3005`

## Seed Realistic Dummy Data
We added a realistic seeding script that creates:
- 5 shops
- 150 products
- types, categories, tags, owner users, and settings

Run:

```bash
pnpm --dir api/rest run seed:realistic
```

Seed script location:
- `api/rest/scripts/seed-realistic-data.js`

## Seed Image URL Source
Seeded product/shop images use Cloudinary-hosted URLs (example):
- `https://res.cloudinary.com/demo/image/upload/sample.jpg`

For Next.js image rendering, `res.cloudinary.com` is configured in `shop/next.config.js` and `admin/rest/next.config.js`.
