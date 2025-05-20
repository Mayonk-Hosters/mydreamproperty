import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ProtectedClientRoute } from "@/components/auth/protected-client-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Home, Heart, MessageSquare, Star, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// This component will be wrapped with the ProtectedClientRoute
function ClientDashboardContent() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("favorites");
  
  // Mock data for development - in a real implementation, these would come from API calls
  const favoriteProperties = [
    {
      id: 1,
      title: "Modern City Apartment",
      location: "Downtown, New York",
      price: 450000,
      beds: 2,
      baths: 2,
      area: 1200,
      propertyType: "Apartment",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      id: 2,
      title: "Suburban Family Home",
      location: "Austin, TX",
      price: 925000,
      beds: 4,
      baths: 3,
      area: 2800,
      propertyType: "House",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    }
  ];
  
  const inquiries = [
    {
      id: 1,
      propertyTitle: "Modern City Apartment",
      date: "2025-05-12",
      status: "Pending",
      message: "I'm interested in scheduling a viewing for this apartment next weekend.",
      response: null
    },
    {
      id: 2,
      propertyTitle: "Suburban Family Home",
      date: "2025-05-05",
      status: "Answered",
      message: "What are the property taxes for this home?",
      response: "The annual property tax is approximately $8,500 based on the current assessment."
    }
  ];
  
  const recentProperties = [
    {
      id: 3,
      title: "Beachfront Villa",
      location: "Miami, FL",
      price: 1750000,
      beds: 5,
      baths: 4,
      area: 3800,
      propertyType: "Villa",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      id: 4,
      title: "Mountain Retreat",
      location: "Aspen, CO",
      price: 1200000,
      beds: 3,
      baths: 2,
      area: 2200,
      propertyType: "Cabin",
      image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    },
    {
      id: 5,
      title: "Downtown Loft",
      location: "Chicago, IL",
      price: 550000,
      beds: 1,
      baths: 1,
      area: 950,
      propertyType: "Loft",
      image: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.fullName || user?.username || "Client"}</p>
        </div>
        <Button 
          className="mt-4 md:mt-0" 
          onClick={() => setLocation("/")}
        >
          <Home className="mr-2 h-4 w-4" /> Browse Properties
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Favorite Properties</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteProperties.length}</div>
            <p className="text-xs text-muted-foreground">Properties saved to your favorites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <p className="text-xs text-muted-foreground">Questions sent to property agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recently Viewed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentProperties.length}</div>
            <p className="text-xs text-muted-foreground">Properties you've viewed recently</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="favorites" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="inquiries">My Inquiries</TabsTrigger>
          <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProperties.length > 0 ? (
              favoriteProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-white rounded-full">
                        <Heart className="h-4 w-4 fill-current text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 mb-4">
                      <span className="text-xs">{property.beds} Beds</span>
                      <span className="text-xs">{property.baths} Baths</span>
                      <span className="text-xs">{property.area} sqft</span>
                      <span className="text-xs">{property.propertyType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">${property.price.toLocaleString()}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setLocation(`/property/${property.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <h3 className="text-lg font-medium mt-4">No favorite properties yet</h3>
                <p className="text-muted-foreground mt-2">
                  Start browsing properties and add them to your favorites!
                </p>
                <Button 
                  variant="default" 
                  className="mt-4" 
                  onClick={() => setLocation("/")}
                >
                  Browse Properties
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="inquiries">
          <div className="grid gap-6">
            {inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{inquiry.propertyTitle}</CardTitle>
                        <CardDescription>Inquiry sent on {inquiry.date}</CardDescription>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button 
                          variant={inquiry.status === "Answered" ? "outline" : "default"} 
                          size="sm"
                        >
                          {inquiry.status}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Your Message:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {inquiry.message}
                        </p>
                      </div>
                      
                      {inquiry.response && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Agent Response:</h4>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {inquiry.response}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setLocation(`/property/${inquiry.id}`)}
                        >
                          View Property
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <h3 className="text-lg font-medium mt-4">No inquiries yet</h3>
                <p className="text-muted-foreground mt-2">
                  When you contact agents about properties, your inquiries will appear here.
                </p>
                <Button 
                  variant="default" 
                  className="mt-4" 
                  onClick={() => setLocation("/")}
                >
                  Browse Properties
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.length > 0 ? (
              recentProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 bg-white rounded-full"
                        onClick={() => {
                          // Add to favorites logic would go here
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 mb-4">
                      <span className="text-xs">{property.beds} Beds</span>
                      <span className="text-xs">{property.baths} Baths</span>
                      <span className="text-xs">{property.area} sqft</span>
                      <span className="text-xs">{property.propertyType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">${property.price.toLocaleString()}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setLocation(`/property/${property.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <h3 className="text-lg font-medium mt-4">No recently viewed properties</h3>
                <p className="text-muted-foreground mt-2">
                  Start browsing properties to see your history here.
                </p>
                <Button 
                  variant="default" 
                  className="mt-4" 
                  onClick={() => setLocation("/")}
                >
                  Browse Properties
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export the protected route wrapped component
export default function ClientDashboardPage() {
  return <ProtectedClientRoute component={ClientDashboardContent} />;
}