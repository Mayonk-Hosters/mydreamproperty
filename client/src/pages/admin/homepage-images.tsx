import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Image as ImageIcon, Eye, EyeOff, Upload, ArrowLeft } from "lucide-react";
import { HomepageImage } from "@shared/schema";
import { FileUpload } from "@/components/ui/file-upload";

const imageFormSchema = z.object({
  imageType: z.string().min(1, "Image type is required"),
  imageUrl: z.string().min(1, "Please upload an image"),
  title: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).default(0),
});

type ImageFormData = z.infer<typeof imageFormSchema>;

export default function AdminHomepageImagesPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<HomepageImage | null>(null);

  const form = useForm<ImageFormData>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      imageType: "",
      imageUrl: "",
      title: "",
      description: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Check if user is admin
  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin, requireAdmin]);

  // Fetch homepage images
  const { data: images, isLoading: isLoadingImages } = useQuery<HomepageImage[]>({
    queryKey: ["/api/homepage-images"],
    enabled: !isLoading,
  });

  // Create homepage image mutation
  const createImageMutation = useMutation({
    mutationFn: async (data: ImageFormData) => {
      const response = await fetch("/api/homepage-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-images"] });
      toast({ title: "Homepage image created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create homepage image", variant: "destructive" });
    },
  });

  // Update homepage image mutation
  const updateImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ImageFormData> }) => {
      const response = await fetch(`/api/homepage-images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-images"] });
      toast({ title: "Homepage image updated successfully" });
      setIsDialogOpen(false);
      setEditingImage(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update homepage image", variant: "destructive" });
    },
  });

  // Delete homepage image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/homepage-images/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete image");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homepage-images"] });
      toast({ title: "Homepage image deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete homepage image", variant: "destructive" });
    },
  });

  const handleSubmit = (data: ImageFormData) => {
    if (editingImage) {
      updateImageMutation.mutate({ id: editingImage.id, data });
    } else {
      createImageMutation.mutate(data);
    }
  };

  const handleEdit = (image: HomepageImage) => {
    setEditingImage(image);
    form.reset({
      imageType: image.imageType,
      imageUrl: image.imageUrl,
      title: image.title || "",
      description: image.description || "",
      isActive: image.isActive || false,
      sortOrder: image.sortOrder || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate(id);
    }
  };

  const toggleImageStatus = (image: HomepageImage) => {
    updateImageMutation.mutate({
      id: image.id,
      data: { isActive: !image.isActive },
    });
  };

  if (isLoading || isLoadingImages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Homepage Images</h1>
              <p className="text-gray-600 mt-2">Manage homepage display images and banners</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingImage(null);
                form.reset();
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Image
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingImage ? "Edit Homepage Image" : "Add New Homepage Image"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="imageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select image type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hero">Hero Background</SelectItem>
                            <SelectItem value="banner">Banner</SelectItem>
                            <SelectItem value="feature">Feature Image</SelectItem>
                            <SelectItem value="gallery">Gallery Image</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Image</FormLabel>
                        <FormControl>
                          <FileUpload
                            value={field.value}
                            onFileChange={async (file) => {
                              if (file) {
                                try {
                                  const formData = new FormData();
                                  formData.append('image', file);
                                  
                                  const response = await fetch('/api/upload-image', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  
                                  if (response.ok) {
                                    const data = await response.json();
                                    field.onChange(data.imageUrl);
                                  } else {
                                    console.error('Upload failed');
                                    toast({
                                      title: "Upload failed",
                                      description: "Failed to upload image. Please try again.",
                                      variant: "destructive"
                                    });
                                  }
                                } catch (error) {
                                  console.error('Upload error:', error);
                                  toast({
                                    title: "Upload error",
                                    description: "An error occurred while uploading the image.",
                                    variant: "destructive"
                                  });
                                }
                              } else {
                                field.onChange("");
                              }
                            }}
                            accept="image/*"
                            maxSizeMB={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Image title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Image description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4">
                    <FormField
                      control={form.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Sort Order</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              placeholder="0" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Active</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createImageMutation.isPending || updateImageMutation.isPending}
                    >
                      {(createImageMutation.isPending || updateImageMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingImage ? "Update Image" : "Create Image"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images?.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={image.imageUrl}
                  alt={image.title || "Homepage image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m3 16 4-4 4 4 8-8'/%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={image.isActive ? "default" : "secondary"}>
                    {image.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{image.title || "Untitled"}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {image.imageType}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Order: {image.sortOrder}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {image.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {image.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleImageStatus(image)}
                    >
                      {image.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      disabled={deleteImageMutation.isPending}
                    >
                      {deleteImageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {images?.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No homepage images</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first homepage image.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}