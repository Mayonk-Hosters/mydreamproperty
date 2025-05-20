import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ProtectedAgentRoute } from "@/components/auth/protected-agent-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Search, Edit, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// This component will be wrapped with the ProtectedAgentRoute
function AgentPropertiesContent() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch agent's properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ["/api/properties"],
    select: (data) => {
      // Filter properties by agent ID (in real implementation, this would be a server-side filter)
      const agentId = user.id;
      return data.filter((property: any) => property.agentId.toString() === agentId.toString());
    }
  });
  
  // Helper function to filter properties by status
  const filterProperties = () => {
    if (!properties) return [];
    
    let filtered = properties;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((property: any) => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((property: any) => property.status === "active");
    } else if (activeTab === "pending") {
      filtered = filtered.filter((property: any) => property.status === "pending");
    } else if (activeTab === "sold") {
      filtered = filtered.filter((property: any) => property.status === "sold");
    }
    
    return filtered;
  };
  
  const handlePropertyAction = (action: string, propertyId: number) => {
    if (action === "view") {
      // View property details
      setLocation(`/property/${propertyId}`);
    } else if (action === "edit") {
      // Edit property
      setLocation(`/agent/properties/edit/${propertyId}`);
    } else if (action === "delete") {
      // Confirm before deletion
      if (window.confirm("Are you sure you want to delete this property?")) {
        toast({
          title: "Property Deleted",
          description: "The property has been deleted successfully",
        });
        // In a real implementation, you would call an API to delete the property
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => setLocation("/agent/properties/new")}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Property
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                className="pl-8 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs 
              defaultValue="all" 
              className="w-full md:w-auto"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="sold">Sold</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading properties...</span>
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid gap-6">
              {filterProperties().map((property: any) => (
                <div 
                  key={property.id} 
                  className="flex flex-col md:flex-row border rounded-lg overflow-hidden"
                >
                  <div className="relative h-48 md:h-auto md:w-48 bg-gray-100">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-200">
                        No Image
                      </div>
                    )}
                    {property.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">Featured</Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{property.title}</h3>
                        <p className="text-muted-foreground">{property.location}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Badge 
                          variant={
                            property.status === "active" ? "default" : 
                            property.status === "pending" ? "secondary" : 
                            "outline"
                          }
                        >
                          {property.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                      <span className="text-sm">{property.beds} Beds</span>
                      <span className="text-sm">{property.baths} Baths</span>
                      <span className="text-sm">{property.area} sqft</span>
                      <span className="text-sm">{property.propertyType}</span>
                      <span className="text-sm font-semibold">${property.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePropertyAction("view", property.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePropertyAction("edit", property.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePropertyAction("delete", property.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No properties found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? 
                  "Try adjusting your search criteria." : 
                  "You haven't added any properties yet."
                }
              </p>
              <Button 
                variant="default" 
                className="mt-4" 
                onClick={() => setLocation("/agent/properties/new")}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Your First Property
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export the protected route wrapped component
export default function AgentPropertiesPage() {
  return <ProtectedAgentRoute component={AgentPropertiesContent} />;
}