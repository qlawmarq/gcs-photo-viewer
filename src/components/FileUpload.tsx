import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (content: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({
  onFileSelect,
  accept = "application/json",
  maxSize = 1024 * 1024, // 1MB default
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      if (!file.type && !file.name.endsWith(".json")) {
        setError("Please upload a JSON file");
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
        return;
      }

      try {
        const text = await file.text();
        // Validate JSON format
        JSON.parse(text);
        setFileName(file.name);
        onFileSelect(text);
      } catch (_e) {
        setError("Invalid JSON format");
      }
    },
    [maxSize, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const clearFile = useCallback(() => {
    setFileName(null);
    onFileSelect("");
  }, [onFileSelect]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Label>Credentials File</Label>

          {fileName ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <FileIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{fileName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="hover:bg-red-100"
              >
                <XIcon className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center 
                ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-gray-300"
                }
                transition-colors duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <UploadIcon className="w-8 h-8 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drag and drop your credentials file here, or
                  </p>
                  <label className="relative">
                    <Button variant="secondary" size="sm">
                      Choose File
                    </Button>
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept={accept}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
