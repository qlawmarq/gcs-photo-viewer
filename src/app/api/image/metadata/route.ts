import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";
import Sharp from "sharp";

interface GCSMetadata {
  contentType: string;
  size: string;
  timeCreated: string;
  updated: string;
  id: string;
  generation: string;
  customMetadata?: Record<string, string>;
}

interface SharpMetadata {
  format?: string;
  size?: number;
  width?: number;
  height?: number;
  space?: string;
  channels?: number;
  depth?: string;
  density?: number;
  chromaSubsampling?: string;
  isProgressive?: boolean;
  hasProfile?: boolean;
  hasAlpha?: boolean;
  orientation?: number;
  exif?: Buffer;
  icc?: Buffer;
  iptc?: Buffer;
  xmp?: Buffer;
}

interface ImageMetadata {
  basic: {
    contentType: string;
    size: number;
    timeCreated: string;
    updated: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  technical?: {
    format: string;
    space: string;
    channels: number;
    depth: string;
    compression: string;
    hasAlpha: boolean;
  };
}

export async function POST(request: Request) {
  try {
    const {
      credentials,
      projectId,
      bucketName,
      path,
    }: {
      credentials: Record<string, unknown>;
      projectId: string;
      bucketName: string;
      path: string;
    } = await request.json();

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

    const [metadata, [buffer]] = await Promise.all([
      file.getMetadata() as unknown as Promise<[GCSMetadata]>,
      file.download(),
    ]);

    const response: ImageMetadata = {
      basic: {
        contentType: metadata[0].contentType,
        size: parseInt(metadata[0].size),
        timeCreated: metadata[0].timeCreated,
        updated: metadata[0].updated,
      },
    };

    try {
      const sharpMetadata: SharpMetadata = await Sharp(buffer).metadata();

      if (sharpMetadata.width && sharpMetadata.height) {
        response.basic.dimensions = {
          width: sharpMetadata.width,
          height: sharpMetadata.height,
        };
      }

      response.technical = {
        format: sharpMetadata.format || "unknown",
        space: sharpMetadata.space || "unknown",
        channels: sharpMetadata.channels || 0,
        depth: sharpMetadata.depth ? `${sharpMetadata.depth}-bit` : "unknown",
        compression: sharpMetadata.chromaSubsampling || "none",
        hasAlpha: sharpMetadata.hasAlpha || false,
      };
    } catch (sharpError) {
      console.warn("Failed to extract technical metadata:", sharpError);
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=3600", // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error("Error fetching image metadata:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch image metadata",
      },
      { status: 500 }
    );
  }
}
