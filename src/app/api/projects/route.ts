// app/api/projects/route.ts
import ResourceManagerClient from "@google-cloud/resource-manager";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { credentials } = await request.json();

    const resourceManager = new ResourceManagerClient.ProjectsClient({
      credentials: credentials,
    });

    const [projects] = await resourceManager.searchProjects();

    const projectList = projects.map((project) => ({
      id: project.projectId,
      name: project.displayName || project.projectId,
    }));

    return NextResponse.json(projectList);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
