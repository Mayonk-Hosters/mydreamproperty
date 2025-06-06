import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_PROPERTY_TYPES, PropertyType } from "@shared/schema";
import { Search, Filter, XCircle, ChevronDown, MapPin, Home, Bed, Bath, IndianRupee, RefreshCw } from "lucide-react";

interface PropertyFilterProps {
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function PropertyFilter({ onFilterChange }: PropertyFilterProps) {
  const [location, setLocation] = useLocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  // Fetch property types from API
  const { data: propertyTypesData, isLoading: propertyTypesLoading } = useQuery<PropertyType[]>({
    queryKey: ['/api/property-types'],
    enabled: true,
  });
  
  // Get active property types or fall back to default types
  const propertyTypes = propertyTypesData?.filter(pt => pt.active).map(pt => pt.name) || DEFAULT_PROPERTY_TYPES;
  
  const [filters, setFilters] = useState({
    type: "buy",
    propertyType: "",
    location: "",
    minPrice: 0,
    maxPrice: 15000000, // Set a reasonable default max
    minBeds: 0,
    minBaths: 0,
  });

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const updatedFilters = { ...filters };
    
    if (params.has("type")) {
      updatedFilters.type = params.get("type")!;
    }
    
    if (params.has("propertyType")) {
      updatedFilters.propertyType = params.get("propertyType")!;
    }
    
    if (params.has("location")) {
      updatedFilters.location = params.get("location")!;
    }
    
    if (params.has("minPrice")) {
      updatedFilters.minPrice = parseInt(params.get("minPrice")!);
    }
    
    if (params.has("maxPrice")) {
      updatedFilters.maxPrice = parseInt(params.get("maxPrice")!);
    }
    
    if (params.has("minBeds")) {
      updatedFilters.minBeds = parseInt(params.get("minBeds")!);
    }
    
    if (params.has("minBaths")) {
      updatedFilters.minBaths = parseInt(params.get("minBaths")!);
    }
    
    setFilters(updatedFilters);
  }, [location]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const queryParams = new URLSearchParams();
    
    // Only add non-default values to the URL
    if (filters.type !== "buy") {
      queryParams.set("type", filters.type);
    }
    
    if (filters.propertyType && filters.propertyType !== 'any') {
      queryParams.set("propertyType", filters.propertyType);
    }
    
    if (filters.location) {
      queryParams.set("location", filters.location);
    }
    
    if (filters.minPrice > 0) {
      queryParams.set("minPrice", filters.minPrice.toString());
    }
    
    if (filters.maxPrice < 5000000) {
      queryParams.set("maxPrice", filters.maxPrice.toString());
    }
    
    if (filters.minBeds > 0) {
      queryParams.set("minBeds", filters.minBeds.toString());
    }
    
    if (filters.minBaths > 0) {
      queryParams.set("minBaths", filters.minBaths.toString());
    }
    
    // Update URL and notify parent component
    const searchParams = queryParams.toString();
    setLocation(`/properties${searchParams ? `?${searchParams}` : ''}`);
    
    if (onFilterChange) {
      onFilterChange(filters);
    }
    
