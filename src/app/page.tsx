"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/FileUpload";
import { PhotoViewer } from "@/components/PhotoViewer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInfinitePhotos } from "@/hooks/useInfinitePhotos";
import { Settings, Image } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 50;

export default function Page() {
  const [credentials, setCredentials] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [buckets, setBuckets] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  const {
    items,
    hasMore,
    isLoading: _isLoadingPhotos,
    loadMore,
    refresh: refreshPhotos,
  } = useInfinitePhotos({
    credentials,
    projectId: selectedProjectId,
    bucketName: selectedBucket,
    path: currentPath,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const fetchProjects = useCallback(async () => {
    if (!credentials) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentials: JSON.parse(credentials) }),
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to fetch projects. Please check your credentials.");
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  const fetchBuckets = useCallback(async () => {
    if (!selectedProjectId || !credentials) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: JSON.parse(credentials),
          projectId: selectedProjectId,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch buckets");
      const data = await response.json();
      setBuckets(data);
    } catch (error) {
      console.error("Error fetching buckets:", error);
      setError("Failed to fetch buckets. Please check your permissions.");
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  }, [credentials, selectedProjectId]);

  useEffect(() => {
    if (credentials) {
      fetchProjects();
    }
  }, [credentials, fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchBuckets();
    }
  }, [selectedProjectId, fetchBuckets]);

  useEffect(() => {
    if (credentials && selectedProjectId && selectedBucket) {
      refreshPhotos();
      setIsConfigured(true);
    }
  }, [credentials, selectedProjectId, selectedBucket, refreshPhotos]);

  const handleCredentialsChange = useCallback((newCredentials: string) => {
    setCredentials(newCredentials);
    setSelectedProjectId("");
    setBuckets([]);
    setSelectedBucket("");
    setCurrentPath("");
    setIsConfigured(false);
  }, []);

  const handleProjectChange = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedBucket("");
    setCurrentPath("");
  }, []);

  const handleBucketChange = useCallback((bucket: string) => {
    setSelectedBucket(bucket);
    setCurrentPath("");
  }, []);

  const handleNavigate = useCallback(async (path: string) => {
    setCurrentPath(path);
  }, []);

  const ConfigurationPanel = () => (
    <div className="space-y-6">
      <div>
        <Tabs defaultValue="file">
          <TabsList className="mb-4">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <FileUpload
              onFileSelect={handleCredentialsChange}
              accept="application/json"
              maxSize={1024 * 1024}
            />
          </TabsContent>

          <TabsContent value="paste">
            <div className="space-y-4">
              <Label htmlFor="credentials">
                Google Cloud Credentials (JSON)
              </Label>
              <Input
                id="credentials"
                value={credentials}
                onChange={(e) => handleCredentialsChange(e.target.value)}
                placeholder="Paste your Google Cloud credentials JSON here"
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {projects.length > 0 && (
        <div className="space-y-4">
          <Label htmlFor="project-select">Select Project</Label>
          <Select onValueChange={handleProjectChange} value={selectedProjectId}>
            <SelectTrigger id="project-select">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {buckets.length > 0 && (
        <div className="space-y-4">
          <Label htmlFor="bucket-select">Select Bucket</Label>
          <Select onValueChange={handleBucketChange} value={selectedBucket}>
            <SelectTrigger id="bucket-select">
              <SelectValue placeholder="Select a bucket" />
            </SelectTrigger>
            <SelectContent>
              {buckets.map((bucket) => (
                <SelectItem key={bucket} value={bucket}>
                  {bucket}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  // Initial view
  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Image className="w-6 h-6" />
              <h1 className="text-2xl font-bold">GCS Photo Viewer</h1>
            </div>
            <ConfigurationPanel />
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main viewer
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <Image className="w-6 h-6" />
          <h1 className="text-xl font-semibold">GCS Photo Viewer</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>
                Configure your Google Cloud Storage connection
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <ConfigurationPanel />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="container mx-auto py-6">
        {loading && <div className="text-center">Loading...</div>}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <PhotoViewer
          items={items}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onLoadMore={loadMore}
          credentials={credentials}
          projectId={selectedProjectId}
          bucketName={selectedBucket}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
