import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Dashboard } from "@/components/admin/dashboard";
import { useAdmin } from "@/hooks/use-admin";

export default function AdminDashboardPage() {
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
        <title>Admin Dashboard | RealEstate Pro</title>
      </Helmet>
      <Dashboard />
    </AdminLayout>
  );
}
