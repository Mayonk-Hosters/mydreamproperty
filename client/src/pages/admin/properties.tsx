import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PropertyTable } from "@/components/admin/property-table";
import { useAdmin } from "@/hooks/use-admin";

export default function AdminPropertiesPage() {
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
        <title>Property Management | Admin | RealEstate Pro</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Property Management</h1>
        <p className="text-gray-600">Manage your property listings</p>
      </div>
      
      <PropertyTable />
    </AdminLayout>
  );
}
