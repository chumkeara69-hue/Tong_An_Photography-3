const required = [
  "DATABASE_URL",
  "APP_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "STORAGE_PROVIDER",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET",
];

const bad = [];
for (const key of required) {
  const value = process.env[key]?.trim();
  if (!value || value.startsWith("CHANGE_ME_") || value.includes("YOUR_")) bad.push(key);
}

if (bad.length) {
  console.error("Missing/placeholder production environment variables:");
  bad.forEach((key) => console.error(`- ${key}`));
  process.exit(1);
}

if (process.env.STORAGE_PROVIDER.toLowerCase() !== "b2") {
  console.error('STORAGE_PROVIDER must be "b2" for this deployment.');
  process.exit(1);
}

if (!process.env.APP_URL.startsWith("https://")) {
  console.error("APP_URL must use https:// in production.");
  process.exit(1);
}

const endpoint = (process.env.S3_ENDPOINT || `https://s3.${process.env.AWS_REGION}.backblazeb2.com`).trim();
if (!/^https:\/\/s3\.[a-z0-9-]+\.backblazeb2\.com$/i.test(endpoint)) {
  console.error("S3_ENDPOINT must be a valid Backblaze B2 S3 endpoint.");
  process.exit(1);
}

if (!/^https:\/\/s3\.[a-z0-9-]+\.backblazeb2\.com$/i.test(`https://s3.${process.env.AWS_REGION}.backblazeb2.com`)) {
  console.error("AWS_REGION does not produce a valid Backblaze B2 endpoint.");
  process.exit(1);
}

console.log("Production environment variables look configured for Backblaze B2 + Vercel.");
