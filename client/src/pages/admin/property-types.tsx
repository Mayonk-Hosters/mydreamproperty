import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Search, Plus, Pencil, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PropertyType } from "@shared/schema";
import { PropertyTypeForm } from "@/components/admin/property-type-form";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PropertyTypesPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletePropertyTypeId, setDeletePropertyTypeId] = useState<number | null>(null);

  // Fetch property types
  const { data: propertyTypes, isLoading: isLoadingPropertyTypes } = useQuery<PropertyType[]>({
    queryKey: ["/api/property-types"],
    enabled: !isLoading,
  });

  // Check if user is admin
  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin, requireAdmin]);

  // Delete property type mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/property-types/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Property type deleted",
        description: "The property type has been deleted successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-types"] });
      setDeletePropertyTypeId(null);
    },
    onError: (error) => {
      console.error("Error deleting property type:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the property type. Please try again.",
        variant: "destructive"
      });
      setDeletePropertyTypeId(null);
    }
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      await apiRequest("PATCH", `/api/property-types/${id}`, { active });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Property type status has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-types"] });
    },
    onError: (error) => {
      console.error("Error updating property type status:", error);
      toast({
        title: "Error",
        description: "There was an error updating the property type status. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle delete button click
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // Handle toggle active status
  const handleToggleActive = (propertyType: PropertyType) => {
    toggleActiveMutation.mutate({
      id: propertyType.id,
      active: !propertyType.active
    });
  };

  // Filter property types based on search query
  const filteredPropertyTypes = propertyTypes?.filter(
    (propertyType) => !searchQuery || 
    propertyType.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || isLoadingPropertyTypes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Property Types | Admin | My Dream Property</title>
      </Helmet>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Property Types</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Property Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Types Management</CardTitle>
            <CardDescription>
              Manage the property types available in your system
            </CardDescription>
            <div className="flex mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search property types..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredPropertyTypes && filteredPropertyTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {propertyTypes && propertyTypes.length === 0 
                  ? "No property types found. Add your first property type to get started."
                  : "No property types matching your search criteria."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPropertyTypes?.map((propertyType) => (
                      <TableRow key={propertyType.id}>
                        <TableCell className="font-medium">{propertyType.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            propertyType.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {propertyType.active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(propertyType)}
                              title={propertyType.active ? "Deactivate" : "Activate"}
                            >
                              {propertyType.active ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPropertyType(propertyType);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletePropertyTypeId(propertyType.id)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Property Type Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Property Type</DialogTitle>
            <DialogDescription>
              Create a new property type that will be available for properties.
            </DialogDescription>
          </DialogHeader>
          <PropertyTypeForm 
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Property Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Property Type</DialogTitle>
            <DialogDescription>
              Update the property type details.
            </DialogDescription>
          </DialogHeader>
          {selectedPropertyType && (
            <PropertyTypeForm 
              propertyType={selectedPropertyType}
              onSuccess={() => setIsEditDialogOpen(false)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletePropertyTypeId !== null} onOpenChange={() => setDeletePropertyTypeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property type? This action cannot be undone.
              <br /><br />
              <strong>Warning:</strong> Deleting a property type may affect properties that are using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletePropertyTypeId && handleDelete(deletePropertyTypeId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}