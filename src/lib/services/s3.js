import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "getrepeat";
export async function uploadToS3({ buffer, originalName, mimeType, subfolder = "" }) {
  const sanitizedName = (originalName || "file")
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const cleanSubfolder = subfolder ? `${subfolder.replace(/^\/+|\/+$/g, "")}/` : ""
  const key = `hr/${cleanSubfolder}${timestamp}-${randomStr}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType || "application/octet-stream",
  });

  await s3Client.send(command);

  const region = process.env.AWS_REGION || "ap-south-1";
  const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

  return {
    url,
    key,
    name: originalName,
    size: buffer.length,
    mimeType,
  };
}

export { s3Client, BUCKET_NAME };
