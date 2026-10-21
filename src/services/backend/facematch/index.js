import { RekognitionClient, CompareFacesCommand, DetectFacesCommand } from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Downloads image buffer from an HTTP/HTTPS URL
 */
async function fetchImageBuffer(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image from URL: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export class FaceMatchService {
  /**
   * Compares punch selfie against baseline enrolled face photo using AWS Rekognition AI
   * @param {string} selfieUrl - live camera capture URL
   * @param {string} referenceUrl - enrolled employee avatar URL
   * @param {number} similarityThreshold - minimum confidence % (default: 75)
   */
  static async compareFaces(selfieUrl, referenceUrl, similarityThreshold = 75) {
    if (!selfieUrl || !referenceUrl) {
      return {
        matched: false,
        confidence: 0,
        error: "Both live selfie and enrolled face photo are required for verification.",
      };
    }

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return {
        matched: false,
        confidence: 0,
        error: "AWS credentials (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY) are not configured in .env.",
      };
    }

    try {
      const [selfieBuffer, referenceBuffer] = await Promise.all([
        fetchImageBuffer(selfieUrl),
        fetchImageBuffer(referenceUrl),
      ]);

      // 1. Verify live camera snapshot has a human face with open eyes
      try {
        const detectSelfieCmd = new DetectFacesCommand({
          Image: { Bytes: selfieBuffer },
          Attributes: ["ALL"],
        });
        const selfieDetectRes = await rekognition.send(detectSelfieCmd);
        const selfieFace = selfieDetectRes.FaceDetails?.[0];

        if (!selfieFace) {
          return {
            matched: false,
            confidence: 0,
            error: "No clear human face detected in camera snapshot. Please face the camera directly in good lighting.",
          };
        }
      } catch (detectErr) {
        if (detectErr.name === "AccessDeniedException") {
          return {
            matched: false,
            confidence: 0,
            error: "AWS Access Denied: Please attach 'AmazonRekognitionFullAccess' permission to IAM user in AWS Console.",
          };
        }
        console.warn("Rekognition DetectFaces live check warning:", detectErr.message);
      }

      // 2. Verify reference profile photo has a recognizable human face
      try {
        const detectRefCmd = new DetectFacesCommand({
          Image: { Bytes: referenceBuffer },
          Attributes: ["DEFAULT"],
        });
        const refDetectRes = await rekognition.send(detectRefCmd);
        if (!refDetectRes.FaceDetails || refDetectRes.FaceDetails.length === 0) {
          return {
            matched: false,
            confidence: 0,
            error: "Your enrolled profile photo does not contain a recognizable human face (e.g. it is a letter/placeholder). Please take a live face selfie in onboarding/profile first.",
          };
        }
      } catch (refErr) {
        if (refErr.name === "AccessDeniedException") {
          return {
            matched: false,
            confidence: 0,
            error: "AWS Access Denied: Please attach 'AmazonRekognitionFullAccess' permission to IAM user in AWS Console.",
          };
        }
        console.warn("Rekognition DetectFaces ref check warning:", refErr.message);
      }

      // 3. Perform strict biometric face comparison using AWS Rekognition AI
      const compareCmd = new CompareFacesCommand({
        SourceImage: { Bytes: selfieBuffer },
        TargetImage: { Bytes: referenceBuffer },
        SimilarityThreshold: similarityThreshold,
      });

      const compareRes = await rekognition.send(compareCmd);
      const faceMatches = compareRes.FaceMatches || [];

      if (faceMatches.length > 0) {
        const bestMatch = faceMatches[0];
        const confidence = Math.round(bestMatch.Similarity * 10) / 10;
        const isMatched = confidence >= similarityThreshold;

        return {
          matched: isMatched,
          confidence,
          method: "REKOGNITION",
          error: isMatched
            ? null
            : `Face similarity (${confidence}%) is below the required ${similarityThreshold}% threshold.`,
        };
      }

      // If faces were detected in both but they belong to different people
      return {
        matched: false,
        confidence: 0,
        method: "REKOGNITION",
        error: "Face mismatch! The person in front of the camera does not match the enrolled employee profile photo.",
      };
    } catch (error) {
      console.error("AWS Rekognition comparison error:", error);

      if (error.name === "AccessDeniedException") {
        return {
          matched: false,
          confidence: 0,
          error: "AWS Rekognition Access Denied: User is not authorized to perform rekognition:CompareFaces. Please attach 'AmazonRekognitionFullAccess' policy to IAM user 'getrepeat-blog' in AWS IAM Console.",
        };
      }

      if (error.name === "InvalidParameterException") {
        return {
          matched: false,
          confidence: 0,
          error: "Face verification failed: One of the photos does not contain a valid human face. Please re-register a clear frontal face selfie in your profile.",
        };
      }

      return {
        matched: false,
        confidence: 0,
        error: `Face verification error: ${error.message}`,
      };
    }
  }
}
