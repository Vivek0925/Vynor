
import { S3Client } from "@aws-sdk/client-s3";

const region = (process.env.S3_REGION || "auto").trim();
const endpoint = process.env.S3_ENDPOINT?.trim();

const accessKeyId = process.env.S3_ACCESS_KEY?.trim();
const secretAccessKey = process.env.S3_SECRET_KEY?.trim();

if (!endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("S3 storage configuration is incomplete.");
}

export const s3 = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});
