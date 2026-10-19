const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || process.env.AWS_BUCKET || 'getrepeat';
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || 'ap-south-1';
const S3_BASE_URL = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

export function getImageUrl(imageInput, variantOrUseAvif = 'card', legacyVariant = null) {
  if (!imageInput) return '';

  let variant = variantOrUseAvif;
  if (typeof variantOrUseAvif === 'boolean') {
    variant = legacyVariant || 'card';
  }
  if (!variant || typeof variant !== 'string') {
    variant = 'card';
  }

  const rawKey = typeof imageInput === 'string'
    ? imageInput
    : (imageInput.key || (typeof imageInput.original === 'string' ? imageInput.original : imageInput.original?.key) || imageInput.url || imageInput.imageUrl || '');

  if (!rawKey || typeof rawKey !== 'string') return '';
  if (/^[0-9a-fA-F]{24}$/.test(rawKey.trim())) {
    return '';
  }

  let cleanKey = rawKey.trim();
  if (cleanKey.includes('.amazonaws.com/')) {
    cleanKey = cleanKey.split('.amazonaws.com/')[1] || cleanKey;
  } else if (cleanKey.startsWith('http://') || cleanKey.startsWith('https://') || cleanKey.endsWith('.svg')) {
    return cleanKey;
  }

  cleanKey = cleanKey.replace(/^\/+/, '');
  if (variant === 'original') {
    return `${S3_BASE_URL}/${cleanKey}`;
  }

  const filename = cleanKey.split('/').pop().replace(/\.[^/.]+$/, '');
  return `${S3_BASE_URL}/foodsnap/${variant}/${filename}.avif`;
}
