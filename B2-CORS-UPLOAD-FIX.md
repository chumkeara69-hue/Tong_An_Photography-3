# Backblaze B2 Upload Fix

The admin upload page uploads directly to the B2 S3-compatible endpoint using a presigned PUT URL. The B2 bucket must allow browser CORS for PUT requests.

The included `backblaze-b2-cors.json` allows Vercel origins (`https://*.vercel.app`) and local development. Apply it to bucket `tong-an-photography` using the Backblaze B2 CLI or S3-compatible API.

After applying the CORS rule, redeploy the app and hard-refresh the admin page before testing another upload.

Do not put B2 application keys in browser/client code.