    // Close mobile filters if open
    setShowMobileFilters(false);
  };

  const handleLocationChange = (value: string) => {
    setFilters({
      ...filters,
      location: value
    });
    
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        location: value
      });
    }
    
    // If we have at least 3 characters, scroll to the results section after search is applied
    if (value.trim().length >= 3) {
      setTimeout(() => {
        const resultsSection = document.getElementById('properties-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const resetFilters = () => {
    setFilters({
      type: "buy",
      propertyType: "",
      location: "",
      minPrice: 0,
      maxPrice: 15000000,
      minBeds: 0,
      minBaths: 0,
    });
    setLocation("/properties");
    
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-bold text-gray-800">Find Your Perfect Property</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetFilters}
              className="text-xs hover:bg-red-50 hover:text-red-600 border-red-200"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 
              Reset All
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Search Card */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Buy/Rent Selection */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-blue-600" />
                <Label className="text-sm font-semibold text-gray-700">Transaction Type</Label>
              </div>
              <Select 
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger className="h-11 border-2 focus:border-blue-400">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">🏠 Buy Property</SelectItem>
                  <SelectItem value="rent">🏠 Rent Property</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Property Type */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-green-600" />
                <Label className="text-sm font-semibold text-gray-700">Property Type</Label>
              </div>
              <Select 
                value={filters.propertyType}
                onValueChange={(value) => handleFilterChange("propertyType", value)}
              >
                <SelectTrigger className="h-11 border-2 focus:border-green-400">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">🏢 Any Type</SelectItem>
                  {propertyTypesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Location Search */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <Label className="text-sm font-semibold text-gray-700">Location</Label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input 
                  className="pl-10 h-11 border-2 focus:border-purple-400"
                  placeholder="Search location..." 
                  value={filters.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyFilters();
                    }
                  }}
                />
                {filters.location && (
                  <button 
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => handleLocationChange("")}
                    aria-label="Clear search"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Card */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <Card className="shadow-md">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IndianRupee className="h-4 w-4 text-orange-600" />
                  <CardTitle className="text-base font-semibold text-gray-700">Advanced Filters</CardTitle>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isAdvancedOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-semibold text-gray-700">Price Range</Label>
                  </div>
                  <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
                    {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
                  </span>
                </div>
                
                <div className="px-3">
                  <Slider 
                    defaultValue={[filters.minPrice, filters.maxPrice]} 
                    min={0} 
                    max={15000000} 
                    step={100000}
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={(value) => {
                      handleFilterChange("minPrice", value[0]);
                      handleFilterChange("maxPrice", value[1]);
                    }}
                    className="cursor-pointer"
                  />
                </div>
                
                {/* Quick Price Range Presets */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleFilterChange("minPrice", 0);
                      handleFilterChange("maxPrice", 3000000);
                    }}
                    className="text-xs hover:bg-blue-50 hover:text-blue-600"
                  >
                    Under ₹30L
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleFilterChange("minPrice", 3000000);
                      handleFilterChange("maxPrice", 6000000);
                    }}
                    className="text-xs hover:bg-blue-50 hover:text-blue-600"
                  >
                    ₹30L - ₹60L
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleFilterChange("minPrice", 6000000);
                      handleFilterChange("maxPrice", 10000000);
                    }}
                    className="text-xs hover:bg-blue-50 hover:text-blue-600"
                  >
                    ₹60L - ₹1Cr
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleFilterChange("minPrice", 10000000);
                      handleFilterChange("maxPrice", 15000000);
                    }}
                    className="text-xs hover:bg-blue-50 hover:text-blue-600"
                  >
                    Above ₹1Cr
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      handleFilterChange("minPrice", 0);
                      handleFilterChange("maxPrice", 15000000);
                    }}
                    className="text-xs hover:bg-blue-50 hover:text-blue-600"
                  >
                    Any Price
                  </Button>
                </div>
              </div>
              
              {/* Bedrooms and Bathrooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-4 w-4 text-purple-600" />
                    <Label className="text-sm font-semibold text-gray-700">Min Bedrooms</Label>
                  </div>
                  <Select 
                    value={filters.minBeds.toString()}
                    onValueChange={(value) => handleFilterChange("minBeds", parseInt(value))}
                  >
                    <SelectTrigger className="h-11 border-2 focus:border-purple-400">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">🛏️ Any</SelectItem>
                      <SelectItem value="1">🛏️ 1+</SelectItem>
                      <SelectItem value="2">🛏️ 2+</SelectItem>
                      <SelectItem value="3">🛏️ 3+</SelectItem>
                      <SelectItem value="4">🛏️ 4+</SelectItem>
                      <SelectItem value="5">🛏️ 5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Bath className="h-4 w-4 text-teal-600" />
                    <Label className="text-sm font-semibold text-gray-700">Min Bathrooms</Label>
                  </div>
                  <Select 
                    value={filters.minBaths.toString()}
                    onValueChange={(value) => handleFilterChange("minBaths", parseInt(value))}
                  >
                    <SelectTrigger className="h-11 border-2 focus:border-teal-400">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">🚿 Any</SelectItem>
                      <SelectItem value="1">🚿 1+</SelectItem>
                      <SelectItem value="2">🚿 2+</SelectItem>
                      <SelectItem value="3">🚿 3+</SelectItem>
                      <SelectItem value="4">🚿 4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Apply Filters Button */}
              <Button 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02]" 
                onClick={applyFilters}
              >
                <Search className="mr-2 h-5 w-5" /> 
                Search Properties
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
