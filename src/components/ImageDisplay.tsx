import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageMetadata } from "@/app/api/image/metadata/route";
import { FileItem } from "@/app/api/photos/route";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{
    url: string;
    metadata: ImageMetadata | null;
  }>({ url: "", metadata: null });

  useEffect(() => {
    const loadImageData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metadataResponse, imageBlob] = await Promise.all([
          fetch("/api/image/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credentials: JSON.parse(credentials),
              projectId,
              bucketName,
              path: item.path,
            }),
          }).then((res) => res.json()),
          fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credentials: JSON.parse(credentials),
              projectId,
              bucketName,
              path: item.path,
            }),
          }).then((res) => res.blob()),
        ]);

        setImageData({
          url: URL.createObjectURL(imageBlob),
          metadata: metadataResponse as ImageMetadata,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load image");
      } finally {
        setLoading(false);
      }
    };

    loadImageData();

    return () => {
      if (imageData.url) {
        URL.revokeObjectURL(imageData.url);
      }
    };
  }, [item.path, credentials, projectId, bucketName]);

  if (loading) {
    return <Skeleton className="w-full aspect-video" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const { metadata } = imageData;

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg">
        {imageData.url && (
          <img
            src={imageData.url}
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
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                {metadata.technical && (
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                )}
                {metadata.exif && (
                  <TabsTrigger value="exif">EXIF Data</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="basic" className="space-y-2">
                <p>
                  <strong>Size:</strong>{" "}
                  {(metadata.basic.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>
                  <strong>Dimensions:</strong>{" "}
                  {metadata.basic.dimensions?.width} ×{" "}
                  {metadata.basic.dimensions?.height}
                </p>
                <p>
                  <strong>Type:</strong> {metadata.basic.contentType}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(metadata.basic.timeCreated).toLocaleString()}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {new Date(metadata.basic.updated).toLocaleString()}
                </p>
              </TabsContent>

              {metadata.technical && (
                <TabsContent value="technical" className="space-y-2">
                  <p>
                    <strong>Format:</strong> {metadata.technical.format}
                  </p>
                  <p>
                    <strong>Color Space:</strong> {metadata.technical.space}
                  </p>
                  <p>
                    <strong>Channels:</strong> {metadata.technical.channels}
                  </p>
                  <p>
                    <strong>Bit Depth:</strong> {metadata.technical.depth}
                  </p>
                  <p>
                    <strong>Compression:</strong>{" "}
                    {metadata.technical.compression}
                  </p>
                </TabsContent>
              )}

              {metadata.exif && (
                <TabsContent value="exif" className="space-y-2">
                  {metadata.exif.make && (
                    <p>
                      <strong>Camera Make:</strong> {metadata.exif.make}
                    </p>
                  )}
                  {metadata.exif.model && (
                    <p>
                      <strong>Camera Model:</strong> {metadata.exif.model}
                    </p>
                  )}
                  {metadata.exif.lens && (
                    <p>
                      <strong>Lens:</strong> {metadata.exif.lens}
                    </p>
                  )}
                  {metadata.exif.fNumber && (
                    <p>
                      <strong>F-Number:</strong> f/{metadata.exif.fNumber}
                    </p>
                  )}
                  {metadata.exif.exposureTime && (
                    <p>
                      <strong>Exposure Time:</strong>{" "}
                      {metadata.exif.exposureTime}s
                    </p>
                  )}
                  {metadata.exif.focalLength && (
                    <p>
                      <strong>Focal Length:</strong> {metadata.exif.focalLength}
                      mm
                    </p>
                  )}
                  {metadata.exif.iso && (
                    <p>
                      <strong>ISO:</strong> {metadata.exif.iso}
                    </p>
                  )}
                  {metadata.exif.dateTaken && (
                    <p>
                      <strong>Date Taken:</strong> {metadata.exif.dateTaken}
                    </p>
                  )}
                  {metadata.exif.software && (
                    <p>
                      <strong>Software:</strong> {metadata.exif.software}
                    </p>
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
