import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PropertyForm } from "@/components/admin/property-form";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

export default function AdminPropertyNewPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  
  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Add New Property | Admin | RealEstate Pro</title>
      </Helmet>
      
      <div className="mb-6">
        <Link href="/admin/properties">
          <Button variant="ghost" className="mb-2">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Properties
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Property</h1>
        <p className="text-gray-600">Create a new property listing</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <PropertyForm />
      </div>
    </AdminLayout>
  );
}
