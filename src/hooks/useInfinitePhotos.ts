import { FileItem } from "@/app/api/photos/route";
import { useState, useCallback, useRef } from "react";

interface UseInfinitePhotosProps {
  credentials: string;
  projectId: string;
  bucketName: string;
  path: string;
  itemsPerPage: number;
}

interface PhotosResponse {
  items: FileItem[];
  currentPath: string;
  pageToken: string | null;
  hasMore: boolean;
}

export const useInfinitePhotos = ({
  credentials,
  projectId,
  bucketName,
  path,
  itemsPerPage,
}: UseInfinitePhotosProps) => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const pageTokenRef = useRef<string | null>(null);

  const fetchItems = useCallback(
    async (isRefresh: boolean = false) => {
      if (!credentials || !projectId || !bucketName) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentials: JSON.parse(credentials),
            projectId,
            bucketName,
            prefix: path,
            limit: itemsPerPage,
            pageToken: isRefresh ? null : pageTokenRef.current,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = (await response.json()) as PhotosResponse;
        const newItems = data.items || [];

        setItems((prevItems) =>
          isRefresh ? newItems : [...prevItems, ...newItems]
        );
        setHasMore(data.hasMore);
        pageTokenRef.current = data.pageToken;
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [credentials, projectId, bucketName, path, itemsPerPage]
  );

  const refresh = useCallback(async () => {
    pageTokenRef.current = null;
    setItems([]);
    setHasMore(true);
    await fetchItems(true);
  }, [fetchItems]);

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchItems();
    }
  }, [isLoading, hasMore, fetchItems]);

  return {
    items,
    hasMore,
    isLoading,
    loadMore,
    refresh,
  };
};
