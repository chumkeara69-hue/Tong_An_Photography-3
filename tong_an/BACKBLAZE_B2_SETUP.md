# Tong An Photography — Backblaze B2 production setup

The website uses **Backblaze B2's S3-compatible API**. The B2 bucket should remain **private**.

## 1. Create the B2 bucket

In Backblaze B2:

1. Create a bucket.
2. Set the bucket to **Private**.
3. Create an Application Key restricted to this bucket.
4. Give the key only the permissions required for this app:
   - `listBuckets` (optional)
   - `listFiles` (optional)
   - `readFiles`
   - `writeFiles`
   - `deleteFiles` is not required by the website.
5. Record:
   - Application Key ID → `AWS_ACCESS_KEY_ID`
   - Application Key → `AWS_SECRET_ACCESS_KEY`
   - Bucket name → `S3_BUCKET`
   - B2 region → `AWS_REGION` (optional if `S3_ENDPOINT` is set)

For `us-west-004`, the S3 endpoint is:

`https://s3.us-west-004.backblazeb2.com`

## 2. Keep the bucket private

Do **not** make `originals/` public.

The app stores only object keys in PostgreSQL:

```text
previews/<id>-<filename>
originals/<id>-<filename>
payment-proofs/<order-id>-<filename>
```

Preview images are also fetched with short-lived signed URLs, so the bucket can stay private.

## 3. Configure B2 CORS

Use `backblaze-b2-cors.json` as the starting policy. Replace the Vercel domain with the exact production origin.

The browser uploads directly to B2 using a presigned `PUT`, so CORS must allow:

- `PUT`
- `GET`
- `HEAD`
- `Content-Type`

Do not leave `AllowedOrigins` as `*` in production.

## 4. Vercel environment variables

Set these for **Production**:

```text
DATABASE_URL
DIRECT_URL
APP_URL
ADMIN_EMAIL
ADMIN_PASSWORD
STORAGE_PROVIDER=b2
AWS_REGION=us-west-004
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET
S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com
```

No `NEXTAUTH_SECRET`, `S3_PUBLIC_BASE_URL`, or `S3_SSE` variable is required by this project.

## 5. Upload flow

Admin → Upload Photo:

1. Admin session is checked server-side.
2. Vercel creates two B2 presigned `PUT` URLs.
3. Browser uploads the original and preview directly to B2.
4. Vercel saves the two B2 object keys in Prisma.
5. The original remains private.
6. The preview page requests a short-lived signed `GET` URL.

## 6. Download flow

After an admin approves payment:

1. A download record is created.
2. The customer opens the download endpoint.
3. The server checks payment status, expiry, and download count.
4. The server creates a short-lived signed B2 URL for the original.
5. The response redirects the customer to B2.

The original object is never made public.

## 7. Vercel deployment

Use:

```bash
npm install
npm run build
```

The project's build command runs:

```text
prisma migrate deploy
prisma generate
next build
```

After the first deployment, run the production seed once:

```bash
npm run db:seed:prod
```

If your database provider does not allow migrations during the Vercel build, run `npm run db:deploy` from a trusted CI/local environment first and then deploy.

## 8. Smoke test

Test:

- Admin login
- Upload original + preview
- Private preview display
- Checkout
- Payment receipt upload
- Admin receipt viewing
- Admin approval
- Signed original download
- Expired download rejection
- Download limit
- Bucket remains private


## Browser upload CORS

This project uploads directly from the admin browser to B2 using a short-lived S3 presigned PUT URL. The included `backblaze-b2-cors.json` intentionally allows `*` origins because the presigned URL itself authorizes the upload; no B2 secret is sent to the browser. If you want to restrict origins, replace `*` with your exact production Vercel domain(s) and `http://localhost:3000` for local development.

The browser must send the same `Content-Type` that was used when generating the presigned URL.
