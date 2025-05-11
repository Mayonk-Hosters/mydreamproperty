import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  MoreHorizontal, 
  Star, 
  Trash, 
  Edit, 
  UserPlus 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Agent } from "@shared/schema";

export default function AdminAgentsPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteAgentId, setDeleteAgentId] = useState<number | null>(null);
  
  // Load agents from API
  const { 
    data: agents, 
    isLoading: isLoadingAgents 
  } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    enabled: isAdmin
  });
  
  // Filter agents based on search query
  const filteredAgents = agents?.filter(agent => 
    !searchQuery || 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Delete agent mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/agents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Agent deleted",
        description: "The agent has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      setDeleteAgentId(null);
    },
    onError: (error) => {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the agent. Please try again.",
        variant: "destructive"
      });
      setDeleteAgentId(null);
    }
  });
  
  // Check if user is admin
  useState(() => {
    requireAdmin();
  });
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle deletion
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };
  
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
        <title>Manage Agents | Admin | RealEstate Pro</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-gray-600">Manage real estate agents</p>
        </div>
        <Link href="/admin/agents/new">
          <Button className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Agent
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>All Agents</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search agents..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAgents ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredAgents && filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.title}</TableCell>
                    <TableCell>{agent.deals || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {agent.rating ? agent.rating.toFixed(1) : '0.0'} 
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/agents/edit/${agent.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer" 
                            onClick={() => setDeleteAgentId(agent.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-gray-500 mb-2">No agents found</p>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Delete confirmation dialog */}
      <AlertDialog
        open={deleteAgentId !== null}
        onOpenChange={() => setDeleteAgentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteAgentId && handleDelete(deleteAgentId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}