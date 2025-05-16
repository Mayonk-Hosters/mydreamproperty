import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const contactInfoSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone1: z.string().min(5, "Phone number must be at least 5 characters"),
  phone2: z.string().optional(),
  email1: z.string().email("Please enter a valid email address"),
  email2: z.string().email("Please enter a valid email address").optional(),
  businessHours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
  mapUrl: z.string().url("Please enter a valid URL").optional(),
});

type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

export default function ContactInfoForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Default business hours
  const defaultBusinessHours = {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed",
  };

  // Default form values
  const defaultValues = {
    address: "",
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
    businessHours: defaultBusinessHours,
    mapUrl: "",
  };

  // Initialize form with default values
  const form = useForm<ContactInfoFormValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues,
  });

  // Fetch contact information
  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ['/api/contact-info'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/contact-info');
        if (!response.ok) {
          return null;
        }
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
        return null;
      }
    }
  });

  // Update form when contactInfo is loaded
  useEffect(() => {
    if (contactInfo && !formInitialized) {
      // Prepare business hours, ensuring all required fields exist
      const businessHours = {
        ...defaultBusinessHours,
        ...(contactInfo.businessHours || {})
      };
      
      // Reset form with actual data
      form.reset({
        address: contactInfo.address || "",
        phone1: contactInfo.phone1 || "",
        phone2: contactInfo.phone2 || "",
        email1: contactInfo.email1 || "",
        email2: contactInfo.email2 || "",
        businessHours,
        mapUrl: contactInfo.mapUrl || "",
      });
      
      // Mark as initialized to prevent unnecessary resets
      setFormInitialized(true);
    }
  }, [contactInfo, form, formInitialized]);

  async function onSubmit(data: ContactInfoFormValues) {
    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/contact-info", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update contact information");
      }

      queryClient.invalidateQueries({ queryKey: ['/api/contact-info'] });
      
      toast({
        title: "Contact information updated",
        description: "Your changes have been saved successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating contact information:", error);
      toast({
        title: "Error updating contact information",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter office address"
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 12345 67890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="info@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="sales@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-medium">Business Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessHours.monday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monday</FormLabel>
                    <FormControl>
                      <Input placeholder="9:00 AM - 6:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHours.tuesday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tuesday</FormLabel>
                    <FormControl>
                      <Input placeholder="9:00 AM - 6:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHours.wednesday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wednesday</FormLabel>
                    <FormControl>
                      <Input placeholder="9:00 AM - 6:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHours.thursday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thursday</FormLabel>
                    <FormControl>
                      <Input placeholder="9:00 AM - 6:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHours.friday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Friday</FormLabel>
                    <FormControl>
                      <Input placeholder="9:00 AM - 6:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHours.saturday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saturday</FormLabel>
                    <FormControl>
                      <Input placeholder="10:00 AM - 4:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHours.sunday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sunday</FormLabel>
                    <FormControl>
                      <Input placeholder="Closed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mapUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Embed URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Get the embed URL from Google Maps by clicking "Share" and then "Embed a map"
                  </p>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Contact Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}