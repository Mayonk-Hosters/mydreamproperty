import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedAgentRouteProps {
  component: React.ComponentType;
}

export function ProtectedAgentRoute({ component: Component }: ProtectedAgentRouteProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading, error } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (user && user.role !== "agent") {
      // Redirect non-agents to the appropriate dashboard
      if (user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/client-dashboard");
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
  
  // Only render the component if the user is an agent
  if (!user || user.role !== "agent") {
    return null;
  }
  
  return <Component />;
}