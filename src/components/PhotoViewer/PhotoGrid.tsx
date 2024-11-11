import { useRef, useCallback, useEffect, useState } from "react";
import { PhotoThumbnail } from "./PhotoThumbnail";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileItem } from "@/app/api/photos/route";

interface PhotoGridProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onLoadMore: () => Promise<void>;
  credentials: string;
  projectId: string;
  bucketName: string;
  hasMore: boolean;
}

export const PhotoGrid = ({
  items,
  onItemClick,
  onLoadMore,
  credentials,
  projectId,
  bucketName,
  hasMore,
}: PhotoGridProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const lastItemRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true);
        await onLoadMore();
        setIsLoading(false);
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    });

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [handleObserver]);

  // Check last ref
  useEffect(() => {
    if (lastItemRef.current && observerRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }
  }, [items]);

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {items.map((item, index) => (
          <div
            key={item.path}
            ref={index === items.length - 1 ? lastItemRef : undefined}
          >
            <PhotoThumbnail
              item={item}
              onClick={onItemClick}
              credentials={credentials}
              projectId={projectId}
              bucketName={bucketName}
            />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="text-primary">Loading more images...</div>
        </div>
      )}
    </ScrollArea>
  );
};
