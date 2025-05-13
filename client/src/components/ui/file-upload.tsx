import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  onFileDataUrl?: (dataUrl: string | null) => void;
  value?: string | null;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileChange,
  onFileDataUrl,
  value,
  accept = "image/*",
  maxSizeMB = 5
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null);
    
    if (!file) {
      onFileChange(null);
      setPreview(null);
      if (onFileDataUrl) onFileDataUrl(null);
      return;
    }
    
    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    // Set the file for form handling
    onFileChange(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreview(dataUrl);
      if (onFileDataUrl) onFileDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileChange(null);
    setPreview(null);
    if (onFileDataUrl) onFileDataUrl(null);
    setError(null);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose File
        </Button>
        
        {preview && (
          <Button 
            type="button" 
            variant="destructive" 
            size="icon"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
      />
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {preview && (
        <div className="mt-2">
          <div className="border border-border rounded-md overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-auto max-h-48 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}