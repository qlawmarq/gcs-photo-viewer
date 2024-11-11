import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";
import Sharp from "sharp";

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const credentials = JSON.parse(
      decodeURIComponent(searchParams.get("credentials") || "")
    );
    const projectId = searchParams.get("projectId");
    const bucketName = searchParams.get("bucketName");
    const path = searchParams.get("path");

    if (!credentials || !projectId || !bucketName || !path) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const storage = new Storage({
      credentials: credentials,
      projectId: projectId,
    });

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(path);

    const [exists] = await file.exists();
    if (!exists) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const [buffer] = await file.download();

    const optimizedImage = await Sharp(buffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toBuffer();

    return new NextResponse(optimizedImage, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return new NextResponse("Error generating thumbnail", { status: 500 });
  }
}
