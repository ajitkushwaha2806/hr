import path from 'path';
import mime from 'mime-types';
import { randomUUID } from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, resolveFileBodyAndName } from '@/services/backend/s3/helpers';

export async function uploadToS3({ file, folder = '', bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET || 'getrepeat', fileName = null, allowedExtensions = [] }) {
  if (!file) {
    throw new Error('File is required');
  }

  const { body, originalName } = await resolveFileBodyAndName(file, fileName);
  const extension = path.extname(originalName).toLowerCase();
  if (extension && allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
    throw new Error(`Unsupported file type: ${extension}`);
  }

  const prefix = process.env.S3_BASE_PREFIX || 'foodsnap';
  const finalFileName = fileName || `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
  const key = `${prefix}/original/${finalFileName}`;
  const contentType = mime.lookup(extension) || 'application/octet-stream';

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Body: body,
    })
  );

  const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1';
  return {
    success: true,
    bucket: bucketName,
    key,
    fileName: finalFileName,
    contentType,
    url: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
  };
}

export async function getPresignedUploadUrl({ bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET || 'getrepeat', restaurantId, targetFolder = "temp", filename, contentType, expiresIn = 600 }) {
  const originalName = String(filename).trim().slice(0, 100);
  const cleanFilename = originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  const baseName = cleanFilename.replace(/\.[^/.]+$/, '') || 'image';
  const extension = path.extname(originalName).replace('.', '').toLowerCase() || 'jpg';

  const prefix = process.env.S3_BASE_PREFIX || 'foodsnap';
  const uniqueId = randomUUID().slice(0, 8);
  const key = `${prefix}/original/${baseName}-${Date.now()}-${uniqueId}.${extension}`;
 
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });

  return {
    uploadUrl,
    key,
    imageId: key,
    cleanFilename,
  };
}
