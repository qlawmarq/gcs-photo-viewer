import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumb = ({ path, onNavigate }: BreadcrumbProps) => {
  const segments = path.split("/").filter((segment) => segment.length > 0);

  const pathSegments = segments.map((segment, index) => {
    const fullPath = segments.slice(0, index + 1).join("/") + "/";
    return { name: segment, path: fullPath };
  });

  return (
    <div className="flex items-center space-x-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={() => onNavigate("")}
      >
        <Home className="h-4 w-4" />
      </Button>

      {pathSegments.map((segment, _index) => (
        <div key={segment.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-500" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => onNavigate(segment.path)}
          >
            {segment.name}
          </Button>
        </div>
      ))}
    </div>
  );
};
