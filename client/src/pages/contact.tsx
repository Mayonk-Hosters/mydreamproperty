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
  message: z.string().min(10, "Message must be at least 10 characters"),
  subject: z.string().min(3, "Subject must be at least 3 characters")
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              
              {isLoadingContact ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : contactInfo ? (
                <>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">Our Office</h3>
                        <p className="text-gray-600 whitespace-pre-line">
                          {contactInfo.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">Phone</h3>
                        <p className="text-gray-600">{contactInfo.phone1}</p>
                        {contactInfo.phone2 && (
                          <p className="text-gray-600">{contactInfo.phone2}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-gray-600">{contactInfo.email1}</p>
                        {contactInfo.email2 && (
                          <p className="text-gray-600">{contactInfo.email2}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Business Hours</h3>
                    <ul className="space-y-1 text-gray-600">
                      {contactInfo.businessHours && typeof contactInfo.businessHours === 'object' && (
                        <>
                          <li className="flex justify-between">
                            <span>Monday:</span>
                            <span>{contactInfo.businessHours.monday}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Tuesday:</span>
                            <span>{contactInfo.businessHours.tuesday}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Wednesday:</span>
                            <span>{contactInfo.businessHours.wednesday}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Thursday:</span>
                            <span>{contactInfo.businessHours.thursday}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Friday:</span>
                            <span>{contactInfo.businessHours.friday}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Saturday:</span>
                            <span>{contactInfo.businessHours.saturday}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Sunday:</span>
                            <span>{contactInfo.businessHours.sunday}</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">Our Office</h3>
                      <p className="text-gray-600">
                        123 Real Estate Avenue<br />
                        Mumbai, Maharashtra 400001<br />
                        India
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="text-gray-600">+91 98765 43210</p>
                      <p className="text-gray-600">+91 91234 56789</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-gray-600">info@mydreamproperty.com</p>
                      <p className="text-gray-600">sales@mydreamproperty.com</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Business Hours</h3>
                    <ul className="space-y-1 text-gray-600">
                      <li className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span>9:00 AM - 6:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Saturday:</span>
                        <span>10:00 AM - 4:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sunday:</span>
                        <span>Closed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Property Inquiry" {...field} />
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
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us how we can help you..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
        
        {contactInfo?.mapUrl && (
          <div className="mt-12 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6">Find Us on the Map</h2>
              <div className="aspect-video rounded-md overflow-hidden">
                <iframe
                  src={contactInfo.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}