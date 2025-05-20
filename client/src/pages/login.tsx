import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  userType: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [userType, setUserType] = useState("admin");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        setLocation("/admin");
      } else if (user.role === "agent") {
        setLocation("/agent-dashboard");
      } else {
        setLocation("/client-dashboard");
      }
    }
  }, [user, setLocation]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      userType: "admin",
    },
  });

  // Update form value when tab changes
  useEffect(() => {
    form.setValue("userType", userType);
  }, [userType, form]);

  async function onSubmit(data: LoginFormData) {
    // Include the user type in the login data
    loginMutation.mutate({
      ...data,
      userType: userType
    }, {
      onSuccess: (user) => {
        // Redirect based on user type
        if (user.isAdmin) {
          setLocation("/admin");
        } else if (user.role === "agent") {
          setLocation("/agent-dashboard");
        } else {
          setLocation("/client-dashboard");
        }
      }
    });
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-16rem)] px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Choose your user type and enter your credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admin" onValueChange={setUserType} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="agent">Agent</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin">
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Login as an administrator to manage the entire platform
              </p>
            </TabsContent>
            
            <TabsContent value="agent">
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Login as an agent to manage your property listings and client inquiries
              </p>
            </TabsContent>
            
            <TabsContent value="client">
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Login as a client to view saved properties and track your inquiries
              </p>
            </TabsContent>
          </Tabs>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder={userType === "admin" ? "admin" : "username"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <input type="hidden" {...form.register("userType")} />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            You can also{" "}
            <a href="/api/login" className="text-primary hover:underline">
              login with Replit Auth
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}