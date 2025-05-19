import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Property, 
  PropertyType,
  DEFAULT_PROPERTY_TYPES, 
  PROPERTY_STATUS, 
  insertPropertySchema,
  State,
  District,
  Taluka,
  Tehsil 
} from "@shared/schema";
import { PropertyTypeDialog } from "./property-type-dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { getPropertyImage, getInteriorImage } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Extend the property schema with additional validation but make validation more flexible
const formSchema = insertPropertySchema.extend({
  // Allow zero values during form editing, we'll handle min values during submission
  price: z.number().nonnegative("Price must be a non-negative number"),
  beds: z.number().int().nonnegative("Beds must be a non-negative integer"),
  baths: z.number().nonnegative("Baths must be a non-negative number"),
  area: z.number().int().nonnegative("Area must be a non-negative integer"),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  propertyNumber: z.string().optional(),
  mapUrl: z.string().url("Please enter a valid URL").optional(),
  // MahaRERA registration status
  maharera_registered: z.boolean().optional().default(false),
  // Add location hierarchy fields as optional
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  talukaId: z.string().optional(),
  tehsilId: z.string().optional(),
});

interface PropertyFormProps {
  property?: Property;
  onSuccess?: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState<string | null>(null);
  const [selectedTehsilId, setSelectedTehsilId] = useState<string | null>(null);
  const [isAddPropertyTypeOpen, setIsAddPropertyTypeOpen] = useState(false);
  const [generatingPropertyNumber, setGeneratingPropertyNumber] = useState(false);
  
  // State for property features management
  const [newFeature, setNewFeature] = useState<string>("");
  const featureInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch states
  const statesQuery = useQuery<State[]>({
    queryKey: ['/api/locations/states'],
    enabled: true,
  });
  
  // Fetch districts based on selected state
  const districtsQuery = useQuery<District[]>({
    queryKey: ['/api/locations/districts', { stateId: selectedStateId }],
    queryFn: async ({ queryKey }) => {
      const params = new URLSearchParams();
      if (selectedStateId) {
        params.append('stateId', selectedStateId);
      }
      const response = await fetch(`/api/locations/districts?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      return response.json();
    },
    enabled: !!selectedStateId,
  });
  
  // Fetch talukas based on selected district
  const talukasQuery = useQuery<Taluka[]>({
    queryKey: ['/api/locations/talukas', { districtId: selectedDistrictId }],
    queryFn: async ({ queryKey }) => {
      const params = new URLSearchParams();
      if (selectedDistrictId) {
        params.append('districtId', selectedDistrictId);
      }
      const response = await fetch(`/api/locations/talukas?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch talukas');
      }
      return response.json();
    },
    enabled: !!selectedDistrictId,
  });
  
