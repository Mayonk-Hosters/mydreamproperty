import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAdmin() {
  // TEMPORARY: Always return true for isAdmin to bypass authentication
  const [isAdmin, setIsAdmin] = useState<boolean | null>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // COMMENTED OUT ORIGINAL CODE:
  /*
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/check-admin', undefined);
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);
  */

  const requireAdmin = () => {
    // TEMPORARY: No-op function since we're bypassing admin checks
    return;
    
    // COMMENTED OUT ORIGINAL CODE:
    /*
    if (isLoading) return;
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
    }
    */
  };

  return { isAdmin, isLoading, requireAdmin };
}
