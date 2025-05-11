import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  const { toast } = useToast();
  
  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin]);

  const generalFormSchema = z.object({
    siteName: z.string().min(2, {
      message: "Site name must be at least 2 characters.",
    }),
    siteUrl: z.string().url({
      message: "Please enter a valid URL.",
    }),
    contactEmail: z.string().email({
      message: "Please enter a valid email address.",
    }),
    contactPhone: z.string().min(10, {
      message: "Please enter a valid phone number.",
    }),
  });

  const notificationFormSchema = z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    marketingEmails: z.boolean().default(true),
    newListingAlerts: z.boolean().default(true),
  });

  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      siteName: "RealEstate Pro",
      siteUrl: "https://realestatepro.com",
      contactEmail: "info@realestatepro.com",
      contactPhone: "(123) 456-7890",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      newListingAlerts: true,
    },
  });

  function onGeneralSubmit(values: z.infer<typeof generalFormSchema>) {
    toast({
      title: "Settings updated",
      description: "Your general settings have been saved.",
    });
    console.log(values);
  }

  function onNotificationSubmit(values: z.infer<typeof notificationFormSchema>) {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
    console.log(values);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Settings | Admin | RealEstate Pro</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage application settings</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic information about your website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input placeholder="RealEstate Pro" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the name that will be displayed in the browser tab and emails.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="siteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://realestatepro.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input placeholder="info@realestatepro.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <Label htmlFor="emailNotifications" className="font-medium">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-gray-500">
                              Receive email notifications for inquiries and messages.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="emailNotifications"
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <Label htmlFor="smsNotifications" className="font-medium">
                              SMS Notifications
                            </Label>
                            <p className="text-sm text-gray-500">
                              Receive text notifications for urgent matters.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="smsNotifications"
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <Label htmlFor="marketingEmails" className="font-medium">
                              Marketing Emails
                            </Label>
                            <p className="text-sm text-gray-500">
                              Receive emails about promotions and news.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="marketingEmails"
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="newListingAlerts"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="newListingAlerts" className="font-medium">
                              New Listing Alerts
                            </Label>
                            <p className="text-sm text-gray-500">
                              Receive alerts when new listings are added.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="newListingAlerts"
                            />
                          </FormControl>
                        </div>
                      )}
                    />
                    
                    <div className="mt-4 flex justify-end">
                      <Button type="submit">Save Preferences</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Theme</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="border rounded-md p-3 cursor-pointer bg-white hover:border-primary">
                        <div className="h-12 bg-gray-100 rounded-md mb-2"></div>
                        <p className="text-sm text-center">Light</p>
                      </div>
                      <div className="border rounded-md p-3 cursor-pointer bg-gray-900 hover:border-primary">
                        <div className="h-12 bg-gray-800 rounded-md mb-2"></div>
                        <p className="text-sm text-center text-white">Dark</p>
                      </div>
                      <div className="border rounded-md p-3 cursor-pointer bg-gradient-to-r from-blue-100 to-white hover:border-primary">
                        <div className="h-12 bg-gradient-to-r from-blue-200 to-gray-100 rounded-md mb-2"></div>
                        <p className="text-sm text-center">System</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Primary Color</Label>
                    <div className="grid grid-cols-5 gap-4 mt-2">
                      <div className="h-8 bg-blue-500 rounded-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-500"></div>
                      <div className="h-8 bg-red-500 rounded-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-red-500"></div>
                      <div className="h-8 bg-green-500 rounded-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-green-500"></div>
                      <div className="h-8 bg-purple-500 rounded-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-purple-500"></div>
                      <div className="h-8 bg-amber-500 rounded-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-amber-500"></div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Custom CSS</Label>
                    <textarea 
                      className="w-full mt-2 p-3 border rounded-md min-h-[100px] text-sm font-mono" 
                      placeholder=":root { --primary: #3b82f6; }"
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" className="mr-2">Reset to Default</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Advanced Settings */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  These are advanced settings. Be careful when changing these options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <Label htmlFor="caching" className="font-medium">
                        Enable Caching
                      </Label>
                      <p className="text-sm text-gray-500">
                        Enable caching to improve site performance.
                      </p>
                    </div>
                    <Switch id="caching" />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <Label htmlFor="analytics" className="font-medium">
                        Analytics Tracking
                      </Label>
                      <p className="text-sm text-gray-500">
                        Enable Google Analytics tracking.
                      </p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <Label htmlFor="maintenance" className="font-medium">
                        Maintenance Mode
                      </Label>
                      <p className="text-sm text-gray-500">
                        Put the site in maintenance mode.
                      </p>
                    </div>
                    <Switch id="maintenance" />
                  </div>
                  
                  <div>
                    <Label className="font-medium">Danger Zone</Label>
                    <div className="mt-2 p-4 border border-red-200 rounded-md bg-red-50">
                      <h4 className="text-red-800 font-medium mb-2">Reset Application</h4>
                      <p className="text-sm text-red-600 mb-3">
                        This will reset all settings and data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm">Reset Application</Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}