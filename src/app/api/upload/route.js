import { auth, currentUser } from "@clerk/nextjs/server";
import { uploadToS3 } from "@/lib/services/s3";
import { withErrorHandler, successResponse, BadRequestError, UnauthorizedError } from "@/lib/api/response-handler";

export const POST = withErrorHandler(async (req) => {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    throw new UnauthorizedError("Please sign in to upload documents");
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const category = (formData.get("category") || "documents").toString().trim();

  if (!file || typeof file === "string") {
    throw new BadRequestError("No file provided for upload");
  }

  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new BadRequestError("File size exceeds 10MB limit");
  }

  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/pdf",
  ];

  if (!allowedMimes.includes(file.type)) {
    throw new BadRequestError("Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await uploadToS3({
    buffer,
    originalName: file.name,
    mimeType: file.type,
    subfolder: category,
  });

  return successResponse(result, "Document uploaded to S3 successfully");
});
