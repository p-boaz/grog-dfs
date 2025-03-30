"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./button";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ message: string; targetDate: string }>;
  onError: (error: string) => void;
  onSuccess: (result: { message: string; targetDate: string }) => void;
}

export function FileUpload({ onUpload, onError, onSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const result = await onUpload(selectedFile);
      onSuccess(result);
      setSelectedFile(null);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the file here"
            : "Drag and drop a CSV file, or click to select"}
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <span className="text-sm truncate">{selectedFile.name}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="h-6"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
