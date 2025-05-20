import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DEFAULT_PROPERTY_TYPES } from "@shared/schema";
import { PropertyPreference } from "@shared/types/recommendation";

const recommendationFormSchema = z.object({
  budget: z.string().optional(),
  minBeds: z.string().optional(),
  minBaths: z.string().optional(),
  location: z.string().optional(),
  propertyType: z.string().optional(),
  familySize: z.string().optional(),
  lifestyle: z.string().optional(),
  commute: z.string().optional(),
  features: z.array(z.string()).optional(),
});

type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;

interface PropertyRecommendationFormProps {
  onSubmit: (preferences: PropertyPreference) => void;
  isLoading?: boolean;
}

// Common property features
const PROPERTY_FEATURES = [
  "Garden",
  "Swimming Pool",
  "Gym",
  "Balcony",
  "Parking",
  "Elevator",
  "Air Conditioning",
  "Security System",
  "Pet Friendly",
  "Wheelchair Accessible"
];

export function PropertyRecommendationForm({ onSubmit, isLoading = false }: PropertyRecommendationFormProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      budget: "",
      minBeds: "2",
      minBaths: "1",
      location: "",
      propertyType: "",
      familySize: "1",
      lifestyle: "",
      commute: "",
      features: [],
    },
  });

  const handleSubmit = (values: RecommendationFormValues) => {
    // Convert form values to backend format
    const preferences: PropertyPreference = {
      budget: values.budget ? parseFloat(values.budget) : undefined,
      minBeds: values.minBeds ? parseInt(values.minBeds) : undefined,
      minBaths: values.minBaths ? parseInt(values.minBaths) : undefined,
      location: values.location || undefined,
      propertyType: values.propertyType || undefined,
      familySize: values.familySize ? parseInt(values.familySize) : undefined,
      lifestyle: values.lifestyle || undefined,
      commute: values.commute || undefined,
      features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
    };

    // Remove undefined values
    Object.keys(preferences).forEach(key => {
      if (preferences[key as keyof PropertyPreference] === undefined) {
        delete preferences[key as keyof PropertyPreference];
      }
    });

    onSubmit(preferences);
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Find Your Dream Property</h2>
      <p className="text-gray-600 mb-6 text-center">
        Tell us about your preferences, and our AI will find the perfect properties for you
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your maximum budget"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Mumbai, Pune, Maharashtra"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minBeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Bedrooms</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum bedrooms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Bedroom" : "Bedrooms"}
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
              name="minBaths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Bathrooms</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select minimum bathrooms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Bathroom" : "Bathrooms"}
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
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEFAULT_PROPERTY_TYPES.map((type) => (
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
            
            <FormField
              control={form.control}
              name="familySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select family size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Person" : "People"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="lifestyle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lifestyle Preferences</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your lifestyle, e.g., 'I work from home and need space for a home office', 'We have kids and need a safe neighborhood with parks', etc."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commute Preferences</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your commute needs, e.g., 'I need to be within 10km of Mumbai Central', 'Looking for good public transport connections', etc."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Desired Features</FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-2">
              {PROPERTY_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feature-${feature}`}
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={() => toggleFeature(feature)}
                  />
                  <label
                    htmlFor={`feature-${feature}`}
                    className="text-sm cursor-pointer"
                  >
                    {feature}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Finding Properties..." : "Get AI Recommendations"}
          </Button>
        </form>
      </Form>
    </div>
  );
}