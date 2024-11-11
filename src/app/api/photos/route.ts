import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

export interface FileItem {
  name: string;
  type: "folder" | "file";
  path: string;
  url?: string;
}

export async function POST(request: Request) {
  try {
    const {
      credentials,
      projectId,
      bucketName,
      prefix = "",
      limit = 50,
      pageToken,
    } = await request.json();

    const storage = new Storage({
      credentials: credentials,
      projectId: projectId,
    });

    const bucket = storage.bucket(bucketName);

    try {
      const [files] = await bucket.getFiles({
        prefix: prefix,
        maxResults: limit,
        pageToken: pageToken,
      });

      const items: FileItem[] = [];
      const processedFolders = new Set<string>();

      for (const file of files) {
        const fullPath = file.name;
        const relativePath = prefix ? fullPath.slice(prefix.length) : fullPath;

        if (prefix && !fullPath.startsWith(prefix)) continue;

        if (fullPath === prefix) continue;

        const pathParts = relativePath.split("/");

        if (pathParts.length > 1) {
          const folderName = pathParts[0];
          const folderPath = prefix + folderName + "/";

          if (!processedFolders.has(folderPath)) {
            processedFolders.add(folderPath);
            items.push({
              name: folderName,
              type: "folder",
              path: folderPath,
            });
          }
        } else if (pathParts[0]) {
          const isImage = /\.(jpg|jpeg|png|gif|webp|svg|heic)$/i.test(fullPath);
          if (isImage) {
            items.push({
              name: pathParts[0],
              type: "file",
              path: fullPath,
              url: `https://storage.googleapis.com/${bucketName}/${fullPath}`,
            });
          }
        }
      }

      items.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === "folder" ? -1 : 1;
      });

      return NextResponse.json({
        items,
        currentPath: prefix,
        hasMore: items.length === limit,
      });
    } catch (getFilesError) {
      console.error("Error getting files:", getFilesError);
      throw getFilesError;
    }
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch photos",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
