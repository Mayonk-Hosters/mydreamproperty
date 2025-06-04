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
    maxPrice: 0, // Set to 0 to disable default max price filtering
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
    } else if (propertyType) {
      // When browsing by property type, don't filter by transaction type
      updatedFilters.type = ""; // Allow all transaction types
      setActiveTab("buy"); // Default tab for display purposes
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

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{pageTitle}</h1>
        
        {/* Property Type Tabs */}
        <div className="mb-6 sm:mb-8">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 mb-4">
              <TabsTrigger value="buy" className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base">Buy</TabsTrigger>
              <TabsTrigger value="rent" className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base">Rent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 order-1 sm:order-none">
            <PropertyFilter 
              onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} 
            />
          </div>
          
          {/* Property Listings */}
          <div id="properties-results" className="lg:col-span-3 order-2 sm:order-none">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                    <Skeleton className="h-44 sm:h-48 w-full" />
                    <div className="p-3 sm:p-4">
                      <div className="flex justify-between mb-1 sm:mb-2">
                        <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                      </div>
                      <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 mb-1" />
                      <Skeleton className="h-3 sm:h-4 w-28 sm:w-32 mb-2" />
                      <div className="flex justify-between mb-2 sm:mb-3">
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                      </div>
                      <div className="pt-2 sm:pt-3 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center">
                          <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                          <Skeleton className="h-3 sm:h-4 w-14 sm:w-20 ml-1.5 sm:ml-2" />
                        </div>
                        <Skeleton className="h-4 sm:h-6 w-10 sm:w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
                  <p className="text-sm sm:text-base text-gray-600">{properties.length} properties found</p>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 py-1">
                      Newest First
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 py-1">
                      Price: Low to High
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                
                {properties.length > 12 && (
                  <div className="mt-6 sm:mt-8 flex justify-center">
                    <Button variant="outline" className="text-sm">Load More Properties</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 sm:p-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Try adjusting your search filters to find properties that match your criteria.
                </p>
                <Button 
                  onClick={() => setFilters({
                    type: "buy",
                    propertyType: "",
                    location: "",
                    minPrice: 0,
                    maxPrice: 5000000,
                    minBeds: 0,
                    minBaths: 0,
                  })}
                  className="text-sm h-9"
                >
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
