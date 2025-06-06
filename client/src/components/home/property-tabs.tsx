import { useState, useEffect } from "react";
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
  
  // Query for all active properties
  const { 
    data: properties, 
    isLoading: isLoading 
  } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    select: (data) => data?.filter(property => property.status === 'active') || [],
    staleTime: 0, // Force fresh data fetch
    gcTime: 0, // Don't cache the data (updated from cacheTime)
  });
  

  
  // Helper function to determine if a property is featured
  const isFeatured = (property: Property) => {
    const feat = property.featured;
    // Handle different data types that might come from the database
    if (typeof feat === 'boolean') {
      return feat === true;
    } else if (typeof feat === 'string') {
      return feat === 't' || feat === 'true' || feat === '1';
    } else if (typeof feat === 'number') {
      return feat === 1;
    } else {
      return false;
    }
  };

  // Derived state for featured properties
  const featuredProperties = properties?.filter(isFeatured) || [];
  
  // Derived state for buy properties (includes both 'buy' and 'sell' types) - sorted by newest first
  const buyProperties = properties?.filter(property => 
    (property.type === 'buy' || property.type === 'sell') && !isFeatured(property)
  ).sort((a, b) => b.id - a.id) || [];
  
  // Featured buy properties (includes both 'buy' and 'sell' types)
  const featuredBuyProperties = featuredProperties.filter(property => 
    property.type === 'buy' || property.type === 'sell'
  );
  
  // Derived state for rent properties - sorted by newest first
  const rentProperties = properties?.filter(property => 
    property.type === 'rent' && !isFeatured(property)
  ).sort((a, b) => b.id - a.id) || [];
  
  // Featured rent properties
  const featuredRentProperties = featuredProperties.filter(property => property.type === 'rent');
  
  // We've removed the "sell" type query

  const handleTabChange = (value: string) => {
    setActiveTab(value as PropertyType);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Explore Our Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your perfect home from our curated collection of premium properties
          </p>
        </div>
        
        <Tabs defaultValue="buy" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center mb-12 animate-slide-up">
            <TabsList className="bg-white p-2 rounded-2xl shadow-lg border border-gray-200">
              <TabsTrigger 
                value="buy" 
                className="px-8 py-3 text-lg font-semibold rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-blue-600 transition-all duration-300"
              >
                For Sale
              </TabsTrigger>
              <TabsTrigger 
                value="rent" 
                className="px-8 py-3 text-lg font-semibold rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-green-600 transition-all duration-300"
              >
                For Rent
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="buy" className="mt-0">
            {/* Featured Properties Section */}
            {featuredBuyProperties.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-5 text-primary flex items-center">
                  <span className="inline-block w-2 h-6 bg-primary mr-2"></span> 
                  Featured Properties For Sale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredBuyProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular Properties Section */}
            <div className={featuredBuyProperties.length > 0 ? "mt-8" : ""}>
              {featuredBuyProperties.length > 0 && (
                <h3 className="text-xl font-semibold mb-5">More Properties For Sale</h3>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  // Loading skeletons
                  Array(4).fill(0).map((_, index) => (
                    <PropertySkeleton key={index} />
                  ))
                ) : buyProperties.length > 0 ? (
                  buyProperties.slice(0, 8).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))
                ) : featuredBuyProperties.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No properties found for sale.</p>
                  </div>
                )}
              </div>
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
            {/* Featured Properties Section */}
            {featuredRentProperties.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-5 text-primary flex items-center">
                  <span className="inline-block w-2 h-6 bg-primary mr-2"></span>
                  Featured Properties For Rent
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredRentProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular Properties Section */}
            <div className={featuredRentProperties.length > 0 ? "mt-8" : ""}>
              {featuredRentProperties.length > 0 && (
                <h3 className="text-xl font-semibold mb-5">More Properties For Rent</h3>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  Array(4).fill(0).map((_, index) => (
                    <PropertySkeleton key={index} />
                  ))
                ) : rentProperties.length > 0 ? (
                  rentProperties.slice(0, 8).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))
                ) : featuredRentProperties.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No properties found for rent.</p>
                  </div>
                )}
              </div>
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