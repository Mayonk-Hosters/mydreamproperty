import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Edit, Trash2, AlertTriangle, Search, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Property, PROPERTY_TYPES, PROPERTY_STATUS } from "@shared/schema";

export function PropertyTable() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [typeFilter, setTypeFilter] = useState("all-types");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; propertyId: number | null }>({
    isOpen: false,
    propertyId: null,
  });

  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Filter and sort properties based on search query and filters
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter(property => {
      const matchesSearch = 
        !searchQuery || 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || statusFilter === "all-statuses" || property.status === statusFilter;
      const matchesType = !typeFilter || typeFilter === "all-types" || property.propertyType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchQuery, statusFilter, typeFilter]);

  const handleDeleteProperty = async () => {
    if (!deleteDialog.propertyId) return;

    try {
      await apiRequest('DELETE', `/api/properties/${deleteDialog.propertyId}`, undefined);
      
      // Invalidate the properties cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
      });
      
      setDeleteDialog({ isOpen: false, propertyId: null });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the property. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-medium text-red-800">Error loading properties</h3>
        </div>
        <div className="mt-2 text-sm text-red-700">
          There was an error loading the properties. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search properties..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              {PROPERTY_STATUS.map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {PROPERTY_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Link href="/admin/properties/new">
            <Button className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Properties table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mb-2"></div>
                    <p>Loading properties...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  {searchQuery || statusFilter || typeFilter ? (
                    <div>
                      <p className="mb-2">No properties match your filters.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all-statuses");
                          setTypeFilter("all-types");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">No properties found.</p>
                      <Link href="/admin/properties/new">
                        <Button size="sm">Add Property</Button>
                      </Link>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <img 
                        src={Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : 
                          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=40"} 
                        alt={property.title} 
                        className="w-10 h-10 rounded object-cover mr-3" 
                      />
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-xs text-gray-500">{property.beds} beds, {property.baths} baths</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(property.price)}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.propertyType}</TableCell>
                  <TableCell>
                    <Badge className={
                      property.status === "active" ? "bg-green-100 text-green-800" :
                      property.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {property.featured ? (
                      <Badge className="bg-primary text-white">Featured</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/admin/properties/edit/${property.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setDeleteDialog({ isOpen: true, propertyId: property.id })}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, propertyId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, propertyId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProperty}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
