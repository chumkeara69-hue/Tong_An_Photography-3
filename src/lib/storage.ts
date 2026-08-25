import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getClient() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Backblaze B2 is not configured. Set AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.",
    );
  }

  // Backblaze B2 provides an S3-compatible endpoint.
  // Example: https://s3.us-west-004.backblazeb2.com
  const endpoint =
    process.env.S3_ENDPOINT || `https://s3.${region}.backblazeb2.com`;

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function assertStorageProvider() {
  const provider = (process.env.STORAGE_PROVIDER || "").toLowerCase();
  if (provider !== "b2" && provider !== "s3") {
    throw new Error(
      'Storage is not configured. Set STORAGE_PROVIDER to "b2" for Backblaze B2.',
    );
  }
}

export async function createUploadUrl(key: string, contentType: string) {
  assertStorageProvider();

  if (!key) throw new Error("Storage key is required.");
  if (!contentType) throw new Error("Content type is required.");

  const client = getClient();

  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 900 },
  );
}

export async function createDownloadUrl(key: string) {
  if (!key) throw new Error("Storage key is required.");

  // Existing local/public assets continue to work.
  if (key.startsWith("/") || /^https?:\/\//i.test(key)) return key;

  assertStorageProvider();

  const client = getClient();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    }),
    { expiresIn: 900 },
  );
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  assertStorageProvider();

  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}
