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
import { formatCurrency } from "@/lib/utils";
import { DEFAULT_PROPERTY_TYPES, PropertyType } from "@shared/schema";
import { Search, Filter, XCircle } from "lucide-react";

interface PropertyFilterProps {
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function PropertyFilter({ onFilterChange }: PropertyFilterProps) {
  const [location, setLocation] = useLocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
    maxPrice: 0, // Set to 0 to disable default max price filtering
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
      maxPrice: 5000000,
      minBeds: 0,
      minBaths: 0,
    });
    setLocation("/properties");
    
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filter Properties</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="h-4 w-4 mr-1" /> 
            Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetFilters}
          >
            <XCircle className="h-4 w-4 mr-1" /> 
            Reset
          </Button>
        </div>
      </div>
      
      {/* Mobile filter panel */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showMobileFilters 
            ? 'max-h-[1000px] opacity-100' 
            : 'max-h-0 opacity-0 md:max-h-[1000px] md:opacity-100'
        }`}
      >
        {/* Mobile: Stack filters vertically, Desktop: Grid layout */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          
          {/* Buy/Rent Selection */}
          <div>
            <Label htmlFor="type" className="text-sm font-medium mb-2 block">Buy or Rent</Label>
            <Select 
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger id="type" className="h-11 text-base">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Property Type */}
          <div>
            <Label htmlFor="propertyType" className="text-sm font-medium mb-2 block">Property Type</Label>
            <Select 
              value={filters.propertyType}
              onValueChange={(value) => handleFilterChange("propertyType", value)}
            >
              <SelectTrigger id="propertyType" className="h-11 text-base">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any type</SelectItem>
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
          <div>
            <Label htmlFor="location" className="text-sm font-medium mb-2 block">Search Area</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location"
                className="pl-10 h-11 text-base"
                placeholder="Search by area, district, taluka, tehsil..." 
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
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary"
                  onClick={() => handleLocationChange("")}
                  aria-label="Clear search"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Search by any location: area, district, taluka, tehsil, or state
            </p>
          </div>
        </div>
        
        {/* Advanced Filters - Collapsible on mobile */}
        <div className="space-y-4 border-t pt-4 mt-4">
          
          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Price Range</Label>
              <span className="text-sm text-gray-600 font-medium">
                {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
              </span>
            </div>
            <div className="px-2">
              <Slider 
                defaultValue={[filters.minPrice, filters.maxPrice]} 
                min={0} 
                max={5000000} 
                step={50000}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={(value) => {
                  handleFilterChange("minPrice", value[0]);
                  handleFilterChange("maxPrice", value[1]);
                }}
                className="cursor-pointer"
              />
            </div>
          </div>
          
          {/* Bedrooms and Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minBeds" className="text-sm font-medium mb-2 block">Min Bedrooms</Label>
              <Select 
                value={filters.minBeds.toString()}
                onValueChange={(value) => handleFilterChange("minBeds", parseInt(value))}
              >
                <SelectTrigger id="minBeds" className="h-11 text-base">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-xs sm:text-sm">Any</SelectItem>
                  <SelectItem value="1" className="text-xs sm:text-sm">1+</SelectItem>
                  <SelectItem value="2" className="text-xs sm:text-sm">2+</SelectItem>
                  <SelectItem value="3" className="text-xs sm:text-sm">3+</SelectItem>
                  <SelectItem value="4" className="text-xs sm:text-sm">4+</SelectItem>
                  <SelectItem value="5" className="text-xs sm:text-sm">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="minBaths" className="text-sm font-medium mb-2 block">Min Bathrooms</Label>
              <Select 
                value={filters.minBaths.toString()}
                onValueChange={(value) => handleFilterChange("minBaths", parseInt(value))}
              >
                <SelectTrigger id="minBaths" className="h-11 text-base">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Apply Filters Button */}
          <Button 
            className="w-full h-12 text-base font-medium mt-6" 
            onClick={applyFilters}
          >
            <Search className="mr-2 h-5 w-5" /> 
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
