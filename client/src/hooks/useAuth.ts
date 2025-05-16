import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  username?: string | null;
  email?: string | null;
  fullName?: string | null;
  profileImage?: string | null;
  isAdmin: boolean;
};

type LoginCredentials = {
  username: string;
  password: string;
};

export function useAuth() {
  const { toast } = useToast();

  // Query to get current user
  const { 
    data: user, 
    isLoading,
    error 
  } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user is admin
  const isAdmin = user?.isAdmin ?? false;

  // Traditional login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch("/api/traditional-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return await response.json() as User;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["/api/auth/user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back${userData.fullName ? ', ' + userData.fullName : ''}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout function
  const logout = async () => {
    window.location.href = "/api/logout";
  };

  return {
    user: user || null,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin,
    login: (credentials: LoginCredentials) => loginMutation.mutate(credentials),
    logout,
    loginMutation,
  };
}