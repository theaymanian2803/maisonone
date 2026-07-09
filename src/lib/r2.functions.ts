import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function env<T extends string>(key: string): T | undefined {
  const cfEnv = (globalThis as Record<string, Record<string, string> | undefined>).__env__;
  return ((cfEnv?.[key] ?? process.env[key]) as T | undefined);
}

export function r2Configured(): boolean {
  return Boolean(
    env<string>("R2_ACCOUNT_ID") &&
    env<string>("R2_BUCKET_NAME") &&
    env<string>("R2_ACCESS_KEY_ID") &&
    env<string>("R2_SECRET_ACCESS_KEY"),
  );
}

export const getR2UploadUrl = createServerFn({ method: "POST" })
  .validator((input: { fileName: string; contentType: string }) =>
    z.object({ fileName: z.string().min(1), contentType: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ uploadUrl: string; publicUrl: string }> => {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const accountId = env<string>("R2_ACCOUNT_ID")!;
    const bucket = env<string>("R2_BUCKET_NAME")!;
    const accessKey = env<string>("R2_ACCESS_KEY_ID")!;
    const secretKey = env<string>("R2_SECRET_ACCESS_KEY")!;
    const publicDomain = env<string>("R2_PUBLIC_DOMAIN")!;

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: data.fileName,
      ContentType: data.contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `${publicDomain}/${data.fileName}`;

    return { uploadUrl, publicUrl };
  });
