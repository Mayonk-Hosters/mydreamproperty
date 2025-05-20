import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type ProtectedAdminRouteProps = {
  component: React.ComponentType;
};

export function ProtectedAdminRoute({ component: Component }: ProtectedAdminRouteProps) {
  const { user, isLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is admin
    async function checkAdmin() {
      try {
        const response = await fetch('/api/auth/check-admin');
        if (response.ok) {
          const data = await response.json();
          setIsAdminUser(data.isAdmin);
        } else {
          setIsAdminUser(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdminUser(false);
      }
    }

    if (!isLoading) {
      checkAdmin();
    }
  }, [isLoading, user]);

  // Show loading state while checking
  if (isLoading || isAdminUser === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check for specific admin credentials in localStorage
  const storedUsername = localStorage.getItem("admin_username");
  const isDirectAdmin = storedUsername === "Smileplz004";
  
  // Allow direct access with specific admin credentials
  if (isDirectAdmin) {
    return <Component />;
  }
  
  // Standard authentication check
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Redirect to home if authenticated but not admin
  if (!isAdminUser) {
    return <Redirect to="/" />;
  }
  
  // If user is authenticated and is admin, render the component
  return <Component />;
}