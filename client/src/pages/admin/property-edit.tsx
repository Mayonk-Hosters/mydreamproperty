import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { ArrowLeft, Save, AlertTriangle, Lightbulb, Info, IndianRupee, MapPin, Home, Camera } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [showQuickTips, setShowQuickTips] = useState(true);

  useEffect(() => {
    requireAdmin();
  }, [isLoadingAuth, isAdmin]);

  // Quick Tips Component
  const QuickTipsCard = () => (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <Collapsible open={showQuickTips} onOpenChange={setShowQuickTips}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-blue-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-800">Quick Edit Tips</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                {showQuickTips ? "Hide Tips" : "Show Tips"}
              </Button>
            </div>
            <CardDescription className="text-blue-700">
              Professional editing guidelines for optimal property listings
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pricing Tips */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                <IndianRupee className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Pricing Guidelines</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use market-competitive rates</li>
                    <li>• Round to nearest thousand (₹25,00,000)</li>
                    <li>• Consider location premium/discount</li>
                  </ul>
                </div>
              </div>

              {/* Location Tips */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Location Format</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Format: "Area, City"</li>
                    <li>• Example: "Baner, Pune"</li>
                    <li>• Use proper landmarks if needed</li>
                  </ul>
                </div>
              </div>

              {/* Property Details */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                <Home className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Property Details</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Beds/Baths: Use realistic numbers</li>
                    <li>• Area: Square feet preferred</li>
                    <li>• Type: Match actual structure</li>
                  </ul>
                </div>
              </div>

              {/* Images Tips */}
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                <Camera className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Image Guidelines</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use high-quality, well-lit photos</li>
                    <li>• Include exterior and interior shots</li>
                    <li>• Separate URLs with commas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-600" />
                One-Click Actions
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentPrice = watch("price");
                    if (currentPrice) {
                      const roundedPrice = Math.round(currentPrice / 100000) * 100000;
                      setValue("price", roundedPrice);
                      toast({ title: "Price rounded to nearest lakh", description: `Set to ₹${roundedPrice.toLocaleString()}` });
                    }
                  }}
                  className="text-xs"
                >
                  Round Price
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setValue("status", "active");
                    toast({ title: "Status set to Active" });
                  }}
                  className="text-xs"
                >
                  Set Active
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentFeatures = watch("features");
                    if (!currentFeatures) {
                      setValue("features", '{"parking": true, "security": true, "maintenance": true}');
                      toast({ title: "Basic features added" });
                    }
                  }}
                  className="text-xs"
                >
                  Add Basic Features
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

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
      setValue("type", property.type || "buy");
      setValue("status", property.status || "active");
      setValue("agentId", property.agentId);
      setValue("mapUrl", property.mapUrl || "");
      setValue("yearBuilt", property.yearBuilt || undefined);
      setValue("features", property.features ? JSON.stringify(property.features) : "");
      setValue("images", Array.isArray(property.images) ? property.images.join(",") : "");
    }
  }, [property, setValue]);

  const onSubmit = async (data: EditPropertyFormData) => {
    setIsSubmitting(true);
    try {
      // Process images and features
      const processedData = {
        ...data,
        images: data.images ? data.images.split(",").map(img => img.trim()).filter(Boolean) : [],
        features: data.features ? JSON.parse(data.features) : null,
      };

      await apiRequest("PATCH", `/api/properties/${params?.id}`, processedData);

      toast({
        title: "Property updated",
        description: "The property has been updated successfully.",
      });

      setLocation("/admin/properties");
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error updating the property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-lg font-medium text-red-800">Error loading property</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            The property could not be found or there was an error loading it.
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/admin/properties")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (isLoadingProperty) {
    return (
      <AdminLayout>
        <div className="min-h-96 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Edit Property | Admin | My Dream Property</title>
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

      <QuickTipsCard />

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
              <Label htmlFor="area">Area (sq ft)</Label>
              <Input
                id="area"
                type="number"
                {...register("area", { valueAsNumber: true })}
                placeholder="Enter area in square feet"
                className={errors.area ? "border-red-500" : ""}
              />
              {errors.area && (
                <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={watch("propertyType")}
                onValueChange={(value) => setValue("propertyType", value)}
              >
                <SelectTrigger className={errors.propertyType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {(propertyTypes?.filter(pt => pt.active) || DEFAULT_PROPERTY_TYPES).map((type) => (
                    <SelectItem key={typeof type === 'string' ? type : type.name} value={typeof type === 'string' ? type : type.name}>
                      {typeof type === 'string' ? type : type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyType && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="agentId">Assigned Agent</Label>
              <Select
                value={watch("agentId")?.toString()}
                onValueChange={(value) => setValue("agentId", parseInt(value))}
              >
                <SelectTrigger className={errors.agentId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.agentId && (
                <p className="text-red-500 text-sm mt-1">{errors.agentId.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Location & Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter location (city, area)"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Full Address</Label>
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
              <Label htmlFor="yearBuilt">Year Built (Optional)</Label>
              <Input
                id="yearBuilt"
                type="number"
                {...register("yearBuilt", { 
                  setValueAs: (value) => value === "" ? undefined : parseInt(value)
                })}
                placeholder="Year built"
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
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Property
              </>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}