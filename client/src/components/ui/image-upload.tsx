import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageUrls: string[]) => void;
  defaultImages?: string[];
  multiple?: boolean;
  maxImages?: number;
}

export function ImageUpload({
  onImageUpload,
  defaultImages = [],
  multiple = true,
  maxImages = 10,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    try {
      // Check if we'd exceed the maximum number of images
      if (images.length + files.length > maxImages) {
        setError(`You can upload a maximum of ${maxImages} images.`);
        setIsUploading(false);
        return;
      }

      // Convert files to data URLs
      const newImageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setError("Please select image files only.");
          setIsUploading(false);
          return;
        }

        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            if (e.target && e.target.result) {
              resolve(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
        
        newImageUrls.push(imageUrl);
      }

      // Update state with new images
      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      onImageUpload(updatedImages);
    } catch (error) {
      setError("Error uploading images. Please try again.");
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    onImageUpload(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={isUploading} 
          multiple={multiple}
          className="flex-1"
          ref={fileInputRef}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {multiple ? "Upload Images" : "Upload Image"}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img 
                src={imageUrl} 
                alt={`Preview ${index + 1}`} 
                className="h-24 w-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}