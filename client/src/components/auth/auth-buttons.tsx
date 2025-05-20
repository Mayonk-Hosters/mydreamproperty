import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LoginButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // Only show logout button if user is logged in
  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => window.location.href = "/api/logout"}
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    );
  }

  // No longer displaying the login button in the header
  return null;
}