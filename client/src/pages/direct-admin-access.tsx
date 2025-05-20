import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function DirectAdminAccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Automatically direct to admin page
    // This is a simple bridge page that routes to admin
    setTimeout(() => {
      setLocation("/admin");
    }, 1000);
  }, [setLocation]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-lg">Accessing admin panel...</p>
    </div>
  );
}