import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  ADMIN_EMAIL: z.string().email().optional(),
  S3_ENDPOINT: z.string().url(),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_REGION: z.string().default("auto"),
  S3_PUBLIC_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const ENV = {
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  cookieSecret: parsed.data.JWT_SECRET,
  adminEmail: parsed.data.ADMIN_EMAIL?.toLowerCase(),
  isProduction: parsed.data.NODE_ENV === "production",
  s3: {
    endpoint: parsed.data.S3_ENDPOINT,
    bucket: parsed.data.S3_BUCKET,
    accessKey: parsed.data.S3_ACCESS_KEY,
    secretKey: parsed.data.S3_SECRET_KEY,
    region: parsed.data.S3_REGION,
    publicUrl: parsed.data.S3_PUBLIC_URL.replace(/\/+$/, ""),
  },
};
