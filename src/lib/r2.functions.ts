import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
  );
}

export const getR2UploadUrl = createServerFn({ method: "POST" })
  .validator((input: { fileName: string; contentType: string }) =>
    z.object({ fileName: z.string().min(1), contentType: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ uploadUrl: string; publicUrl: string }> => {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const accountId = process.env.R2_ACCOUNT_ID!;
    const bucket = process.env.R2_BUCKET_NAME!;
    const accessKey = process.env.R2_ACCESS_KEY_ID!;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY!;
    const publicDomain = process.env.R2_PUBLIC_DOMAIN!;

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
