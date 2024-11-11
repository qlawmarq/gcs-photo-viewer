// app/api/buckets/route.ts
import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { credentials, projectId } = await request.json();

    const storage = new Storage({
      credentials: credentials,
      projectId: projectId,
    });

    const [buckets] = await storage.getBuckets();
    const bucketNames = buckets.map((bucket) => bucket.name);

    return NextResponse.json(bucketNames);
  } catch (error) {
    console.error("Error fetching buckets:", error);
    return NextResponse.json(
      { error: "Failed to fetch buckets" },
      { status: 500 }
    );
  }
}
