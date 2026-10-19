import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.MY_AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.MY_AWS_ACCESS_SECRET,
  },
});

export async function resolveFileBodyAndName(file, fileName) {
  if (typeof file?.arrayBuffer === 'function') {
    return {
      body: Buffer.from(await file.arrayBuffer()),
      originalName: file.name,
    };
  }

  if (Buffer.isBuffer(file)) {
    return {
      body: file,
      originalName: fileName || randomUUID(),
    };
  }

  if (typeof file === 'string') {
    return {
      body: fs.readFileSync(file),
      originalName: path.basename(file),
    };
  }

  throw new Error('Unsupported file format');
}