import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

export interface FileItem {
  name: string;
  type: "folder" | "file";
  path: string;
  url?: string;
}

interface GetFilesResponse {
  prefixes?: string[];
}

export async function POST(request: Request) {
  try {
    const {
      credentials,
      projectId,
      bucketName,
      prefix = "",
    } = await request.json();

    const storage = new Storage({
      credentials: credentials,
      projectId: projectId,
    });

    const bucket = storage.bucket(bucketName);

    const [, , folderResponse] = await bucket.getFiles({
      prefix: prefix,
      delimiter: "/",
      autoPaginate: false,
    });

    const fetFilesResponse = folderResponse as GetFilesResponse;

    const prefixes = (fetFilesResponse?.prefixes || []) as string[];

    const folders: FileItem[] = prefixes.map((folderPath: string) => ({
      name: folderPath.slice(prefix.length, -1),
      type: "folder",
      path: folderPath,
    }));

    const [files] = await bucket.getFiles({
      prefix: prefix,
      delimiter: "/",
      autoPaginate: false,
    });

    const imageFiles: FileItem[] = files
      .filter((file) => {
        if (file.name === prefix) return false;
        return /\.(jpg|jpeg|png|gif|webp|svg|heic)$/i.test(file.name);
      })
      .map((file) => ({
        name: file.name.slice(prefix.length),
        type: "file",
        path: file.name,
        url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
      }));

    const items = [
      ...folders.sort((a, b) => a.name.localeCompare(b.name)),
      ...imageFiles.sort((a, b) => a.name.localeCompare(b.name)),
    ];

    console.log("Response summary:", {
      totalItems: items.length,
      folders: folders.length,
      files: imageFiles.length,
      prefix: prefix,
    });

    return NextResponse.json({
      items,
      currentPath: prefix,
    });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch photos",
      },
      { status: 500 }
    );
  }
}
