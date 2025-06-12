import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/common/layout";
import { PageTitle } from "@/components/common/page-title";

import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Property } from "@shared/schema";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function PropertiesPage() {
  const [location, setLocation] = useLocation();
  const { settings } = useSiteSettings();
  
  // Initialize tab and filters based on URL params
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const initialType = (type === "buy" || type === "rent") ? type : "buy";
    
    return {
      activeTab: initialType as "buy" | "rent",
      filters: {
        type: initialType,
        propertyType: params.get("propertyType") || "",
        location: params.get("location") || "",
        minPrice: parseInt(params.get("minPrice") || "0"),
        maxPrice: parseInt(params.get("maxPrice") || "0"),
        minBeds: parseInt(params.get("minBeds") || "0"),
        minBaths: parseInt(params.get("minBaths") || "0"),
      }
    };
  };
  
  const initialState = getInitialState();
  const [activeTab, setActiveTab] = useState<"buy" | "rent">(initialState.activeTab);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "">("");
  const [filters, setFilters] = useState(initialState.filters);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as "buy" | "rent");
    // Reset price filters when switching between buy/rent since they have different ranges
    setFilters(prev => ({ 
      ...prev, 
      type: value,
      minPrice: 0,
      maxPrice: 0
    }));
    
    // Update URL when changing tabs
    const params = new URLSearchParams(window.location.search);
    params.set("type", value);
    // Remove price params when switching tabs
    params.delete("minPrice");
    params.delete("maxPrice");
    setLocation(`/properties?${params.toString()}`);
  };

  // Fetch all properties once and filter client-side for superfast performance
  const { data: allProperties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Client-side filtering for instant results
  const properties = useMemo(() => {
    if (!allProperties) return [];
    
    return allProperties.filter(property => {
      // Type filter
      if (filters.type && property.type !== filters.type) return false;
      
      // Property type filter
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      
      // Location filter
      if (filters.location) {
        const searchTerm = filters.location.toLowerCase();
        const matchesLocation = 
          property.location?.toLowerCase().includes(searchTerm) ||
          property.address?.toLowerCase().includes(searchTerm) ||
          property.title?.toLowerCase().includes(searchTerm) ||
          (property as any).tehsilName?.toLowerCase().includes(searchTerm) ||
          (property as any).talukaName?.toLowerCase().includes(searchTerm) ||
          (property as any).districtName?.toLowerCase().includes(searchTerm) ||
          (property as any).stateName?.toLowerCase().includes(searchTerm);
        if (!matchesLocation) return false;
      }
      
      // Price filters
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && filters.maxPrice > 0 && property.price > filters.maxPrice) return false;
      
      // Beds filter
      if (filters.minBeds && property.beds < filters.minBeds) return false;
      
      // Baths filter
      if (filters.minBaths && property.baths < filters.minBaths) return false;
      
      return true;
    });
  }, [allProperties, filters]);

  // Update URL when filters change
  useEffect(() => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 0) {
          params.set(key, value.toString());
        }
      });
      const newUrl = `/properties?${params.toString()}`;
      setLocation(newUrl, { replace: true });
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  }, [filters, setLocation]);

  // Sort properties
  const sortedProperties = properties?.slice().sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  }) || [];

  // Group properties by type for mobile slider view
  const propertiesByType = useMemo(() => {
    if (!sortedProperties.length) return {};
    
    const grouped = sortedProperties.reduce((acc, property) => {
      const type = property.propertyType || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(property);
      return acc;
    }, {} as Record<string, Property[]>);
    
    // Sort the grouped object by property type name for consistent ordering
    const sortedGrouped = Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, Property[]>);
    
    return sortedGrouped;
  }, [sortedProperties]);

  const handleSort = (type: "newest" | "price-low" | "price-high") => {
    setSortBy(type);
  };

  const getTitle = () => {
    switch (filters.type) {
      case "buy":
        return "Properties for Sale";
      case "rent":
        return "Properties for Rent";
      default:
        return "Properties";
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
        <div className="mb-6 sm:mb-8 flex justify-center">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-pink-500/20 to-blue-600/20 rounded-full blur-xl"></div>
              <TabsList className="relative backdrop-blur-sm bg-white/80 border border-white/40 shadow-2xl rounded-full p-1.5 flex gap-1">
                <TabsTrigger 
                  value="buy" 
                  className="relative px-8 py-3.5 text-base font-bold rounded-full transition-all duration-500 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/30 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-violet-600 data-[state=inactive]:hover:bg-violet-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                    </svg>
                    Buy
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-violet-400/30 to-violet-400/0 transform translate-x-[-100%] data-[state=active]:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                </TabsTrigger>
                <TabsTrigger 
                  value="rent" 
                  className="relative px-8 py-3.5 text-base font-bold rounded-full transition-all duration-500 ease-out data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-emerald-600 data-[state=inactive]:hover:bg-emerald-50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Rent
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/30 to-emerald-400/0 transform translate-x-[-100%] data-[state=active]:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
        
        {/* Filters Section */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filters</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Property Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select 
                value={filters.propertyType}
                onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Row House">Row House</option>
                <option value="Twin Bunglow">Twin Bungalow</option>
                <option value="Industrial Plot">Industrial Plot</option>
                <option value="Industrial Shed">Industrial Shed</option>
                <option value="Open Plot">Open Plot</option>
              </select>
            </div>

            {/* BHK Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min BHK</label>
              <select 
                value={filters.minBeds}
                onChange={(e) => setFilters(prev => ({ ...prev, minBeds: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Any</option>
                <option value="1">1+ BHK</option>
                <option value="2">2+ BHK</option>
                <option value="3">3+ BHK</option>
                <option value="4">4+ BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            {/* Min Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <select 
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Any</option>
                {activeTab === "buy" ? (
                  // Sale price ranges
                  <>
                    <option value="500000">₹5 Lakh</option>
                    <option value="1000000">₹10 Lakh</option>
                    <option value="2500000">₹25 Lakh</option>
                    <option value="5000000">₹50 Lakh</option>
                    <option value="10000000">₹1 Crore</option>
                    <option value="20000000">₹2 Crore</option>
                  </>
                ) : (
                  // Rent price ranges
                  <>
                    <option value="5000">₹5,000/month</option>
                    <option value="10000">₹10,000/month</option>
                    <option value="15000">₹15,000/month</option>
                    <option value="25000">₹25,000/month</option>
                    <option value="35000">₹35,000/month</option>
                    <option value="50000">₹50,000/month</option>
                  </>
                )}
              </select>
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <select 
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="0">Any</option>
                {activeTab === "buy" ? (
                  // Sale price ranges
                  <>
                    <option value="1000000">₹10 Lakh</option>
                    <option value="2500000">₹25 Lakh</option>
                    <option value="5000000">₹50 Lakh</option>
                    <option value="10000000">₹1 Crore</option>
                    <option value="20000000">₹2 Crore</option>
                    <option value="50000000">₹5 Crore</option>
                  </>
                ) : (
                  // Rent price ranges
                  <>
                    <option value="10000">₹10,000/month</option>
                    <option value="15000">₹15,000/month</option>
                    <option value="25000">₹25,000/month</option>
                    <option value="35000">₹35,000/month</option>
                    <option value="50000">₹50,000/month</option>
                    <option value="75000">₹75,000/month</option>
                  </>
                )}
              </select>
            </div>

            {/* Location Filter - Added after Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter area, district, taluka, tehsil, or state"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilters({ type: activeTab, propertyType: "", location: "", minPrice: 0, maxPrice: 0, minBeds: 0, minBaths: 0 })}
              className="text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        {/* Property Listings */}
        <div id="properties-results" className="w-full">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium mb-2">Error loading properties</p>
                <p className="text-red-500 text-sm mb-4">Please try refreshing the page</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          ) : isLoading ? (
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
                <div className="hidden sm:flex flex-wrap sm:flex-nowrap gap-2">
                  <Button 
                    variant={sortBy === "newest" ? "default" : "outline"} 
                    size="sm" 
                    className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 py-1"
                    onClick={() => handleSort("newest")}
                  >
                    Newest First
                  </Button>
                  <Button 
                    variant={sortBy === "price-low" ? "default" : "outline"} 
                    size="sm" 
                    className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 py-1"
                    onClick={() => handleSort("price-low")}
                  >
                    Price: Low to High
                  </Button>
                  <Button 
                    variant={sortBy === "price-high" ? "default" : "outline"} 
                    size="sm" 
                    className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 py-1"
                    onClick={() => handleSort("price-high")}
                  >
                    Price: High to Low
                  </Button>
                </div>
              </div>
              
              {/* Mobile View - Property Types with Horizontal Sliders */}
              <div className="block sm:hidden">
                {Object.entries(propertiesByType).map(([propertyType, typeProperties]) => (
                  <div key={propertyType} className="mb-8">
                    {/* Property Type Title */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="text-lg font-bold text-gray-800">{propertyType}</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {typeProperties.length}
                      </span>
                    </div>
                    
                    {/* Mobile Horizontal Slider */}
                    <div className="relative">
                      <div 
                        className="overflow-x-auto scrollbar-hide"
                        style={{
                          scrollSnapType: 'x mandatory',
                          WebkitOverflowScrolling: 'touch',
                          scrollBehavior: 'smooth'
                        }}
                      >
                        <div className="flex gap-3" style={{ paddingLeft: '16px', paddingRight: '80px' }}>
                          {typeProperties.map((property) => (
                            <div
                              key={property.id}
                              className="flex-none"
                              style={{
                                width: 'calc(100vw - 120px)',
                                maxWidth: '300px',
                                scrollSnapAlign: 'start'
                              }}
                              onClick={() => window.location.href = `/property/${property.id}`}
                            >
                              <PropertyCard property={property} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop View - Grid Layout */}
              <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {sortedProperties.map((property) => (
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
    </Layout>
  );
}