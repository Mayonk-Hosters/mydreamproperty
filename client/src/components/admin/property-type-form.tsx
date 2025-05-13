import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PropertyType, InsertPropertyType } from "@shared/schema";

// Form schema for property type validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
  active: z.boolean().default(true),
});

interface PropertyTypeFormProps {
  propertyType?: PropertyType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropertyTypeForm({ propertyType, onSuccess, onCancel }: PropertyTypeFormProps) {
  const { toast } = useToast();
  const isEditing = !!propertyType;

  // Initialize form with default values or existing property type data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: propertyType?.name || "",
      active: propertyType?.active ?? true,
    },
  });

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: async (data: InsertPropertyType) => {
      if (isEditing && propertyType) {
        const response = await apiRequest(
          "PATCH", 
          `/api/property-types/${propertyType.id}`, 
          data
        );
        return response.json();
      } else {
        const response = await apiRequest(
          "POST", 
          "/api/property-types", 
          data
        );
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-types"] });
      toast({
        title: `Property type ${isEditing ? "updated" : "created"} successfully`,
        description: `The property type has been ${isEditing ? "updated" : "created"}.`,
      });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error) => {
      console.error("Property type form error:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} property type. Please try again.`,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter property type name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the property type (e.g., House, Apartment, Villa, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Whether this property type is active and available for selection
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

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                {isEditing ? "Updating..." : "Creating..."}
              </span>
            ) : (
              <span>{isEditing ? "Update" : "Create"} Property Type</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}