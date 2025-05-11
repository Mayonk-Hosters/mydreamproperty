import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useRoute } from "wouter";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentForm } from "@/components/admin/agent-form";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Agent } from "@shared/schema";

export default function AdminEditAgentPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  const [match, params] = useRoute<{ id: string }>("/admin/agents/edit/:id");
  
  const { 
    data: agent, 
    isLoading: isLoadingAgent 
  } = useQuery<Agent>({
    queryKey: ['/api/agents', params?.id],
    enabled: isAdmin === true && Boolean(params?.id),
  });

  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin]);

  if (isLoading || isLoadingAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }
  
  if (!agent) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-4">Agent Not Found</h2>
          <p className="text-gray-600 mb-6">
            The agent you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/admin/agents">
            <button className="bg-primary text-white px-4 py-2 rounded">
              Back to Agents
            </button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Edit Agent | Admin | RealEstate Pro</title>
      </Helmet>

      <div className="mb-6">
        <Link href="/admin/agents" className="inline-flex items-center text-sm text-gray-600 mb-2 hover:text-primary">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Agents
        </Link>
        <h1 className="text-2xl font-bold">Edit Agent</h1>
        <p className="text-gray-600">Update agent information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentForm agent={agent} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}