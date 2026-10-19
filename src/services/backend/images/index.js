const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION;
const S3_BASE_URL = S3_BUCKET && AWS_REGION ? `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com` : "";

export const ImageService = {

  formatImage: (imageInput) => {
    if (!imageInput) return null;

    if (typeof imageInput === "string") {
      const trimmed = imageInput.trim();
      return trimmed || null;
    }

    if (typeof imageInput === "object") {
      const key =
        imageInput.key ||
        (typeof imageInput.original === "string" ? imageInput.original : imageInput.original?.key) ||
        imageInput.card ||
        imageInput.thumbnail ||
        imageInput.detail ||
        imageInput.url ||
        imageInput.imageUrl ||
        "";
      return typeof key === "string" && key.trim() ? key.trim() : null;
    }

    return null;
  },

  formatResponseImages: (data) => {
    if (data === null || data === undefined) return data;
    if (typeof data.toObject === 'function') {
      try {
        data = data.toObject();
      } catch (e) {}
    }

    if (Array.isArray(data)) {
      return data.map(item => ImageService.formatResponseImages(item));
    }

    if (typeof data === "object") {
      if (data instanceof Date || data instanceof RegExp) return data;
      
      if (data._bsontype === 'ObjectID' || data.constructor?.name === 'ObjectId') {
          return data;
      }

      const isOldSchema = data.variants && data.original && typeof data.original === "object";
      const isNewSchema = data.original && (data.thumbnail !== undefined || data.card !== undefined || data.detail !== undefined);
      
      if (isOldSchema || isNewSchema) {
        return ImageService.formatImage(data);
      }

      const formatted = {};
      for (const [key, value] of Object.entries(data)) {
        formatted[key] = ImageService.formatResponseImages(value);
      }
      return formatted;
    }

    return data;
  },

  resolveImageUrl: (imageInput, variant = "card") => {
    if (!imageInput) return null;

    if (typeof imageInput === "string") {
      if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
        return imageInput;
      }
      return S3_BASE_URL ? `${S3_BASE_URL}/${imageInput.replace(/^\//, "")}` : imageInput;
    }

    const key = typeof imageInput === "string" ? imageInput.trim() : ImageService.formatImage(imageInput);
    if (!key) return null;
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    return S3_BASE_URL ? `${S3_BASE_URL}/${key.replace(/^\//, "")}` : `/${key.replace(/^\//, "")}`;
  },
};