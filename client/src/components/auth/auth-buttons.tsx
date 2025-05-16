import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

export function LoginButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

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

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={() => window.location.href = "/api/login"}
    >
      <LogIn className="h-4 w-4" />
      <span>Login</span>
    </Button>
  );
}