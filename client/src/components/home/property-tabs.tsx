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
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex justify-center mb-12">
            <div className="relative max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-pink-500/20 to-blue-600/20 rounded-full blur-xl"></div>
              <TabsList className="relative backdrop-blur-sm bg-white/80 border border-white/40 shadow-2xl rounded-full p-1.5 flex gap-1">
                <TabsTrigger 
                  value="buy" 
                  className="relative px-8 py-3.5 text-base font-bold rounded-full transition-all duration-500 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-blue-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 data-[state=active]:scale-105 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-blue-600 data-[state=inactive]:hover:bg-blue-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                    </svg>
                    Buy
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/40 to-blue-400/0 transform translate-x-[-100%] data-[state=active]:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                </TabsTrigger>
                <TabsTrigger 
                  value="rent" 
                  className="relative px-8 py-3.5 text-base font-bold rounded-full transition-all duration-500 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/50 data-[state=active]:scale-105 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-emerald-600 data-[state=inactive]:hover:bg-emerald-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Rent
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/40 to-emerald-400/0 transform translate-x-[-100%] data-[state=active]:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="buy" className="mt-0">
            {/* Featured Properties Section */}
            {featuredBuyProperties.length > 0 && (
              <div className="mb-12 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <h3 className="text-2xl font-bold mb-6 text-blue-800 flex items-center">
                  <span className="inline-block w-3 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-sm mr-3"></span> 
                  ⭐ Featured Properties for Buy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredBuyProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular Properties Section */}
            <div className={featuredBuyProperties.length > 0 ? "mt-8 p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200" : "p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200"}>
              {featuredBuyProperties.length > 0 && (
                <h3 className="text-2xl font-bold mb-6 text-slate-700 flex items-center">
                  <span className="inline-block w-3 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-sm mr-3"></span>
                  🏠 More Properties for Buy
                </h3>
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
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No properties found for buy.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-10 flex justify-center">
              <Link href="/properties?type=buy">
                <Button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-300/30 hover:shadow-xl hover:shadow-blue-400/40 transform hover:scale-105 transition-all duration-300">
                  View All Properties for Buy
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="rent" className="mt-0">
            {/* Featured Properties Section */}
            {featuredRentProperties.length > 0 && (
              <div className="mb-12 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                <h3 className="text-2xl font-bold mb-6 text-emerald-800 flex items-center">
                  <span className="inline-block w-3 h-8 bg-gradient-to-b from-emerald-600 to-green-700 rounded-sm mr-3"></span>
                  ⭐ Featured Properties for Rent
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredRentProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular Properties Section */}
            <div className={featuredRentProperties.length > 0 ? "mt-8 p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200" : "p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200"}>
              {featuredRentProperties.length > 0 && (
                <h3 className="text-2xl font-bold mb-6 text-slate-700 flex items-center">
                  <span className="inline-block w-3 h-8 bg-gradient-to-b from-emerald-500 to-green-600 rounded-sm mr-3"></span>
                  🏢 More Properties for Rent
                </h3>
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
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No properties found for rent.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-10 flex justify-center">
              <Link href="/properties?type=rent">
                <Button className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-300/30 hover:shadow-xl hover:shadow-emerald-400/40 transform hover:scale-105 transition-all duration-300">
                  View All Properties for Rent
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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