import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@shared/schema";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Loader2, Building } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Create a schema for the inquiry form
const inquiryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

interface InquiryFormProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryForm({ property, isOpen, onClose }: InquiryFormProps) {
  const { toast } = useToast();
  
  // Create form
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `I am interested in ${property.title} ${property.propertyNumber ? `(${property.propertyNumber})` : ''} priced at ${formatCurrency(property.price)}`,
    },
  });

  // Create mutation
  const inquiryMutation = useMutation({
    mutationFn: async (data: InquiryFormValues) => {
      const response = await apiRequest("POST", "/api/inquiries", {
        ...data,
        propertyId: property.id,
      });
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate cache to refresh inquiries list in admin panel
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      
      // Show success toast
      toast({
        title: "Inquiry Sent!",
        description: "Thank you for your interest. We'll contact you soon.",
        variant: "default",
      });
      
      // Close dialog and reset form
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to send inquiry",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: InquiryFormValues) => {
    inquiryMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Inquire About This Property
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm">{property.title}</h3>
            {property.propertyNumber && (
              <div className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded">
                {property.propertyNumber}
              </div>
            )}
          </div>
          <p className="text-primary font-semibold mt-1">
            {formatCurrency(property.price)}
            {property.type === "rent" && <span className="text-sm font-normal text-gray-500">/month</span>}
          </p>
          <p className="text-sm text-muted-foreground">{property.location}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="I'm interested in this property. Please contact me." 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={inquiryMutation.isPending}
              >
                {inquiryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : "Send Inquiry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}