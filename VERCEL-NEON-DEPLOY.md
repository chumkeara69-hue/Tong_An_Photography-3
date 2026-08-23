# Tong An Photography — Vercel + Neon deployment

This package has been cleaned for deployment and includes:
- fixed `src/lib/storage.ts` (removed literal `\\n` source corruption)
- fixed `/api/photos` to include `category`
- fixed `/cart` to render `useSearchParams()` inside `Suspense`
- Prisma migration already included at `prisma/migrations/00000000000000_init`
- Vercel build now runs `prisma migrate deploy` automatically before Next.js build
- Neon environment-variable template in `.env.vercel.neon`

## Important: use a fresh Neon database/branch

The earlier manual SQL tables may not exactly match the Prisma enums/schema.
For the cleanest deployment, use a fresh Neon database/branch and let the included
Prisma migration create everything. Do not manually create the tables in SQL Editor.

## Vercel Environment Variables

Add these in Vercel for Production (and Preview only if you intentionally share the same DB):

- `DATABASE_URL` = Neon pooled connection string
- `DIRECT_URL` = Neon direct/unpooled connection string
- `APP_URL` = your Vercel URL
- `ADMIN_EMAIL` = your admin email
- `ADMIN_PASSWORD` = a long unique password
- `STORAGE_PROVIDER` = `s3`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_PUBLIC_BASE_URL` = leave empty unless you intentionally use a public base URL
- `S3_SSE` = `AES256`

Never commit real secrets to GitHub.

## Vercel

Build command:
`npm run build`

The build command automatically runs:
`prisma migrate deploy && prisma generate && next build`

This means the committed migration creates the database tables automatically during deployment.
The migration must be used against the intended Neon database.

## After the first successful deployment

Open the Vercel URL and test:
- homepage
- `/photos`
- `/cart`
- login/admin
- checkout/order flow
- payment proof upload
- download flow

S3 credentials are still required for production uploads/downloads.
