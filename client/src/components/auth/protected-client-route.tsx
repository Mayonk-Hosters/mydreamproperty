import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedClientRouteProps {
  component: React.ComponentType;
}

export function ProtectedClientRoute({ component: Component }: ProtectedClientRouteProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading, error } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (user && user.role !== "client" && !user.isAdmin) {
      // Admin can view all pages, but agents should be redirected
      if (user.role === "agent") {
        setLocation("/agent-dashboard");
      }
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }
  
  // Only render the component if the user is a client (or admin, who can view all pages)
  if (!user || (user.role !== "client" && !user.isAdmin)) {
    return null;
  }
  
  return <Component />;
}