  // Fetch tehsils based on selected taluka
  const tehsilsQuery = useQuery<Tehsil[]>({
    queryKey: ['/api/locations/tehsils', { talukaId: selectedTalukaId }],
    queryFn: async ({ queryKey }) => {
      const params = new URLSearchParams();
      if (selectedTalukaId) {
        params.append('talukaId', selectedTalukaId);
      }
      const response = await fetch(`/api/locations/tehsils?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tehsils');
      }
      return response.json();
    },
    enabled: !!selectedTalukaId,
  });
  
  // Fetch agents
  const agentsQuery = useQuery({
    queryKey: ['/api/agents'],
    enabled: true,
  });
  
  // Track the selected agent for display
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Fetch all properties (needed for property number generation)
  const { data: propertiesData } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    enabled: !property, // Only needed when creating new properties
  });
  
  // Fetch property types
  const propertyTypesQuery = useQuery<PropertyType[]>({
    queryKey: ['/api/property-types'],
    enabled: true,
  });

  // Set default values for a new property
  const defaultValues = property ? {
    ...property,
    stateId: property.stateId ? property.stateId.toString() : undefined,
    districtId: property.districtId ? property.districtId.toString() : undefined,
    talukaId: property.talukaId ? property.talukaId.toString() : undefined,
    tehsilId: property.tehsilId ? property.tehsilId.toString() : undefined,
    // Handle features properly
    features: property.features ? 
      (Array.isArray(property.features) ? property.features : 
       (typeof property.features === 'string' ? 
         JSON.parse(property.features) : [])) : [],
  } : {
    propertyNumber: "", // Will be auto-generated by the server if left empty
    title: "",
    description: "",
    price: 0,
    location: "",
    address: "",
    beds: 0,
    baths: 0,
    area: 0,
    yearBuilt: new Date().getFullYear(), // Default to current year
    features: [], // Initialize with empty array
    mapUrl: "", // Google Maps location URL
    propertyType: DEFAULT_PROPERTY_TYPES[0],
    type: "buy", // Default to buy
    status: PROPERTY_STATUS[0],
    featured: false,
    maharera_registered: false, // Default MahaRERA registration to false
    images: [
      getPropertyImage(0),
      getPropertyImage(1),
      getInteriorImage(0),
      getInteriorImage(1)
    ],
    agentId: 1, // Default agent ID
    createdAt: new Date().toISOString(),
    // Don't set default location values to force user selection
    stateId: undefined,
    districtId: undefined,
    talukaId: undefined,
    tehsilId: undefined,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (property) {
      // Reset form with property data
      form.reset(property);
      
      // Set location IDs if they exist
      if (property.stateId) {
        setSelectedStateId(property.stateId.toString());
      }
      if (property.districtId) {
        setSelectedDistrictId(property.districtId.toString());
      }
      if (property.talukaId) {
        setSelectedTalukaId(property.talukaId.toString());
      }
      if (property.tehsilId) {
        setSelectedTehsilId(property.tehsilId.toString());
      }
    }
  }, [property, form]);
  
  // Update dependent dropdowns when selection changes
  useEffect(() => {
    if (selectedStateId) {
      form.setValue('stateId', selectedStateId);
      
      // Only clear district/taluka/tehsil if the state has actually changed
      // and we're not just initializing the form
      if (property?.stateId && selectedStateId !== property.stateId.toString()) {
        form.setValue('districtId', undefined);
        form.setValue('talukaId', undefined);
        form.setValue('tehsilId', undefined);
        setSelectedDistrictId(null);
        setSelectedTalukaId(null);
        setSelectedTehsilId(null);
      }
    }
  }, [selectedStateId, form, property]);
  
  useEffect(() => {
    if (selectedDistrictId) {
      form.setValue('districtId', selectedDistrictId);
      
      // Only clear taluka/tehsil if the district has actually changed
      // and we're not just initializing the form
      if (property?.districtId && selectedDistrictId !== property.districtId.toString()) {
        form.setValue('talukaId', undefined);
        form.setValue('tehsilId', undefined);
        setSelectedTalukaId(null);
        setSelectedTehsilId(null);
      }
    }
  }, [selectedDistrictId, form, property]);
  
  useEffect(() => {
    if (selectedTalukaId) {
      form.setValue('talukaId', selectedTalukaId);
      
      // Only clear tehsil if the taluka has actually changed
      // and we're not just initializing the form
      if (property?.talukaId && selectedTalukaId !== property.talukaId.toString()) {
        form.setValue('tehsilId', undefined);
        setSelectedTehsilId(null);
      }
    }
  }, [selectedTalukaId, form, property]);
  
  useEffect(() => {
    if (selectedTehsilId) {
      form.setValue('tehsilId', selectedTehsilId);
    }
  }, [selectedTehsilId, form]);
  
  // Initialize selected agent when form loads or property changes
  useEffect(() => {
    if (property && property.agentId && agentsQuery.data) {
      const agent = agentsQuery.data.find(a => a.id === property.agentId);
      setSelectedAgent(agent || null);
    }
  }, [property, agentsQuery.data]);
  
  // Feature management functions
  const addFeature = () => {
    if (!newFeature.trim()) return;
    
    // Get current features from form
    let currentFeatures = form.getValues("features");
    
    // Handle various data types that might come from the database
    if (!currentFeatures || currentFeatures === null) {
      currentFeatures = [];
    } else if (typeof currentFeatures === 'string') {
      try {
        currentFeatures = JSON.parse(currentFeatures);
      } catch (e) {
        currentFeatures = [];
      }
    }
    
    if (!Array.isArray(currentFeatures)) {
      currentFeatures = [];
    }
    
    // Add new feature if it doesn't already exist
    if (!currentFeatures.includes(newFeature.trim())) {
      form.setValue("features", [...currentFeatures, newFeature.trim()]);
      console.log("Feature added:", [...currentFeatures, newFeature.trim()]);
      setNewFeature("");
      
      // Focus back on input for adding another feature
      if (featureInputRef.current) {
        featureInputRef.current.focus();
      }
    } else {
      toast({
        title: "Feature already exists",
        description: "This feature has already been added to the property.",
        variant: "destructive",
      });
    }
  };
  
  const removeFeature = (feature: string) => {
    let currentFeatures = form.getValues("features");
    
    // Handle various data types that might come from the database
    if (!currentFeatures || currentFeatures === null) {
      currentFeatures = [];
    } else if (typeof currentFeatures === 'string') {
      try {
        currentFeatures = JSON.parse(currentFeatures);
      } catch (e) {
        currentFeatures = [];
      }
    }
    
    if (!Array.isArray(currentFeatures)) {
      currentFeatures = [];
    }
    
    form.setValue(
      "features",
      currentFeatures.filter((f) => f !== feature)
    );
    console.log("Feature removed, new list:", currentFeatures.filter((f) => f !== feature));
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Prepare detailed location description
      let locationDetail = '';
      
      // Build location details from selections
      if (selectedTehsilId && tehsilsQuery.data) {
        const tehsil = tehsilsQuery.data.find(t => t.id.toString() === selectedTehsilId);
        if (tehsil) {
          locationDetail += tehsil.name;
          if (tehsil.area) {
            locationDetail += `, ${tehsil.area}`;
          }
        }
      }
      
      if (selectedTalukaId && talukasQuery.data) {
        const taluka = talukasQuery.data.find(t => t.id.toString() === selectedTalukaId);
        if (taluka) {
          locationDetail += locationDetail ? `, ${taluka.name} Taluka` : taluka.name + ' Taluka';
        }
      }
      
      if (selectedDistrictId && districtsQuery.data) {
        const district = districtsQuery.data.find(d => d.id.toString() === selectedDistrictId);
        if (district) {
          locationDetail += locationDetail ? `, ${district.name} District` : district.name + ' District';
        }
      }
      
      if (selectedStateId && statesQuery.data) {
        const state = statesQuery.data.find(s => s.id.toString() === selectedStateId);
        if (state) {
          locationDetail += locationDetail ? `, ${state.name}` : state.name;
        }
      }
      
      // If the user provided additional location info, append it
      if (data.location && locationDetail) {
        locationDetail += `, ${data.location}`;
      } else if (data.location) {
        locationDetail = data.location;
      }
      
      // Ensure images is an array
      const updatedImages = Array.isArray(data.images) ? data.images : [];
      
      // Create a clean property data object without any extra fields
      const propertyData: Record<string, any> = {
        title: data.title || 'Untitled Property',
        description: data.description || 'No description provided',
        price: data.price > 0 ? data.price : 1000,
        location: locationDetail || data.location || 'Location not specified',
        address: data.address || 'Address not provided',
        beds: data.beds > 0 ? Math.floor(data.beds) : 1,
        baths: data.baths > 0 ? data.baths : 1,
        area: data.area > 0 ? Math.floor(data.area) : 100,
        propertyType: data.propertyType || 'House',
        type: data.type || 'buy',
        status: data.status || 'active',
        featured: Boolean(data.featured),
        // Include MahaRERA registration status
        maharera_registered: Boolean(data.maharera_registered),
        // Include Google Maps URL if provided
        mapUrl: data.mapUrl || null,
        // Properly handle features data
        features: Array.isArray(data.features) ? data.features : 
                 (typeof data.features === 'string' ? 
                   (data.features ? JSON.parse(data.features) : []) : []),
        images: updatedImages,
        agentId: data.agentId ? parseInt(data.agentId.toString()) : 1
      };
      
      // Add location IDs if they have values
      if (selectedStateId) {
        propertyData.stateId = parseInt(selectedStateId);
      }
      
      if (selectedDistrictId) {
        propertyData.districtId = parseInt(selectedDistrictId);
      }
      
      if (selectedTalukaId) {
        propertyData.talukaId = parseInt(selectedTalukaId);
      }
      
      if (selectedTehsilId) {
        propertyData.tehsilId = parseInt(selectedTehsilId);
      }
      
      // Log the property data for debugging
      console.log('Saving property data:', propertyData);
      
      try {
        if (property) {
          // Update existing property
          await apiRequest('PATCH', `/api/properties/${property.id}`, propertyData);
          // Invalidate cache to refresh the data
          queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
          queryClient.invalidateQueries({ queryKey: ['/api/properties', property.id] });
          
          toast({
            title: "Property updated",
            description: "The property has been updated successfully.",
          });
        } else {
          // Create new property
          await apiRequest('POST', '/api/properties', propertyData);
          // Invalidate cache to refresh the data
          queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
          
          toast({
            title: "Property created",
            description: "The property has been created successfully.",
          });
        }
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/admin/properties');
        }
      } catch (error) {
        console.error('Error saving property:', error);
        toast({
          title: "Error saving property",
          description: "There was a problem saving the property. Please check the form and try again.",
          variant: "destructive",
        });
      }
      

    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "There was an error saving the property. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="propertyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Number</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input 
                        placeholder="MDP-XXX (Auto-generated if left empty)" 
                        {...field} 
                        value={field.value || ""} 
                        disabled={!!property}
                      />
                    </FormControl>
                    {!property && !field.value && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setGeneratingPropertyNumber(true);
                          // This will just initiate the request, the server will generate the number
                          // since it needs to check the database for the highest current number
                          // to ensure sequential numbering
                          
                          // Let server generate a sequential MDP-NUMBER-XXXX code
                          // The client doesn't need to calculate anything, since the server checks the entire database
                          
                          setTimeout(() => {
                            setGeneratingPropertyNumber(false);
                            // Use a placeholder indicating it will be auto-generated on the server
                            field.onChange("AUTO-GENERATE");
                          }, 500);
                        }}
                        disabled={generatingPropertyNumber}
                      >
                        {generatingPropertyNumber ? 
                          "Generating..." : 
                          "Generate Code"}
                      </Button>
                    )}
                  </div>
                  <FormDescription>
                    {property ? 
                      "Property number cannot be changed after creation" : 
                      "Click 'Generate Code' to create a unique sequential property number (MDP format)"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter property title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter property description"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter price"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value === "add-new") {
                          // Open the dialog to add a new property type
                          setIsAddPropertyTypeOpen(true);
                          // Don't change the field value
                          return;
                        }
                        field.onChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Show loading state if property types are being fetched */}
                        {propertyTypesQuery.isLoading && (
                          <SelectItem value="loading" disabled>
                            Loading property types...
                          </SelectItem>
                        )}
                        
                        {/* Add New Property Type option */}
                        <SelectItem value="add-new">
                          <div className="flex items-center text-primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Property Type
                          </div>
                        </SelectItem>
                        
                        <div className="h-px bg-muted my-1" />
                        
                        {/* Show available property types from API */}
                        {propertyTypesQuery.data && propertyTypesQuery.data.length > 0 ? (
                          propertyTypesQuery.data
                            .filter(pt => pt.active)
                            .map((type) => (
                              <SelectItem key={type.id} value={type.name}>
                                {type.name}
                              </SelectItem>
                            ))
                        ) : (
                          // Fallback to default property types if API returns no data
                          DEFAULT_PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Whether this property is for buying, renting, or selling
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedStateId(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statesQuery.isLoading ? (
                            <SelectItem value="loading-state" disabled>Loading states...</SelectItem>
                          ) : statesQuery.data?.length === 0 ? (
                            <SelectItem value="none-state" disabled>No states found</SelectItem>
                          ) : (
                            statesQuery.data?.map((state) => (
                              <SelectItem key={state.id} value={state.id.toString()}>
                                {state.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="districtId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedDistrictId(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={!selectedStateId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {districtsQuery.isLoading ? (
                            <SelectItem value="loading-district" disabled>Loading districts...</SelectItem>
                          ) : !districtsQuery.data || districtsQuery.data.length === 0 ? (
                            <SelectItem value="none-district" disabled>No districts found</SelectItem>
                          ) : (
                            districtsQuery.data.map((district) => (
                              <SelectItem key={district.id} value={district.id.toString()}>
                                {district.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="talukaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taluka</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedTalukaId(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={!selectedDistrictId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select taluka" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {talukasQuery.isLoading ? (
                            <SelectItem value="loading-taluka" disabled>Loading talukas...</SelectItem>
                          ) : !talukasQuery.data || talukasQuery.data.length === 0 ? (
                            <SelectItem value="none-taluka" disabled>No talukas found</SelectItem>
                          ) : (
                            talukasQuery.data.map((taluka) => (
                              <SelectItem key={taluka.id} value={taluka.id.toString()}>
                                {taluka.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tehsilId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tehsil/Area</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedTehsilId(value);
                          field.onChange(value);
                        }}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={!selectedTalukaId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tehsil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tehsilsQuery.isLoading ? (
                            <SelectItem value="loading-tehsil" disabled>Loading tehsils...</SelectItem>
                          ) : !tehsilsQuery.data || tehsilsQuery.data.length === 0 ? (
                            <SelectItem value="none-tehsil" disabled>No tehsils found</SelectItem>
                          ) : (
                            tehsilsQuery.data.map((tehsil) => (
                              <SelectItem key={tehsil.id} value={tehsil.id.toString()}>
                                {tehsil.name} {tehsil.area ? `- ${tehsil.area}` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Location Info</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter additional location details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mapUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Maps Location Link</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Paste Google Maps URL here (e.g., https://maps.google.com/?q=...)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Paste a Google Maps link to help buyers find the exact property location
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="beds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beds</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of beds"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baths</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Number of baths"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sq ft)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Square footage"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="yearBuilt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year Built</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        placeholder="Year property was built"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Property Features Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Features</h3>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a property feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  ref={featureInputRef}
                  className="flex-1"
                />
                <Button type="button" onClick={addFeature} variant="secondary" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-md p-4">
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div>
                          {Array.isArray(field.value) && field.value.length > 0 ? (
                            <ScrollArea className="h-28 w-full">
                              <div className="flex flex-wrap gap-2 p-1">
                                {field.value.map((feature, index) => (
                                  <Badge key={index} variant="secondary" className="group">
                                    {feature}
                                    <button
                                      type="button"
                                      onClick={() => removeFeature(feature)}
                                      className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No features added yet. Add features to highlight property amenities.
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add features like "Air Conditioning", "Swimming Pool", "Garden", etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_STATUS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        // Set selected agent for contact info display
                        if (agentsQuery.data) {
                          const agent = agentsQuery.data.find(a => a.id.toString() === value);
                          setSelectedAgent(agent || null);
                        }
                      }}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agentsQuery.isLoading ? (
                          <SelectItem value="loading-agent" disabled>Loading agents...</SelectItem>
                        ) : !agentsQuery.data || agentsQuery.data.length === 0 ? (
                          <SelectItem value="none-agent" disabled>No agents found</SelectItem>
                        ) : (
                          agentsQuery.data.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {selectedAgent && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                        <h4 className="font-medium text-sm mb-1">Agent Contact Information</h4>
                        <div className="text-sm text-slate-600 space-y-1">
                          {selectedAgent.contactNumber ? (
                            <p className="flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              {selectedAgent.contactNumber}
                            </p>
                          ) : (
                            <p className="text-slate-400 italic text-xs">No contact number provided</p>
                          )}
                          
                          {selectedAgent.email ? (
                            <p className="flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                              {selectedAgent.email}
                            </p>
                          ) : (
                            <p className="text-slate-400 italic text-xs">No email provided</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Property</FormLabel>
                      <p className="text-sm text-gray-500">
                        This property will be displayed in the featured section.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maharera_registered"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>MahaRERA Registered</FormLabel>
                      <p className="text-sm text-gray-500">
                        Is this property registered under Maharashtra Real Estate Regulatory Authority (MahaRERA)?
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-md p-4">
              <FormLabel className="block mb-3">Property Images</FormLabel>
              
              {/* Display existing images if any */}
              {form.getValues("images") && Array.isArray(form.getValues("images")) && form.getValues("images").length > 0 ? (
                <>
                  <p className="text-sm text-gray-500 mb-3">
                    The property has {form.getValues("images").length} images attached.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {form.getValues("images").slice(0, 4).map((image, index) => (
                      <div key={index} className="h-20 overflow-hidden rounded">
                        <img 
                          src={image} 
                          alt={`Property image ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 mb-3">
                  No images are currently attached to this property.
                </p>
              )}
              
              {/* Image upload */}
              <div className="mt-3">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          onImageUpload={(imageUrls) => {
                            field.onChange(imageUrls);
                          }}
                          defaultImages={Array.isArray(field.value) ? field.value as string[] : []}
                          multiple={true}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload property images. You can upload multiple images.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/properties')}
          >
            Cancel
          </Button>
          <Button type="submit">
            {property ? "Update Property" : "Create Property"}
          </Button>
        </div>
      </form>

      {/* Use the PropertyTypeDialog component */}
      <PropertyTypeDialog 
        open={isAddPropertyTypeOpen} 
        onOpenChange={setIsAddPropertyTypeOpen}
        onPropertyTypeCreated={(name) => {
          // When a new property type is created, select it in the form
          form.setValue("propertyType", name);
        }}
      />
    </Form>
  );
}
