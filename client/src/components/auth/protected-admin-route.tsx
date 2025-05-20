import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

type ProtectedAdminRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const [location] = useLocation();

  // Special case for the admin credentials
  const storedUsername = localStorage.getItem("admin_username");
  const isDirect = storedUsername === "Smileplz004";

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Allow access if user is admin or if direct credentials are used
  if (isAdmin || isDirect) {
    return <>{children}</>;
  }

  // Redirect to login
  return <Navigate to={`/login?from=${encodeURIComponent(location)}`} />;
}