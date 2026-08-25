# Backblaze B2 setup for Tong An Photography

## 1. Create the B2 bucket
Create a bucket in Backblaze B2. Keep it **private**.

Create an Application Key that can read/write this bucket.

You need:
- Application Key ID -> `AWS_ACCESS_KEY_ID`
- Application Key -> `AWS_SECRET_ACCESS_KEY`
- Bucket name -> `S3_BUCKET`
- B2 region -> `AWS_REGION`, for example `us-west-004`

The app automatically uses:
`https://s3.<AWS_REGION>.backblazeb2.com`

You can set `S3_ENDPOINT` explicitly if your B2 region requires a different endpoint.

## 2. Vercel Environment Variables

Set these in **Production** (and Preview if you want preview deployments):

```text
STORAGE_PROVIDER=b2
AWS_REGION=YOUR_B2_REGION
AWS_ACCESS_KEY_ID=YOUR_B2_APPLICATION_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_B2_APPLICATION_KEY
S3_BUCKET=YOUR_B2_BUCKET_NAME
```

Also keep your existing:
`DATABASE_URL`, `APP_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and any authentication variables your project already uses.

Do not put the real secrets into GitHub.

## 3. Important: browser upload CORS

Because the admin page uploads directly from the browser to B2 using a signed URL, configure the B2 bucket CORS policy to allow your Vercel website origin and `PUT`.

Allow at minimum:
- Origin: your Vercel domain
- Method: `PUT`
- Headers: `Content-Type`

For testing you can allow `*`, then tighten it to your real domain after confirming uploads work.

## 4. What this version does

- Admin uploads original + preview directly to Backblaze B2.
- B2 bucket can stay private.
- Preview images use short-lived signed URLs.
- Original downloads use short-lived signed URLs and remain protected by the order/payment checks.
- Existing `/public` images continue to work.
- The database stores B2 object keys, not fragile public URLs.
