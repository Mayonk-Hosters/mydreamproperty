import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/common/layout";
import { PageTitle } from "@/components/common/page-title";
import { PropertyFilter } from "@/components/properties/property-filter";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Property } from "@shared/schema";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function PropertiesPage() {
  const [location, setLocation] = useLocation();
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<"buy" | "rent">("buy");
  const [filters, setFilters] = useState({
    type: "buy",
    propertyType: "",
    location: "",
    minPrice: 0,
    maxPrice: 5000000,
    minBeds: 0,
    minBaths: 0,
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as "buy" | "rent");
    setFilters(prev => ({ ...prev, type: value }));
    
    // Update URL when changing tabs
    const params = new URLSearchParams(window.location.search);
    params.set("type", value);
    setLocation(`/properties?${params.toString()}`);
  };

  // Parse URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const propertyType = params.get("propertyType");
    const locationParam = params.get("location");
    const minPrice = params.get("minPrice");
    const maxPrice = params.get("maxPrice");
    const minBeds = params.get("minBeds");
    const minBaths = params.get("minBaths");

    const updatedFilters = { ...filters };
    
    if (type) {
      updatedFilters.type = type;
      setActiveTab(type as "buy" | "rent");
    }
    if (propertyType) updatedFilters.propertyType = propertyType;
    if (locationParam) updatedFilters.location = locationParam;
    if (minPrice) updatedFilters.minPrice = parseInt(minPrice);
    if (maxPrice) updatedFilters.maxPrice = parseInt(maxPrice);
    if (minBeds) updatedFilters.minBeds = parseInt(minBeds);
    if (minBaths) updatedFilters.minBaths = parseInt(minBaths);
    
    setFilters(updatedFilters);
  }, [location]);

  // Build API query string
  const queryString = Object.entries(filters)
    .filter(([_, value]) => {
      if (typeof value === 'number') {
        return value > 0;
      }
      return value !== "";
    })
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  // Fetch properties based on filters
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: [`/api/properties?${queryString}`],
  });

  const getTitle = () => {
    switch (filters.type) {
      case "rent": return "Properties for Rent";
      case "sell": return "Properties for Sale";
      case "buy": 
      default: return "Properties for Sale";
    }
  };
  
  const title = getTitle();
  const locationText = filters.location ? `in ${filters.location}` : "";
  const propertyTypeText = filters.propertyType ? `${filters.propertyType}s` : "Properties";
  const pageTitle = `${filters.propertyType || ""} ${title} ${locationText}`;

  return (
    <Layout>
      <PageTitle title={`${pageTitle} | ${settings.siteName}`} />
      <Helmet>
        <meta 
          name="description" 
          content={`Browse our selection of ${propertyTypeText} available for ${filters.type} ${locationText}. Find your perfect home with ${settings.siteName}.`} 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{pageTitle}</h1>
        
        {/* Property Type Tabs */}
        <div className="mb-8">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 mb-4">
              <TabsTrigger value="buy" className="px-6 py-2">Buy</TabsTrigger>
              <TabsTrigger value="rent" className="px-6 py-2">Rent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <PropertyFilter 
              onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} 
            />
          </div>
          
          {/* Property Listings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
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
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">{properties.length} properties found</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Newest First
                    </Button>
                    <Button variant="outline" size="sm">
                      Price: Low to High
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                
                {properties.length > 12 && (
                  <div className="mt-8 flex justify-center">
                    <Button variant="outline">Load More Properties</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-10 text-center">
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search filters to find properties that match your criteria.
                </p>
                <Button onClick={() => setFilters({
                  type: "buy",
                  propertyType: "",
                  location: "",
                  minPrice: 0,
                  maxPrice: 5000000,
                  minBeds: 0,
                  minBaths: 0,
                })}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
