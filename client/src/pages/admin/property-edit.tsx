import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/admin/property-form";
import { Property } from "@shared/schema";
import { useAdmin } from "@/hooks/use-admin";

export default function AdminPropertyEditPage() {
  const [, params] = useRoute("/admin/properties/edit/:id");
  const [, setLocation] = useLocation();
  const { isAdmin, isLoading: isLoadingAuth, requireAdmin } = useAdmin();

  useEffect(() => {
    requireAdmin();
  }, [isLoadingAuth, isAdmin]);

  // Fetch property data
  const { data: property, isLoading: isLoadingProperty, error } = useQuery<Property>({
    queryKey: [`/api/properties/${params?.id}`],
    enabled: !!params?.id && !isLoadingAuth,
  });

  if (isLoadingAuth || isLoadingProperty) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !property) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => setLocation('/admin/properties')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Edit Property - Admin Dashboard</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/admin/properties')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
              <p className="text-gray-600">Update property information and settings</p>
            </div>
          </div>
        </div>

        <PropertyForm 
          property={property} 
          onSuccess={() => setLocation('/admin/properties')}
        />
      </div>
    </AdminLayout>
  );
}