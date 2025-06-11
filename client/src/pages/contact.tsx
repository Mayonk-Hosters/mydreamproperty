import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/common/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  message: z.string().min(5, "Please include a brief message"),
  subject: z.string().min(2, "Please include a subject")
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch contact information
  const { data: contactInfo, isLoading: isLoadingContact } = useQuery({
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
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
  });
  
  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/contact', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible",
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Layout>
      <Helmet>
        <title>Contact Us | My Dream Property</title>
        <meta name="description" content="Get in touch with My Dream Property for all your real estate needs. We're here to help you find your dream home." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-center mb-12">
          Get in touch with our team for any questions or inquiries. We're here to help you find your dream property.
        </p>
        
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Quick Contact</h2>
          
          <div className="flex flex-wrap gap-6 mb-8 justify-center">
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-md">
              <Phone className="h-5 w-5 text-primary" />
              <span>{contactInfo?.phone1 || "9822854499"}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-md">
              <Mail className="h-5 w-5 text-primary" />
              <span>{contactInfo?.email1 || "info@mydreamproperty.co.in"}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-md">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{contactInfo?.address || "Mumbai, Maharashtra 400001"}</span>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Property inquiry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How can we help you?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}