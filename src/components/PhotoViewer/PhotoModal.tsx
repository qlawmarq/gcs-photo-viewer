import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageDisplay } from "../ImageDisplay";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FileItem } from "@/app/api/photos/route";

interface PhotoModalProps {
  item: FileItem | null;
  onClose: () => void;
  credentials: string;
  projectId: string;
  bucketName: string;
}

export const PhotoModal = ({
  item,
  onClose,
  credentials,
  projectId,
  bucketName,
}: PhotoModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold truncate pr-4">
            {item.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <ImageDisplay
            item={item}
            credentials={credentials}
            projectId={projectId}
            bucketName={bucketName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
