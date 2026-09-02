export const ENV = {
  oauthClientId: process.env.VITE_OAUTH_CLIENT_ID ?? "",
  oauthClientSecret: process.env.OAUTH_CLIENT_SECRET ?? "",
  oauthTokenUrl: process.env.OAUTH_TOKEN_URL ?? "",
  oauthUserInfoUrl: process.env.OAUTH_USERINFO_URL ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  s3Endpoint: process.env.S3_ENDPOINT ?? "",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3AccessKey: process.env.S3_ACCESS_KEY ?? "",
  s3SecretKey: process.env.S3_SECRET_KEY ?? "",
  s3Region: process.env.S3_REGION ?? "auto",
  s3PublicUrl: process.env.S3_PUBLIC_URL ?? "",
  demoMode:
    process.env.DEMO_MODE === "true" ||
    (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL),
  isProduction: process.env.NODE_ENV === "production",
};
