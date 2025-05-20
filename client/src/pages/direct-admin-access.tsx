import { useEffect } from "react";
import { useLocation } from "wouter";

export default function DirectAdminAccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Set the admin credentials in localStorage
    localStorage.setItem("admin_username", "Smileplz004");
    localStorage.setItem("admin_password", "9923000500@rahul");
    
    // Redirect to admin dashboard
    setLocation("/admin");
  }, [setLocation]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Dashboard...</h1>
        <p>Please wait while we authenticate you.</p>
      </div>
    </div>
  );
}