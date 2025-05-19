import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Agent, insertAgentSchema } from "@shared/schema";
import { getAgentImage } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";

interface AgentFormProps {
  agent?: Agent;
  onSuccess?: () => void;
}

// Create a zod schema for the form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters long",
  }),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters long",
  }),
  image: z.union([
    z.string(),
    z.array(z.string())
  ]),
  contactNumber: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address",
  }).optional(),
  deals: z.coerce.number().nonnegative().default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
});

export function AgentForm({ agent, onSuccess }: AgentFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Default form values
  const defaultValues = {
    name: agent?.name || "",
    title: agent?.title || "",
    image: agent?.image || getAgentImage(0),
    contactNumber: agent?.contactNumber || "",
    email: agent?.email || "",
    deals: agent?.deals || 0,
    rating: agent?.rating || 0,
  };
  
  // Initialize form with zod resolver and default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Reset form when agent prop changes
  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        title: agent.title,
        image: agent.image,
        contactNumber: agent.contactNumber || "",
        email: agent.email || "",
        deals: agent.deals || 0,
        rating: agent.rating || 0,
      });
    }
  }, [agent, form]);
  
  // Submit handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Process image from the ImageUpload component
      let agentImage = data.image;
      
      // If we have an array of images, use the first one as the primary image
      if (Array.isArray(agentImage) && agentImage.length > 0) {
        agentImage = agentImage[0];
      }
      
      const agentData = {
        name: data.name,
        title: data.title,
        image: agentImage, // Use the processed image
        contactNumber: data.contactNumber,
        email: data.email,
        deals: data.deals,
        rating: data.rating,
      };
      
      if (agent) {
        // Update existing agent
        await apiRequest('PATCH', `/api/agents/${agent.id}`, agentData);
        // Invalidate cache to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
        queryClient.invalidateQueries({ queryKey: ['/api/agents', agent.id] });
        
        toast({
          title: "Agent updated",
          description: "The agent has been updated successfully.",
        });
      } else {
        // Create new agent
        await apiRequest('POST', '/api/agents', agentData);
        // Invalidate cache to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
        
        toast({
          title: "Agent created",
          description: "The agent has been created successfully.",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/agents');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: "Error",
        description: "There was an error saving the agent. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                The full name of the agent.
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Senior Real Estate Agent" {...field} />
              </FormControl>
              <FormDescription>
                The job title of the agent.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 9876543210" {...field} />
                </FormControl>
                <FormDescription>
                  The agent's contact phone number.
                </FormDescription>
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
                  <Input placeholder="agent@example.com" type="email" {...field} />
                </FormControl>
                <FormDescription>
                  The agent's email address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Image</FormLabel>
              <FormControl>
                <ImageUpload
                  onImageUpload={(imageUrls) => {
                    field.onChange(imageUrls);
                  }}
                  defaultImages={Array.isArray(field.value) ? field.value as string[] : field.value ? [field.value as string] : []}
                  multiple={false}
                  maxImages={1}
                />
              </FormControl>
              <FormDescription>
                Upload an image for the agent. This will be displayed on the agent's profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="deals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deals</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Number of deals closed by the agent.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Agent's rating out of 5.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {form.formState.isSubmitting ? (
          <Button disabled className="w-full md:w-auto">
            <span className="animate-spin mr-2">⟳</span>
            Saving...
          </Button>
        ) : (
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Button type="submit" className="w-full md:w-auto">
              {agent ? "Update Agent" : "Create Agent"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/agents')} 
              className="w-full md:w-auto"
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}