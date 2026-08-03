import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

const client = new S3Client({
  region: ENV.s3.region,
  endpoint: ENV.s3.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: ENV.s3.accessKey,
    secretAccessKey: ENV.s3.secretKey,
  },
});

function normalizeKey(key: string) {
  return key.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  await client.send(
    new PutObjectCommand({
      Bucket: ENV.s3.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );
  return { key, url: `${ENV.s3.publicUrl}/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `${ENV.s3.publicUrl}/${key}` };
}
