import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileItem } from "@/app/api/photos/route";

interface ImageMetadata {
  basic: {
    contentType: string;
    size: number;
    timeCreated: string;
    updated: string;
    generation: string;
  };
  exif?: {
    make?: string;
    model?: string;
    dateTimeOriginal?: string;
    fNumber?: number;
    exposureTime?: string;
    iso?: number;
    focalLength?: number;
    gpsLatitude?: number;
    gpsLongitude?: number;
  };
}

interface ImageDisplayProps {
  item: FileItem;
  credentials: string;
  projectId: string;
  bucketName: string;
}

export const ImageDisplay = ({
  item,
  credentials,
  projectId,
  bucketName,
}: ImageDisplayProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageAndMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        const [imageResponse, metadataResponse] = await Promise.all([
          fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credentials: JSON.parse(credentials),
              projectId,
              bucketName,
              path: item.path,
            }),
          }),
          fetch("/api/image/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credentials: JSON.parse(credentials),
              projectId,
              bucketName,
              path: item.path,
            }),
          }),
        ]);

        if (!imageResponse.ok || !metadataResponse.ok) {
          throw new Error("Failed to load image or metadata");
        }

        const imageBlob = await imageResponse.blob();
        const metadata = await metadataResponse.json();

        setImageSrc(URL.createObjectURL(imageBlob));
        setMetadata(metadata);
      } catch (err) {
        console.error("Error fetching image and metadata:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchImageAndMetadata();

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [item.path, credentials, projectId, bucketName]);

  if (loading) {
    return (
      <div className="relative aspect-video flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative aspect-video flex items-center justify-center bg-gray-100">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg">
        {imageSrc && (
          <img
            src={imageSrc}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain rounded-lg"
          />
        )}
      </div>

      {metadata && (
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="basic">
              <TabsList>
                <TabsTrigger value="basic">File Info</TabsTrigger>
                {metadata.exif && (
                  <TabsTrigger value="exif">EXIF Data</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="basic" className="space-y-2">
                <div>
                  <strong>File Type:</strong> {metadata.basic.contentType}
                </div>
                <div>
                  <strong>Size:</strong> {formatFileSize(metadata.basic.size)}
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {new Date(metadata.basic.timeCreated).toLocaleString()}
                </div>
                <div>
                  <strong>Updated:</strong>{" "}
                  {new Date(metadata.basic.updated).toLocaleString()}
                </div>
              </TabsContent>

              {metadata.exif && (
                <TabsContent value="exif" className="space-y-2">
                  {metadata.exif.make && (
                    <div>
                      <strong>Camera Make:</strong> {metadata.exif.make}
                    </div>
                  )}
                  {metadata.exif.model && (
                    <div>
                      <strong>Camera Model:</strong> {metadata.exif.model}
                    </div>
                  )}
                  {metadata.exif.dateTimeOriginal && (
                    <div>
                      <strong>Date Taken:</strong>{" "}
                      {metadata.exif.dateTimeOriginal}
                    </div>
                  )}
                  {metadata.exif.fNumber && (
                    <div>
                      <strong>F-Number:</strong> f/{metadata.exif.fNumber}
                    </div>
                  )}
                  {metadata.exif.exposureTime && (
                    <div>
                      <strong>Exposure Time:</strong>{" "}
                      {metadata.exif.exposureTime}s
                    </div>
                  )}
                  {metadata.exif.iso && (
                    <div>
                      <strong>ISO:</strong> {metadata.exif.iso}
                    </div>
                  )}
                  {metadata.exif.focalLength && (
                    <div>
                      <strong>Focal Length:</strong> {metadata.exif.focalLength}
                      mm
                    </div>
                  )}
                  {metadata.exif.gpsLatitude && metadata.exif.gpsLongitude && (
                    <div>
                      <strong>GPS:</strong> {metadata.exif.gpsLatitude},{" "}
                      {metadata.exif.gpsLongitude}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
