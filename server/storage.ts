import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

type StorageConfig = {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  region: string;
  publicUrl: string;
};

let client: S3Client | null = null;

function getStorageConfig(): StorageConfig {
  const config = {
    endpoint: ENV.s3Endpoint,
    bucket: ENV.s3Bucket,
    accessKey: ENV.s3AccessKey,
    secretKey: ENV.s3SecretKey,
    region: ENV.s3Region,
    publicUrl: ENV.s3PublicUrl.replace(/\/+$/, ""),
  };

  const missing = [
    ["S3_ENDPOINT", config.endpoint],
    ["S3_BUCKET", config.bucket],
    ["S3_ACCESS_KEY", config.accessKey],
    ["S3_SECRET_KEY", config.secretKey],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(
      `S3 storage is not configured: ${missing
        .map(([name]) => name)
        .join(", ")}`
    );
  }

  return config;
}

function getClient(config: StorageConfig): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
  }

  return client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

async function buildObjectUrl(
  s3: S3Client,
  config: StorageConfig,
  key: string
): Promise<string> {
  if (config.publicUrl) {
    return `${config.publicUrl}/${key}`;
  }

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
    { expiresIn: 60 * 60 * 24 * 7 }
  );
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const s3 = getClient(config);
  const key = normalizeKey(relKey);

  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: await buildObjectUrl(s3, config, key),
  };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const s3 = getClient(config);
  const key = normalizeKey(relKey);

  return {
    key,
    url: await buildObjectUrl(s3, config, key),
  };
}
