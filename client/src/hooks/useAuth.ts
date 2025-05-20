import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

type LoginCredentials = {
  username: string;
  password: string;
  userType?: string;
};

export function useAuth() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Query the current user
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check admin status whenever user changes
  useEffect(() => {
    async function checkAdminStatus() {
      if (user) {
        try {
          const response = await fetch('/api/auth/check-admin');
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    
    checkAdminStatus();
  }, [user]);

  // Login mutation for traditional authentication
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await fetch("/api/traditional-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies/session
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(["/api/auth/user"], data);
      
      // Show success message
      toast({
        title: "Login successful",
        description: "You are now logged in",
      });
      
      // Force refetch to ensure we have the latest data
      refetch();
      
      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    isAdmin,
    loginMutation,
  };
}