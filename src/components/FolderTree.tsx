import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TreeItem {
  name: string;
  type: "folder" | "file";
  path: string;
  url?: string;
}

interface FolderTreeProps {
  items: TreeItem[];
  onSelect: (item: TreeItem) => void;
  selectedPath: string;
  className?: string;
}

interface TreeNodeProps {
  item: TreeItem;
  level: number;
  onSelect: (item: TreeItem) => void;
  selectedPath: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  level,
  onSelect,
  selectedPath,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item);
  };

  const isSelected = selectedPath === item.path;

  return (
    <Button
      variant="ghost"
      className={`w-full flex items-center gap-2 p-2 h-auto font-normal justify-start ${
        isSelected ? "bg-gray-100" : ""
      }`}
      style={{ paddingLeft: `${level * 16}px` }}
      onClick={handleSelect}
    >
      {item.type === "folder" ? (
        <>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {isOpen ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
        </>
      ) : (
        <File className="h-4 w-4" />
      )}
      <span className="text-sm truncate">{item.name}</span>
    </Button>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({
  items,
  onSelect,
  selectedPath,
  className = "",
}) => {
  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <TreeNode
            item={item}
            level={1}
            onSelect={onSelect}
            selectedPath={selectedPath}
          />
          {index < items.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
};
