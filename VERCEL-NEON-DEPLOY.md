# Vercel + PostgreSQL + Backblaze B2 deployment

This is the production path for the current project.

## Vercel variables

Set these in Vercel → Project → Settings → Environment Variables:

- `DATABASE_URL`
- `DIRECT_URL` (recommended for Prisma migrations)
- `APP_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `STORAGE_PROVIDER=b2`
- `AWS_REGION=us-west-004`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com`

Do not add real secrets to GitHub.

## Build

Vercel build command:

```bash
npm run build
```

The package runs:

```text
prisma migrate deploy
prisma generate
next build
```

The Prisma schema and initial migration are already included.

## Database

For a new production database, let Prisma create the schema from the included migration. Do not manually create duplicate tables.

`DATABASE_URL` is used by the Vercel runtime. `DIRECT_URL` is preferred by `prisma.config.ts` for migration commands.

## Backblaze B2

The bucket must be private.

- `previews/` → private, served with signed URLs
- `originals/` → private, only released after payment approval
- `payment-proofs/` → private, admin-only signed access

Configure the bucket CORS with `backblaze-b2-cors.json`.

## Admin authentication

The admin uses a database-backed session cookie, not NextAuth.

That means `NEXTAUTH_SECRET` is **not required**.

If you see `UNAUTHORIZED`, verify in this order:

1. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in Vercel.
2. `npm run db:seed:prod` was run against the same production database.
3. The seeded email is lowercase and matches the login email.
4. The browser received the `tong_an_session` cookie after login.
5. The deployment uses HTTPS.

## Important

The Backblaze credentials supplied during setup must never be committed to GitHub. If a real Application Key has been pasted into chat, rotate/revoke it in Backblaze and create a fresh key before production.


## Mandatory before Deploy

`DATABASE_URL` is mandatory for the running website. `DIRECT_URL` is recommended for Prisma migrations.
Do not use placeholder values such as `YOUR_POSTGRES_DATABASE_URL`.

For photo uploads, the Backblaze B2 bucket must also have the included CORS rule applied. The bucket should remain private.
