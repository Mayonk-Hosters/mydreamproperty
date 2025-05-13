import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/property-card";
import { ArrowRight } from "lucide-react";
import { Property } from "@shared/schema";

type PropertyType = "buy" | "rent";

export function PropertyTabs() {
  const [activeTab, setActiveTab] = useState<PropertyType>("buy");
  
  // Query for properties with "buy" type
  const { 
    data: buyProperties, 
    isLoading: isBuyLoading 
  } = useQuery<Property[]>({
    queryKey: ['/api/properties?type=buy&featured=true'],
  });
  
  // Query for properties with "rent" type
  const { 
    data: rentProperties, 
    isLoading: isRentLoading 
  } = useQuery<Property[]>({
    queryKey: ['/api/properties?type=rent&featured=true'],
  });
  
  // We've removed the "sell" type query

  const handleTabChange = (value: string) => {
    setActiveTab(value as PropertyType);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Browse Properties</h2>
        </div>
        
        <Tabs defaultValue="buy" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 mb-8">
            <TabsTrigger value="buy" className="px-6 py-2">Buy</TabsTrigger>
            <TabsTrigger value="rent" className="px-6 py-2">Rent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isBuyLoading ? (
                // Loading skeletons
                Array(4).fill(0).map((_, index) => (
                  <PropertySkeleton key={index} />
                ))
              ) : buyProperties && buyProperties.length > 0 ? (
                buyProperties.slice(0, 8).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No properties found for sale.</p>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href="/properties?type=buy">
                <Button variant="outline" className="group px-6 py-2 border border-primary text-primary font-medium rounded hover:bg-primary hover:text-white transition-all">
                  View All Properties For Sale
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="rent" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isRentLoading ? (
                Array(4).fill(0).map((_, index) => (
                  <PropertySkeleton key={index} />
                ))
              ) : rentProperties && rentProperties.length > 0 ? (
                rentProperties.slice(0, 8).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No properties found for rent.</p>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href="/properties?type=rent">
                <Button variant="outline" className="group px-6 py-2 border border-primary text-primary font-medium rounded hover:bg-primary hover:text-white transition-all">
                  View All Rental Properties
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          {/* Sell tab content removed */}
        </Tabs>
      </div>
    </section>
  );
}

// Reusable PropertySkeleton component
function PropertySkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-40 mb-1" />
        <Skeleton className="h-4 w-32 mb-2" />
        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20 ml-2" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}