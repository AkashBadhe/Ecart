# API REST (NestJS + MongoDB)

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `api/rest/.env` with required values:

```env
PORT=5050
MONGODB_URI=<your_mongodb_connection_string>
SHOP_URL=http://localhost:3005
API_BASE_URL=http://localhost:5050/api
GOOGLE_CLIENT_ID=<google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<google_oauth_client_secret>
FACEBOOK_CLIENT_ID=<facebook_oauth_client_id>
FACEBOOK_CLIENT_SECRET=<facebook_oauth_client_secret>
```

Google and Facebook OAuth callback URLs (configure in provider console):
- `http://localhost:5050/api/oauth/google/callback`
- `http://localhost:5050/api/oauth/facebook/callback`

## Run

```bash
# development (watch)
pnpm start:dev

# production-style run (build + start)
pnpm start:prod
```

## API URLs
- Base API: `http://localhost:5050/api`
- Swagger: `http://localhost:5050/docs`

## Seed Realistic Data

Script:
- `scripts/seed-realistic-data.js`

Command:

```bash
pnpm run seed:realistic
```

This seeds realistic linked data:
- 5 shops
- ~150 products
- types, categories, tags
- owner users and settings

## Seed Image URLs

Seeder uses Cloudinary-hosted image URLs (example):
- `https://res.cloudinary.com/demo/image/upload/sample.jpg`
