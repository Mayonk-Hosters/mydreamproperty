import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema, Property, Agent, PropertyType, DEFAULT_PROPERTY_TYPES, PROPERTY_STATUS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAdmin } from "@/hooks/use-admin";
import { z } from "zod";

const editPropertySchema = insertPropertySchema.extend({
  id: z.number(),
});

type EditPropertyFormData = z.infer<typeof editPropertySchema>;

export default function AdminPropertyEditPage() {
  const [, params] = useRoute("/admin/properties/edit/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAdmin, isLoading: isLoadingAuth, requireAdmin } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    requireAdmin();
  }, [isLoadingAuth, isAdmin]);

  // Fetch property data
  const { data: property, isLoading: isLoadingProperty, error } = useQuery<Property>({
    queryKey: [`/api/properties/${params?.id}`],
    enabled: !!params?.id && !isLoadingAuth,
  });

  // Fetch agents for dropdown
  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    enabled: !isLoadingAuth,
  });

  // Fetch property types for dropdown
  const { data: propertyTypes } = useQuery<PropertyType[]>({
    queryKey: ["/api/property-types"],
    enabled: !isLoadingAuth,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditPropertyFormData>({
    resolver: zodResolver(editPropertySchema),
  });

  // Set form values when property data loads
  useEffect(() => {
    if (property) {
      setValue("id", property.id);
      setValue("title", property.title);
      setValue("description", property.description);
      setValue("price", property.price);
      setValue("location", property.location);
      setValue("address", property.address);
      setValue("beds", property.beds);
      setValue("baths", property.baths);
      setValue("area", property.area);
      setValue("propertyType", property.propertyType);
      setValue("type", property.type);
      setValue("status", property.status || "active");
      setValue("featured", property.featured || false);
      setValue("agentId", property.agentId);
      setValue("yearBuilt", property.yearBuilt || undefined);
      setValue("parking", property.parking || undefined);
      setValue("mapUrl", property.mapUrl || "");
      setValue("maharera_registered", property.maharera_registered || false);
      
      // Handle images
      if (property.images) {
        if (Array.isArray(property.images)) {
          setValue("images", property.images.join(", "));
        } else if (typeof property.images === "string") {
          try {
            const parsedImages = JSON.parse(property.images);
            if (Array.isArray(parsedImages)) {
              setValue("images", parsedImages.join(", "));
            } else {
              setValue("images", property.images);
            }
          } catch {
            setValue("images", property.images);
          }
        }
      }
      
      // Handle features
      if (property.features) {
        if (typeof property.features === "string") {
          setValue("features", property.features);
        } else {
          setValue("features", JSON.stringify(property.features));
        }
      }
    }
  }, [property, setValue]);

  const onSubmit = async (data: EditPropertyFormData) => {
    if (!property) return;
    
    setIsSubmitting(true);
    try {
      // Process images
      let processedImages;
      if (data.images && typeof data.images === "string") {
        processedImages = data.images.split(",").map(url => url.trim()).filter(url => url);
      } else {
        processedImages = data.images || [];
      }

      // Process features
      let processedFeatures;
      if (data.features && typeof data.features === "string") {
        try {
          processedFeatures = JSON.parse(data.features);
        } catch {
          processedFeatures = data.features;
        }
      } else {
        processedFeatures = data.features;
      }

      const updateData = {
        ...data,
        images: processedImages,
        features: processedFeatures,
      };

      await apiRequest(`/api/properties/${property.id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      toast({
        title: "Success",
        description: "Property updated successfully",
      });

      setLocation("/admin/properties");
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  if (isLoadingProperty) {
    return (
      <AdminLayout>
        <div>Loading property...</div>
      </AdminLayout>
    );
  }

  if (error || !property) {
    return (
      <AdminLayout>
        <div className="text-red-600">
          <AlertTriangle className="inline mr-2" />
          Failed to load property
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Edit Property - My Dream Property Admin</title>
      </Helmet>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Property</h1>
            <p className="text-gray-600">Update property information</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation("/admin/properties")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter property title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter property description"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="Enter price in rupees"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select onValueChange={(value) => setValue("propertyType", value)} value={watch("propertyType")}>
                <SelectTrigger className={errors.propertyType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  {propertyTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter location (e.g., Baner, Pune)"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Enter full address"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Property Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="beds">Bedrooms</Label>
              <Input
                id="beds"
                type="number"
                {...register("beds", { valueAsNumber: true })}
                placeholder="Number of bedrooms"
                className={errors.beds ? "border-red-500" : ""}
              />
              {errors.beds && (
                <p className="text-red-500 text-sm mt-1">{errors.beds.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="baths">Bathrooms</Label>
              <Input
                id="baths"
                type="number"
                {...register("baths", { valueAsNumber: true })}
                placeholder="Number of bathrooms"
                className={errors.baths ? "border-red-500" : ""}
              />
              {errors.baths && (
                <p className="text-red-500 text-sm mt-1">{errors.baths.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="area">Area (sq ft)</Label>
              <Input
                id="area"
                type="number"
                {...register("area", { valueAsNumber: true })}
                placeholder="Area in square feet"
                className={errors.area ? "border-red-500" : ""}
              />
              {errors.area && (
                <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="yearBuilt">Year Built (Optional)</Label>
              <Input
                id="yearBuilt"
                type="number"
                {...register("yearBuilt", { valueAsNumber: true })}
                placeholder="Year built"
              />
            </div>

            <div>
              <Label htmlFor="parking">Parking Spaces (Optional)</Label>
              <Input
                id="parking"
                type="number"
                {...register("parking", { valueAsNumber: true })}
                placeholder="Number of parking spaces"
              />
            </div>

            <div>
              <Label htmlFor="mapUrl">Map URL (Optional)</Label>
              <Input
                id="mapUrl"
                {...register("mapUrl")}
                placeholder="Google Maps or location URL"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="images">Image URLs (comma-separated)</Label>
              <Textarea
                id="images"
                {...register("images")}
                placeholder="Enter image URLs separated by commas"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter multiple image URLs separated by commas
              </p>
            </div>

            <div>
              <Label htmlFor="features">Features (JSON format, optional)</Label>
              <Textarea
                id="features"
                {...register("features")}
                placeholder='{"parking": true, "swimming_pool": false, "garden": true}'
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter features in JSON format, e.g., {"{\"parking\": true, \"garden\": false}"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="type">Transaction Type</Label>
                <Select onValueChange={(value) => setValue("type", value)} value={watch("type")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setValue("status", value)} value={watch("status")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="agentId">Agent</Label>
                <Select onValueChange={(value) => setValue("agentId", parseInt(value))} value={watch("agentId")?.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="rounded border-gray-300"
                />
                <span>Featured Property</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("maharera_registered")}
                  className="rounded border-gray-300"
                />
                <span>MahaRERA Registered</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/admin/properties")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Updating..." : "Update Property"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}