import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import { Property } from "@shared/schema";

export default function MDPPropertiesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const { data: mdpProperties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/mdp-properties"],
    retry: false,
  });

  const { data: rentProperties } = useQuery<Property[]>({
    queryKey: ["/api/mdp-properties/rent"],
    enabled: activeTab === "rent",
  });

  const { data: buyProperties } = useQuery<Property[]>({
    queryKey: ["/api/mdp-properties/buy"],
    enabled: activeTab === "buy",
  });

  const getDisplayProperties = () => {
    if (activeTab === "rent") return rentProperties;
    if (activeTab === "buy") return buyProperties;
    return mdpProperties;
  };

  const displayProperties = getDisplayProperties();

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>MDP Properties | My Dream Property</title>
        <meta name="description" content="Browse our exclusive collection of MDP-prefixed properties for rent and sale." />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-2">MDP Properties</h1>
      <p className="text-gray-600 mb-6">
        Browse our exclusive collection of properties with MDP prefixes - premium listings for both rent and sale.
      </p>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="rent">For Rent</TabsTrigger>
          <TabsTrigger value="buy">For Sale</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-10">Loading properties...</div>
            ) : displayProperties && displayProperties.length > 0 ? (
              displayProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">No properties found.</div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="rent" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-10">Loading properties...</div>
            ) : rentProperties && rentProperties.length > 0 ? (
              rentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">No rental properties found.</div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="buy" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-10">Loading properties...</div>
            ) : buyProperties && buyProperties.length > 0 ? (
              buyProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">No properties for sale found.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const formatPrice = (price: number, type: string) => {
    return type === 'rent' 
      ? `$${price.toLocaleString()}/month`
      : `$${price.toLocaleString()}`;
  };

  const mainImage = Array.isArray(property.images) && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400';

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={mainImage} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-2 right-2 capitalize" variant={property.type === 'rent' ? 'secondary' : 'default'}>
          {property.type === 'rent' ? 'For Rent' : 'For Sale'}
        </Badge>
        {property.featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500" variant="outline">
            Featured
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{property.title}</CardTitle>
        </div>
        <CardDescription className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-1" /> {property.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="flex justify-between text-sm mb-4">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" /> {property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" /> {property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" /> {property.area} ft²
          </div>
        </div>
        <p className="line-clamp-2 text-gray-600 text-sm">{property.description}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <p className="font-bold text-lg">{formatPrice(property.price, property.type)}</p>
        <Link href={`/properties/${property.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}