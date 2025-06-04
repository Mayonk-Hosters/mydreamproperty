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
    maxPrice: 5000000,
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
    <div className="bg-white rounded-lg shadow-sm sm:shadow p-3 sm:p-5 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg">Filter Properties</h3>
        <div className="flex space-x-1.5 sm:space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden h-8 sm:h-9 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" /> 
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 sm:h-9 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
            onClick={resetFilters}
          >
            <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" /> 
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile filter panel with transition */}
      <div 
        className={`space-y-3 sm:space-y-4 transition-all duration-300 ease-in-out overflow-hidden ${
          showMobileFilters 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0 md:max-h-[2000px] md:opacity-100'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="type" className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 inline-block">Buy or Rent</Label>
            <Select 
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger id="type" className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy" className="text-xs sm:text-sm">Buy</SelectItem>
                <SelectItem value="rent" className="text-xs sm:text-sm">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="propertyType" className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 inline-block">Property Type</Label>
            <Select 
              value={filters.propertyType}
              onValueChange={(value) => handleFilterChange("propertyType", value)}
            >
              <SelectTrigger id="propertyType" className="h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any" className="text-xs sm:text-sm">Any type</SelectItem>
                {propertyTypesLoading ? (
                  <SelectItem value="loading" disabled className="text-xs sm:text-sm">Loading...</SelectItem>
                ) : (
                  propertyTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs sm:text-sm">{type}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="sm:col-span-2 md:col-span-1">
            <Label htmlFor="location" className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 inline-block">Search by Area</Label>
            <div className="relative">
              <Search className="absolute left-2 sm:left-2.5 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input 
                id="location"
                className="pl-7 sm:pl-9 h-9 sm:h-10 text-xs sm:text-sm"
                placeholder="Enter area name, neighborhood..." 
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
                  className="absolute right-2 top-2.5 sm:top-3 text-muted-foreground hover:text-primary"
                  onClick={() => handleLocationChange("")}
                  aria-label="Clear search"
                >
                  <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              Search by area name, district, state or neighborhood
            </p>
            {filters.location && filters.location.length >= 3 && (
              <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs bg-primary/10 text-primary rounded-md p-1 sm:p-1.5">
                <Search className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="font-medium">Searching for:</span> "{filters.location}"
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Label className="text-xs sm:text-sm font-medium">Price Range</Label>
              <span className="text-xs text-gray-500">
                {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
              </span>
            </div>
            <div className="pt-3 sm:pt-4 px-2">
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
                className="touch-action-none" /* Ensures better touch handling on mobile */
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="minBeds" className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 inline-block">Minimum Beds</Label>
              <Select 
                value={filters.minBeds.toString()}
                onValueChange={(value) => handleFilterChange("minBeds", parseInt(value))}
              >
                <SelectTrigger id="minBeds" className="h-9 sm:h-10 text-xs sm:text-sm">
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
              <Label htmlFor="minBaths" className="text-xs sm:text-sm font-medium mb-1 sm:mb-1.5 inline-block">Minimum Baths</Label>
              <Select 
                value={filters.minBaths.toString()}
                onValueChange={(value) => handleFilterChange("minBaths", parseInt(value))}
              >
                <SelectTrigger id="minBaths" className="h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0" className="text-xs sm:text-sm">Any</SelectItem>
                  <SelectItem value="1" className="text-xs sm:text-sm">1+</SelectItem>
                  <SelectItem value="2" className="text-xs sm:text-sm">2+</SelectItem>
                  <SelectItem value="3" className="text-xs sm:text-sm">3+</SelectItem>
                  <SelectItem value="4" className="text-xs sm:text-sm">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium mt-2" 
          onClick={applyFilters}
        >
          <Search className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Apply Filters
        </Button>
      </div>
    </div>
  );
}
