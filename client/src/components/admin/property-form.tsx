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

// Form schema with proper typing
const formSchema = insertPropertySchema.extend({
  price: z.number().nonnegative("Price must be a non-negative number"),
  beds: z.number().int().nonnegative("Beds must be a non-negative integer"),
  baths: z.number().nonnegative("Baths must be a non-negative number"),
  area: z.number().int().nonnegative("Area must be a non-negative integer"),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  parking: z.number().int().nonnegative("Parking spaces must be a non-negative integer").optional(),
  propertyNumber: z.string().optional(),
  mapUrl: z.string().url("Please enter a valid URL").optional(),
  maharera_registered: z.boolean().optional().default(false),
  images: z.array(z.string()).optional(),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  talukaId: z.string().optional(),
  tehsilId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PropertyFormProps {
  property?: Property;
  onSuccess?: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>("");
  const [selectedTehsilId, setSelectedTehsilId] = useState<string>("");
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
    queryFn: async () => {
      if (!selectedStateId) return [];
      const params = new URLSearchParams();
      params.append('stateId', selectedStateId);
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
    queryFn: async () => {
      if (!selectedDistrictId) return [];
      const params = new URLSearchParams();
      params.append('districtId', selectedDistrictId);
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
    queryFn: async () => {
      if (!selectedTalukaId) return [];
      const params = new URLSearchParams();
      params.append('talukaId', selectedTalukaId);
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
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  
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
  const getDefaultValues = (): FormData => {
    if (property) {
      return {
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        address: property.address,
        beds: property.beds,
        baths: property.baths,
        area: property.area,
        propertyType: property.propertyType,
        type: property.type,
        status: property.status,
        featured: property.featured,
        agentId: property.agentId,
        propertyNumber: property.propertyNumber || "",
        yearBuilt: property.yearBuilt || new Date().getFullYear(),
        parking: property.parking || 0,
        mapUrl: property.mapUrl || "",
        stateId: property.stateId ? property.stateId.toString() : "",
        districtId: property.districtId ? property.districtId.toString() : "",
        talukaId: property.talukaId ? property.talukaId.toString() : "",
        tehsilId: property.tehsilId ? property.tehsilId.toString() : "",
        maharera_registered: property.maharera_registered ?? false,
        images: property.images ? 
          (Array.isArray(property.images) ? property.images : 
           (typeof property.images === 'string' ? 
             JSON.parse(property.images) : [])) : [],
        features: property.features ? 
          (Array.isArray(property.features) ? property.features : 
           (typeof property.features === 'string' ? 
             JSON.parse(property.features) : [])) : [],
      };
    }
    
    return {
      propertyNumber: "",
      title: "",
      description: "",
      price: 0,
      location: "",
      address: "",
      beds: 0,
      baths: 0,
      area: 0,
      yearBuilt: new Date().getFullYear(),
      parking: 0,
      features: [],
      mapUrl: "",
      propertyType: DEFAULT_PROPERTY_TYPES[0],
      type: "buy",
      status: PROPERTY_STATUS[0],
      featured: false,
      maharera_registered: false,
      images: [],
      agentId: 1,
      stateId: "",
      districtId: "",
      talukaId: "",
      tehsilId: "",
    };
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (property) {
      // Reset form with property data
      const values = getDefaultValues();
      form.reset(values);
      
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
  }, [property]);
  
  // Update dependent dropdowns when selection changes
  useEffect(() => {
    if (selectedStateId) {
      form.setValue('stateId', selectedStateId);
      
      // Only clear district/taluka/tehsil if the state has actually changed
      if (property?.stateId && selectedStateId !== property.stateId.toString()) {
        form.setValue('districtId', "");
        form.setValue('talukaId', "");
        form.setValue('tehsilId', "");
        setSelectedDistrictId("");
        setSelectedTalukaId("");
        setSelectedTehsilId("");
      }
    }
  }, [selectedStateId, form, property]);
  
  useEffect(() => {
    if (selectedDistrictId) {
      form.setValue('districtId', selectedDistrictId);
      
      // Only clear taluka/tehsil if the district has actually changed
      if (property?.districtId && selectedDistrictId !== property.districtId.toString()) {
        form.setValue('talukaId', "");
        form.setValue('tehsilId', "");
        setSelectedTalukaId("");
        setSelectedTehsilId("");
      }
    }
  }, [selectedDistrictId, form, property]);
  
  useEffect(() => {
    if (selectedTalukaId) {
      form.setValue('talukaId', selectedTalukaId);
      
      // Only clear tehsil if the taluka has actually changed
      if (property?.talukaId && selectedTalukaId !== property.talukaId.toString()) {
        form.setValue('tehsilId', "");
        setSelectedTehsilId("");
      }
    }
  }, [selectedTalukaId, form, property]);
  
  useEffect(() => {
    if (selectedTehsilId) {
      form.setValue('tehsilId', selectedTehsilId);
    }
  }, [selectedTehsilId, form]);

  // Track the selected agent for display
  useEffect(() => {
    const agents = (agentsQuery.data as any[]) || [];
    const currentAgentId = form.watch('agentId');
    const agent = agents.find((a: any) => a.id === currentAgentId);
    setSelectedAgent(agent);
  }, [form.watch('agentId'), agentsQuery.data]);

  // Add new feature
  const addFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = form.getValues('features') as string[] || [];
      if (!currentFeatures.includes(newFeature.trim())) {
        const updatedFeatures = [...currentFeatures, newFeature.trim()];
        form.setValue('features', updatedFeatures);
        setNewFeature("");
        if (featureInputRef.current) {
          featureInputRef.current.focus();
        }
      }
    }
  };

  // Remove feature
  const removeFeature = (featureToRemove: string) => {
    const currentFeatures = form.getValues('features') as string[] || [];
    const updatedFeatures = currentFeatures.filter((f: string) => f !== featureToRemove);
    form.setValue('features', updatedFeatures);
  };

  // Auto-generate property number
  const generatePropertyNumber = async () => {
    setGeneratingPropertyNumber(true);
    
    try {
      const response = await apiRequest('POST', '/api/properties/generate-number', {
        type: form.getValues('type')
      });
      
      const data = await response.json();

      if (data.propertyNumber) {
        form.setValue('propertyNumber', data.propertyNumber);
        toast({
          title: "Property Number Generated",
          description: `Generated: ${data.propertyNumber}`,
        });
      }
    } catch (error) {
      console.error('Error generating property number:', error);
      toast({
        title: "Error",
        description: "Failed to generate property number",
        variant: "destructive",
      });
    } finally {
      setGeneratingPropertyNumber(false);
    }
  };

  // Handle property type change
  const onPropertyTypeChange = (value: string) => {
    form.setValue('propertyType', value);
  };

  // Add new property type
  const addPropertyType = useMutation({
    mutationFn: async (data: { name: string; active: boolean }) => {
      return apiRequest('POST', '/api/property-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/property-types'] });
      setIsAddPropertyTypeOpen(false);
      toast({
        title: "Success",
        description: "Property type added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding property type:', error);
      toast({
        title: "Error",
        description: "Failed to add property type",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const createProperty = useMutation({
    mutationFn: async (data: FormData) => {
      const url = property ? `/api/properties/${property.id}` : '/api/properties';
      const method = property ? 'PUT' : 'POST';
      
      // Convert location IDs to numbers if they exist
      const submitData = {
        ...data,
        stateId: data.stateId ? parseInt(data.stateId) : null,
        districtId: data.districtId ? parseInt(data.districtId) : null,
        talukaId: data.talukaId ? parseInt(data.talukaId) : null,
        tehsilId: data.tehsilId ? parseInt(data.tehsilId) : null,
      };
      
      return apiRequest(method, url, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success",
        description: property ? "Property updated successfully" : "Property created successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/properties');
      }
    },
    onError: (error) => {
      console.error('Error saving property:', error);
      toast({
        title: "Error",
        description: "Failed to save property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createProperty.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            name="propertyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Number</FormLabel>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input placeholder="Auto-generated if left empty" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePropertyNumber}
                    disabled={generatingPropertyNumber}
                  >
                    {generatingPropertyNumber ? "..." : "Generate"}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter property description" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="beds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="areaUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sqft">Square Feet (SQFT)</SelectItem>
                    <SelectItem value="acres">Acres</SelectItem>
                  </SelectContent>
                </Select>
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
                    placeholder={new Date().getFullYear().toString()}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parking Spaces</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
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
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="stateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select 
                    value={selectedStateId} 
                    onValueChange={(value) => {
                      setSelectedStateId(value);
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statesQuery.data?.map((state) => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name}
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
              name="districtId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <Select 
                    value={selectedDistrictId} 
                    onValueChange={(value) => {
                      setSelectedDistrictId(value);
                      field.onChange(value);
                    }}
                    disabled={!selectedStateId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districtsQuery.data?.map((district) => (
                        <SelectItem key={district.id} value={district.id.toString()}>
                          {district.name}
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
              name="talukaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taluka</FormLabel>
                  <Select 
                    value={selectedTalukaId} 
                    onValueChange={(value) => {
                      setSelectedTalukaId(value);
                      field.onChange(value);
                    }}
                    disabled={!selectedDistrictId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select taluka" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {talukasQuery.data?.map((taluka) => (
                        <SelectItem key={taluka.id} value={taluka.id.toString()}>
                          {taluka.name}
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
              name="tehsilId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tehsil</FormLabel>
                  <Select 
                    value={selectedTehsilId} 
                    onValueChange={(value) => {
                      setSelectedTehsilId(value);
                      field.onChange(value);
                    }}
                    disabled={!selectedTalukaId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tehsil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tehsilsQuery.data?.map((tehsil) => (
                        <SelectItem key={tehsil.id} value={tehsil.id.toString()}>
                          {tehsil.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Property Type and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <div className="flex space-x-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertyTypesQuery.data?.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddPropertyTypeOpen} onOpenChange={setIsAddPropertyTypeOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <PropertyTypeDialog 
                      open={isAddPropertyTypeOpen}
                      onOpenChange={setIsAddPropertyTypeOpen}
                      onPropertyTypeCreated={(name) => {
                        form.setValue('propertyType', name);
                        setIsAddPropertyTypeOpen(false);
                      }}
                    />
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select listing type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="buy">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROPERTY_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
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
                <FormLabel>Assigned Agent</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {agentsQuery.data?.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name} - {agent.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Property Features</h3>
          
          <div className="flex space-x-2">
            <Input
              ref={featureInputRef}
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button type="button" onClick={addFeature} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(form.watch('features') as string[] || []).map((feature, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {feature}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFeature(feature)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Switches */}
        <div className="flex space-x-6">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Property</FormLabel>
                  <FormDescription>
                    Display this property prominently on the homepage
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maharera_registered"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">MahaRERA Registered</FormLabel>
                  <FormDescription>
                    Property is registered under MahaRERA
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Property Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Property Images</h3>
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    onImageUpload={(imageUrls) => {
                      field.onChange(imageUrls);
                    }}
                    defaultImages={field.value as string[] || []}
                    multiple={true}
                    maxImages={10}
                  />
                </FormControl>
                <FormDescription>
                  Upload up to 10 high-quality images of your property. The first image will be used as the main display image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Map URL */}
        <FormField
          control={form.control}
          name="mapUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Maps URL (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://maps.google.com/..." 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Paste the Google Maps link for this property location
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/properties')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createProperty.isPending}
          >
            {createProperty.isPending ? "Saving..." : (property ? "Update Property" : "Create Property")}
          </Button>
        </div>
      </form>
    </Form>
  );
}