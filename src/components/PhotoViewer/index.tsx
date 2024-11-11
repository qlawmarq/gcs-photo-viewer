import { useState, useCallback } from "react";
import { PhotoGrid } from "./PhotoGrid";
import { PhotoModal } from "./PhotoModal";
import { Breadcrumb } from "../Breadcrumb";
import { FileItem } from "@/app/api/photos/route";

interface PhotoViewerProps {
  items: FileItem[];
  currentPath: string;
  onNavigate: (path: string) => Promise<void>;
  onLoadMore: () => Promise<void>;
  credentials: string;
  projectId: string;
  bucketName: string;
  hasMore: boolean;
}

export const PhotoViewer = ({
  items,
  currentPath,
  onNavigate,
  onLoadMore,
  credentials,
  projectId,
  bucketName,
  hasMore,
}: PhotoViewerProps) => {
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const handleItemClick = useCallback(
    async (item: FileItem) => {
      if (item.type === "folder") {
        await onNavigate(item.path);
      } else {
        setSelectedItem(item);
      }
    },
    [onNavigate]
  );

  return (
    <div className="flex flex-col h-full">
      {/* ナビゲーションヘッダー */}
      <div className="flex items-center space-x-2 p-4 bg-gray-50 border-b rounded-t-lg">
        <Breadcrumb path={currentPath} onNavigate={onNavigate} />
      </div>

      {/* 画像グリッド */}
      <div className="flex-1 overflow-hidden">
        <PhotoGrid
          items={items}
          onItemClick={handleItemClick}
          onLoadMore={onLoadMore}
          credentials={credentials}
          projectId={projectId}
          bucketName={bucketName}
          hasMore={hasMore}
        />
      </div>

      {/* 画像詳細モーダル */}
      <PhotoModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        credentials={credentials}
        projectId={projectId}
        bucketName={bucketName}
      />
    </div>
  );
};
