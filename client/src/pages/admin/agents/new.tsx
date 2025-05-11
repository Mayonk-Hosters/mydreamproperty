import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentForm } from "@/components/admin/agent-form";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminNewAgentPage() {
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
        <title>Add New Agent | Admin | RealEstate Pro</title>
      </Helmet>

      <div className="mb-6">
        <Link href="/admin/agents" className="inline-flex items-center text-sm text-gray-600 mb-2 hover:text-primary">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Agents
        </Link>
        <h1 className="text-2xl font-bold">Add New Agent</h1>
        <p className="text-gray-600">Create a new real estate agent</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentForm />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}