import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";
import ExifReader from "exifreader";

export interface ImageMetadata {
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
  exif?: {
    make?: string;
    model?: string;
    fNumber?: number;
    exposureTime?: string;
    focalLength?: number;
    iso?: number;
    dateTaken?: string;
    lens?: string;
    software?: string;
  };
}

interface GCSMetadata {
  contentType: string;
  size: string;
  timeCreated: string;
  updated: string;
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
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const [[gcsMetadata], buffer] = await Promise.all([
      file.getMetadata() as unknown as Promise<[GCSMetadata]>,
      file.download().then(([buf]) => buf),
    ]);

    const tags = ExifReader.load(buffer);

    const metadata: ImageMetadata = {
      basic: {
        contentType: gcsMetadata.contentType,
        size: parseInt(gcsMetadata.size),
        timeCreated: gcsMetadata.timeCreated,
        updated: gcsMetadata.updated,
      },
    };

    if (Object.keys(tags).length > 0) {
      metadata.exif = {
        make: tags.Make?.description,
        model: tags.Model?.description,
        fNumber: tags.FNumber?.description
          ? parseFloat(tags.FNumber.description)
          : undefined,
        exposureTime: tags.ExposureTime?.description,
        focalLength: tags.FocalLength?.description
          ? parseFloat(tags.FocalLength.description)
          : undefined,
        iso: tags.ISOSpeedRatings?.description
          ? parseInt(tags.ISOSpeedRatings.description)
          : undefined,
        dateTaken: tags.DateTimeOriginal?.description,
        lens: tags.LensModel?.description,
        software: tags.Software?.description,
      };
    }

    const imageInfo = await require("sharp")(buffer).metadata();

    metadata.basic.dimensions = {
      width: imageInfo.width!,
      height: imageInfo.height!,
    };

    metadata.technical = {
      format: imageInfo.format,
      space: imageInfo.space || "unknown",
      channels: imageInfo.channels || 3,
      depth: imageInfo.depth || "unknown",
      compression: imageInfo.chromaSubsampling || "none",
      hasAlpha: imageInfo.hasAlpha || false,
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
