import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getClient() {
  if (
    !process.env.AWS_REGION ||
    !process.env.S3_BUCKET ||
    !process.env.S3_ENDPOINT
  ) {
    throw new Error(
      "S3 storage is not configured. Set AWS_REGION, S3_BUCKET, and S3_ENDPOINT.",
    );
  }

  return new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials:
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            ...(process.env.AWS_SESSION_TOKEN
              ? { sessionToken: process.env.AWS_SESSION_TOKEN }
              : {}),
          }
        : undefined,
  });
}

export async function createUploadUrl(
  key: string,
  contentType: string,
) {
  if (process.env.STORAGE_PROVIDER !== "s3") {
    throw new Error("S3 storage is required for production uploads.");
  }

  if (!contentType) {
    throw new Error("Content type is required.");
  }

  const client = getClient();

  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 900 },
  );
}

export async function createDownloadUrl(key: string) {
  if (!key) {
    throw new Error("Storage key is required.");
  }

  const client = getClient();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
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
  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}
