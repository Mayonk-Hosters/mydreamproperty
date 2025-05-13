import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { useProfile, ProfileUpdateData } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters").nullable().optional(),
  email: z.string().email("Please enter a valid email address").nullable().optional(),
  profileImage: z.any().optional(), // Will handle profile image as File object or data URL
});

export default function AdminProfilePage() {
  const { isAdmin, isLoading: adminLoading, requireAdmin } = useAdmin();
  const { profile, isLoading: profileLoading, updateProfile, isPending } = useProfile();
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      profileImage: null,
    },
  });

  useEffect(() => {
    requireAdmin();
  }, [adminLoading, isAdmin, requireAdmin]);

  useEffect(() => {
    if (profile) {
      const typedProfile = profile as any; // Use type assertion to avoid typescript errors
      form.reset({
        fullName: typedProfile.fullName || "",
        email: typedProfile.email || "",
        profileImage: null, // We'll handle the image separately
      });
      setPreviewImage(typedProfile.profileImage || null);
    }
  }, [profile, form]);

  const onSubmit = (data: z.infer<typeof profileFormSchema>) => {
    const updateData: ProfileUpdateData = {};
    
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName || undefined;
    }
    
    if (data.email !== undefined) {
      updateData.email = data.email || undefined;
    }
    
    // If we have a preview image (data URL), use that for the profile image
    if (previewImage) {
      updateData.profileImage = previewImage;
    }
    
    updateProfile(updateData);
  };

  const handleFileChange = (file: File | null) => {
    setProfileImageFile(file);
    form.setValue("profileImage", file);
  };

  const handleFileDataUrlChange = (dataUrl: string | null) => {
    setPreviewImage(dataUrl);
  };

  if (adminLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Profile Settings | Admin | My Dream Property</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your admin profile information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile details and how others see you on the site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <User className="text-gray-500 w-5 h-5 mr-2 mt-2.5" />
                          <Input placeholder="John Doe" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your display name shown in the admin area
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Mail className="text-gray-500 w-5 h-5 mr-2 mt-2.5" />
                          <Input placeholder="john@example.com" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your contact email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <FileUpload 
                          value={previewImage}
                          onFileChange={handleFileChange}
                          onFileDataUrl={handleFileDataUrlChange}
                          accept="image/*"
                          maxSizeMB={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload your profile image (Max size: 2MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
            <CardDescription>
              This is how you appear in the admin interface
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={previewImage || undefined} alt={form.getValues("fullName") || "Admin"} />
              <AvatarFallback className="text-2xl">
                {form.getValues("fullName")?.split(" ").map(n => n[0]).join("") || "AD"}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold mt-2">
              {form.getValues("fullName") || "Admin Name"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {form.getValues("email") || "admin@example.com"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Your profile information is displayed in the admin header and helps other team members identify you
            </p>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}