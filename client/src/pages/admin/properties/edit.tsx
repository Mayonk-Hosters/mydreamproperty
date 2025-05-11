import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PropertyForm } from "@/components/admin/property-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { Property } from "@shared/schema";
import { useAdmin } from "@/hooks/use-admin";

export default function AdminPropertyEditPage() {
  const { isAdmin, isLoading: adminLoading, requireAdmin } = useAdmin();
  const [match, params] = useRoute("/admin/properties/edit/:id");
  const propertyId = match ? parseInt(params.id) : 0;
  
  const { data: property, isLoading: propertyLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: propertyId > 0 && isAdmin,
  });
  
  useEffect(() => {
    requireAdmin();
  }, [adminLoading, isAdmin]);

  if (adminLoading) {
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
        <title>
          {propertyLoading ? "Loading..." : property ? `Edit: ${property.title}` : "Edit Property"} | Admin | RealEstate Pro
        </title>
      </Helmet>
      
      <div className="mb-6">
        <Link href="/admin/properties">
          <Button variant="ghost" className="mb-2">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Properties
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {propertyLoading ? "Loading Property..." : property ? `Edit: ${property.title}` : "Edit Property"}
        </h1>
        <p className="text-gray-600">Update property information</p>
      </div>
      
      {error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-lg font-medium text-red-800">Error loading property</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            There was an error loading the property. Please try again or go back to the properties list.
          </div>
          <div className="mt-4">
            <Link href="/admin/properties">
              <Button>Return to Properties</Button>
            </Link>
          </div>
        </div>
      ) : propertyLoading ? (
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property data...</p>
          </div>
        </div>
      ) : property ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <PropertyForm property={property} />
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
            <h3 className="text-lg font-medium text-yellow-800">Property not found</h3>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            The property you're trying to edit could not be found. It may have been deleted.
          </div>
          <div className="mt-4">
            <Link href="/admin/properties">
              <Button>Return to Properties</Button>
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
