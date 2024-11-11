import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";
import Sharp from "sharp";

// Max image
const MAX_IMAGE_DIMENSION = 2048;

export async function POST(request: Request) {
  try {
    const {
      credentials,
      projectId,
      bucketName,
      path,
      optimize = true,
    } = await request.json();

    const storage = new Storage({
      credentials: credentials,
      projectId: projectId,
    });

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(path);

    // Check the file
    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Download the file
    const [buffer] = await file.download();
    const contentType = file.metadata.contentType || "image/jpeg";

    if (optimize) {
      try {
        // Optimize image
        const image = Sharp(buffer);
        const metadata = await image.metadata();

        if (
          (metadata.width && metadata.width > MAX_IMAGE_DIMENSION) ||
          (metadata.height && metadata.height > MAX_IMAGE_DIMENSION)
        ) {
          const optimizedImage = await image
            .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .rotate()
            .toBuffer();

          return new NextResponse(optimizedImage, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000",
              "X-Image-Optimized": "true",
            },
          });
        }
      } catch (optimizeError) {
        console.warn(
          "Image optimization failed, serving original:",
          optimizeError
        );
      }
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
