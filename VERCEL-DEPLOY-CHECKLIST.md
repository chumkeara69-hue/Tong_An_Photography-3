# Vercel Deployment Checklist

## 1. Backblaze B2

- Create a **private** bucket.
- Create a new S3-compatible Application Key after revoking any exposed key.
- Give the key access only to the website bucket and the minimum required bucket/object permissions.
- Confirm the B2 region, for example `us-west-004`.
- Apply `backblaze-b2-cors.json` to the bucket.

## 2. PostgreSQL

Set `DATABASE_URL` to the runtime/pooled connection string.
Set `DIRECT_URL` when your provider supplies a direct connection for Prisma migrations.

## 3. Vercel Environment Variables

Required:

- `DATABASE_URL`
- `DIRECT_URL` (recommended for Prisma migrations)
- `APP_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `STORAGE_PROVIDER=b2`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_ENDPOINT`

Do not commit real values to GitHub.

## 4. Deploy

1. Push the clean project to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables for Production, Preview, and Development as needed.
4. Deploy.
5. Prisma migrations run during the build.
6. Run the production seed once with the production database variables.

## 5. Test after deployment

- Admin login succeeds.
- Admin upload returns signed PUT URLs.
- Original and preview uploads complete successfully.
- Gallery preview loads from the private B2 bucket.
- Payment receipt uploads successfully.
- Admin can open the private receipt through a signed URL.
- Approving an order creates download access.
- Download redirects to a short-lived signed B2 URL.
- Expired/over-limit downloads are rejected.
