import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// This component automatically signs out the user when they leave admin pages
export function AdminSignoutTracker() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Create a variable to track if we've shown the notification already
    let hasShownNotification = false;
    
    // Check if the user is navigating away from an admin page
    // Only show notification when leaving admin but not when first loading other pages
    if (location && !location.startsWith("/admin") && localStorage.getItem("was_in_admin") === "true") {
      // Clear admin credentials from localStorage
      localStorage.removeItem("admin_username");
      localStorage.removeItem("admin_password");
      localStorage.removeItem("was_in_admin");
      
      // Logout user
      logout();
      
      // Show notification only if we haven't already
      if (!hasShownNotification) {
        hasShownNotification = true;
        toast({
          title: "Signed out",
          description: "You have been signed out of admin panel",
        });
      }
    }
    
    // Set flag when entering admin area
    if (location && location.startsWith("/admin")) {
      localStorage.setItem("was_in_admin", "true");
    }
    
  }, [location, logout, toast]);
  
  return null; // This component doesn't render anything
}