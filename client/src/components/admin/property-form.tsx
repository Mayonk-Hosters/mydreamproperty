import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Property, 
  PROPERTY_TYPES, 
  PROPERTY_STATUS, 
  insertPropertySchema,
  State,
  District,
  Taluka,
  Tehsil 
} from "@shared/schema";

import {
  Form,
  FormControl,
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
import { Checkbox } from "@/components/ui/checkbox";
import { getPropertyImage, getInteriorImage } from "@/lib/utils";

// Extend the property schema with additional validation
const formSchema = insertPropertySchema.extend({
  price: z.number().positive("Price must be a positive number"),
  beds: z.number().int().positive("Beds must be a positive integer"),
  baths: z.number().positive("Baths must be a positive number"),
  area: z.number().int().positive("Area must be a positive integer"),
  // Add location hierarchy fields
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
  
  // Fetch states
  const statesQuery = useQuery<State[]>({
    queryKey: ['/api/locations/states'],
    enabled: true,
  });
  
  // Fetch districts based on selected state
  const districtsQuery = useQuery<District[]>({
    queryKey: ['/api/locations/districts', selectedStateId],
    enabled: !!selectedStateId,
  });
  
  // Fetch talukas based on selected district
  const talukasQuery = useQuery<Taluka[]>({
    queryKey: ['/api/locations/talukas', selectedDistrictId],
    enabled: !!selectedDistrictId,
  });
  
  // Fetch tehsils based on selected taluka
  const tehsilsQuery = useQuery<Tehsil[]>({
    queryKey: ['/api/locations/tehsils', selectedTalukaId],
    enabled: !!selectedTalukaId,
  });
  
  // Fetch agents
  const agentsQuery = useQuery({
    queryKey: ['/api/agents'],
    enabled: true,
  });

  // Set default values for a new property
  const defaultValues = property ? {
    ...property,
  } : {
    title: "",
    description: "",
    price: 0,
    location: "",
    address: "",
    beds: 0,
    baths: 0,
    area: 0,
    propertyType: PROPERTY_TYPES[0],
    status: PROPERTY_STATUS[0],
    featured: false,
    images: [
      getPropertyImage(0),
      getPropertyImage(1),
      getInteriorImage(0),
      getInteriorImage(1)
    ],
    agentId: 1, // Default agent ID
    createdAt: new Date().toISOString(),
    stateId: "",
    districtId: "",
    talukaId: "",
    tehsilId: "",
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
      form.setValue('districtId', '');
      form.setValue('talukaId', '');
      form.setValue('tehsilId', '');
      setSelectedDistrictId(null);
      setSelectedTalukaId(null);
      setSelectedTehsilId(null);
    }
  }, [selectedStateId, form]);
  
  useEffect(() => {
    if (selectedDistrictId) {
      form.setValue('districtId', selectedDistrictId);
      form.setValue('talukaId', '');
      form.setValue('tehsilId', '');
      setSelectedTalukaId(null);
      setSelectedTehsilId(null);
    }
  }, [selectedDistrictId, form]);
  
  useEffect(() => {
    if (selectedTalukaId) {
      form.setValue('talukaId', selectedTalukaId);
      form.setValue('tehsilId', '');
      setSelectedTehsilId(null);
    }
  }, [selectedTalukaId, form]);
  
  useEffect(() => {
    if (selectedTehsilId) {
      form.setValue('tehsilId', selectedTehsilId);
    }
  }, [selectedTehsilId, form]);

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
      
      // Update the data with the compiled location detail
      const propertyData = {
        ...data,
        location: locationDetail || data.location, // Use compiled location or fall back to what user entered
      };
      
      if (property) {
        // Update existing property
        await apiRequest('PATCH', `/api/properties/${property.id}`, propertyData);
        toast({
          title: "Property updated",
          description: "The property has been updated successfully.",
        });
      } else {
        // Create new property
        await apiRequest('POST', '/api/properties', propertyData);
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                            <SelectItem value="loading" disabled>Loading states...</SelectItem>
                          ) : statesQuery.data?.length === 0 ? (
                            <SelectItem value="none" disabled>No states found</SelectItem>
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
                            <SelectItem value="loading" disabled>Loading districts...</SelectItem>
                          ) : !districtsQuery.data || districtsQuery.data.length === 0 ? (
                            <SelectItem value="none" disabled>No districts found</SelectItem>
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
                            <SelectItem value="loading" disabled>Loading talukas...</SelectItem>
                          ) : !talukasQuery.data || talukasQuery.data.length === 0 ? (
                            <SelectItem value="none" disabled>No talukas found</SelectItem>
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
                            <SelectItem value="loading" disabled>Loading tehsils...</SelectItem>
                          ) : !tehsilsQuery.data || tehsilsQuery.data.length === 0 ? (
                            <SelectItem value="none" disabled>No tehsils found</SelectItem>
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
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
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
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agentsQuery.isLoading ? (
                          <SelectItem value="0" disabled>Loading agents...</SelectItem>
                        ) : !agentsQuery.data || agentsQuery.data.length === 0 ? (
                          <SelectItem value="0" disabled>No agents found</SelectItem>
                        ) : (
                          agentsQuery.data.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.name}
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

            <div className="border rounded-md p-4">
              <FormLabel className="block mb-3">Property Images</FormLabel>
              <p className="text-sm text-gray-500 mb-3">
                The property has {form.getValues("images").length} images attached.
              </p>
              <div className="grid grid-cols-2 gap-2">
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
              <p className="text-sm text-gray-500 mt-2">
                Image upload functionality would be implemented here.
              </p>
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
    </Form>
  );
}
