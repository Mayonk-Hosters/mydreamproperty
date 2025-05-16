import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Component to protect admin routes
export function ProtectedAdminRoute({ 
  component: Component 
}: { 
  component: React.ComponentType 
}) {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    // If authentication check is complete and user is not admin, redirect to home
    if (!isLoading && (!user || !isAdmin)) {
      setLocation("/");
    }
  }, [isLoading, user, isAdmin, setLocation]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Show component only if user is logged in and is admin
  return user && isAdmin ? <Component /> : null;
}