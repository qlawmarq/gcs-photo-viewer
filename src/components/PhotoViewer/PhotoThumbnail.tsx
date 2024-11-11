import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder } from "lucide-react";
import { FileItem } from "@/app/api/photos/route";

interface PhotoThumbnailProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  credentials: string;
  projectId: string;
  bucketName: string;
}

export const PhotoThumbnail = ({
  item,
  onClick,
  credentials,
  projectId,
  bucketName,
}: PhotoThumbnailProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "50px" }
    );

    if (thumbnailRef.current) {
      observer.observe(thumbnailRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load image");
  };

  const getThumbnailUrl = () => {
    const params = new URLSearchParams({
      credentials: encodeURIComponent(credentials),
      projectId,
      bucketName,
      path: item.path,
    });
    return `/api/image/thumbnail?${params.toString()}`;
  };

  if (item.type === "folder") {
    return (
      <Card
        className="group relative aspect-square overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200 flex items-center justify-center bg-gray-50"
        onClick={() => onClick(item)}
      >
        <Folder className="w-12 h-12 text-gray-400" />
        <div className="absolute bottom-0 left-0 right-0 bg-gray-100 p-2">
          <p className="text-sm text-gray-600 truncate">{item.name}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      ref={thumbnailRef}
      className="group relative aspect-square overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-200"
      onClick={() => onClick(item)}
    >
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}

      {isInView && (
        <img
          src={getThumbnailUrl()}
          alt={item.name}
          className={`
            w-full h-full object-cover
            transition-opacity duration-200
            ${isLoading ? "opacity-0" : "opacity-100"}
          `}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      <div
        className="
        absolute bottom-0 left-0 right-0
        bg-gradient-to-t from-black/50 to-transparent
        p-2
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
      "
      >
        <p className="text-white text-sm truncate">{item.name}</p>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-500 text-sm">Failed to load</p>
        </div>
      )}
    </Card>
  );
};
