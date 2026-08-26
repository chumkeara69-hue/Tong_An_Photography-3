import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const SIGNED_URL_TTL_SECONDS = 10 * 60;
const MAX_SIGNED_URL_TTL_SECONDS = 15 * 60;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getStorageConfig() {
  const provider = (process.env.STORAGE_PROVIDER || "b2").trim().toLowerCase();
  if (provider !== "b2") {
    throw new Error(`Unsupported STORAGE_PROVIDER "${provider}". This production build requires Backblaze B2.`);
  }

  const bucket = required("S3_BUCKET");
  const accessKeyId = required("AWS_ACCESS_KEY_ID");
  const secretAccessKey = required("AWS_SECRET_ACCESS_KEY");

  // Backblaze B2 S3-compatible endpoint. AWS_REGION is optional: when it is
  // omitted on Vercel, derive the region from S3_ENDPOINT.
  // Example: https://s3.us-west-004.backblazeb2.com
  const endpoint =
    process.env.S3_ENDPOINT?.trim().replace(/\/+$/, "") ||
    `https://s3.${process.env.AWS_REGION?.trim() || "us-west-004"}.backblazeb2.com`;

  const match = endpoint.match(/^https:\/\/s3\.([a-z0-9-]+)\.backblazeb2\.com$/i);
  if (!match) {
    throw new Error("S3_ENDPOINT must be a valid Backblaze B2 S3 endpoint.");
  }

  const region = process.env.AWS_REGION?.trim() || match[1];

  return { region, bucket, accessKeyId, secretAccessKey, endpoint };
}

function getClient() {
  const config = getStorageConfig();

  return new S3Client({
    maxAttempts: 3,
    retryMode: "standard",
    requestChecksumCalculation: "WHEN_REQUIRED",
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function isStorageConfigured() {
  return Boolean(
    (process.env.STORAGE_PROVIDER || "b2") &&
      (process.env.AWS_REGION || process.env.S3_ENDPOINT) &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET,
  );
}

export async function createUploadUrl(key: string, contentType: string) {
  if (!key) throw new Error("Storage key is required.");
  if (!contentType) throw new Error("Content type is required.");

  const { bucket } = getStorageConfig();

  return getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: SIGNED_URL_TTL_SECONDS },
  );
}

export async function createDownloadUrl(
  key: string,
  options: { attachment?: boolean; filename?: string; expiresIn?: number } = {},
) {
  if (!key) throw new Error("Storage key is required.");

  // Existing local/public assets continue to work during migration.
  if (key.startsWith("/") || /^https?:\/\//i.test(key)) return key;

  const { bucket } = getStorageConfig();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ...(options.attachment
      ? {
          ResponseContentDisposition: `attachment; filename="${(
            options.filename || key.split("/").pop() || "download"
          ).replace(/["\\\r\n]/g, "_")}"`,
        }
      : {}),
  });

  const expiresIn = Math.min(
    Math.max(60, Number(options.expiresIn || SIGNED_URL_TTL_SECONDS)),
    MAX_SIGNED_URL_TTL_SECONDS,
  );

  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  if (!key) throw new Error("Storage key is required.");
  const { bucket } = getStorageConfig();

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}
