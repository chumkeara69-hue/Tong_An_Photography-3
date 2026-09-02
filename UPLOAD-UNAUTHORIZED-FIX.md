# Upload / UNAUTHORIZED fix

This build keeps the admin password and Backblaze credentials out of the source tree.

## Important

The Backblaze Application Key shown in the chat should be revoked and replaced because it has been exposed. Put the replacement values only in Vercel Environment Variables.

Required Vercel Production variables:

- DATABASE_URL
- DIRECT_URL (recommended)
- APP_URL
- ADMIN_EMAIL
- ADMIN_PASSWORD
- STORAGE_PROVIDER=b2
- AWS_REGION=us-west-004
- AWS_ACCESS_KEY_ID=<new B2 key ID>
- AWS_SECRET_ACCESS_KEY=<new B2 application key>
- S3_BUCKET=<your private B2 bucket name>
- S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com

## Admin upload flow

1. Log in at `/admin/login`.
2. Open `/api/auth/me`. It should return `authenticated: true` and `role: ADMIN`.
3. Upload from `/admin/photos/new`.
4. The app requests short-lived B2 presigned PUT URLs from `/api/admin/photos/presign`.
5. The browser uploads directly to B2.
6. `/api/admin/photos/complete` verifies both objects before creating the photo record.

The upload UI now distinguishes an expired/missing admin session (HTTP 401) from a Backblaze upload error and shows useful B2 error details when B2 itself returns an error.

## B2 permissions

For the application key used by this app, allow:
- readFiles
- writeFiles

The bucket must be private. Browser CORS must allow PUT/GET/HEAD and the exact site origin(s). The included CORS file is permissive for troubleshooting; tighten it to your real Vercel domain before production.

## Seed the admin

Set ADMIN_EMAIL and ADMIN_PASSWORD in the deployment environment, then run:

`npm run db:seed:prod`

Do not put the password into Git, this ZIP, or `.env.example`.


## Session persistence hardening

This revision:
- explicitly sends same-origin credentials on admin login;
- refreshes the admin session cookie before and after a long B2 upload;
- retries photo completion once after a transient HTTP 401;
- keeps the short-lived signed completion token as the fallback for a session lost during B2 upload.

After deploying, test from the same Vercel origin used for login. Do not switch between
different Vercel deployment URLs during the login/upload flow.
