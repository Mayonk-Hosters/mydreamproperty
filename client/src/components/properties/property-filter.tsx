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
  
  // Fetch available property types from database
  const { data: availablePropertyTypes, isLoading: propertyTypesLoading } = useQuery<string[]>({
    queryKey: ['/api/available-property-types'],
    enabled: true,
  });
  
  const [filters, setFilters] = useState({
    type: "buy",
    propertyType: "",
    location: "",
    minPrice: 0,
    maxPrice: 15000000,
    minBeds: 0,
    minBaths: 0,
  });

  // Initialize clean filters on component mount
  useEffect(() => {
    // Clear any existing URL parameters
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());
    
    // Reset filters to clean state
    const cleanFilters = {
      type: "buy",
      propertyType: "",
      location: "",
      minPrice: 0,
      maxPrice: 15000000,
      minBeds: 0,
      minBaths: 0,
    };
    
    setFilters(cleanFilters);
  }, []);

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
    // Clear all filters completely
    const cleanFilters = {
      type: "buy",
      propertyType: "",
      location: "",
      minPrice: 0,
      maxPrice: 15000000,
      minBeds: 0,
      minBaths: 0,
    };
    
    setFilters(cleanFilters);
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url.toString());
    setLocation("/properties");
    
    // Clear any cached query data
    if (onFilterChange) {
      onFilterChange(cleanFilters);
    }
    
    // Force page refresh to ensure clean state
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Compact Search Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Search Properties
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetFilters}
              className="text-xs hover:bg-red-50 hover:text-red-600 border-red-200"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 
              Reset
            </Button>
          </div>
          
          {/* Compact Single Row Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <Select 
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="h-11 border-2 focus:border-blue-400 bg-white">
                <SelectValue placeholder="Buy/Rent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">🏠 Buy</SelectItem>
                <SelectItem value="rent">🏡 Rent</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.propertyType}
              onValueChange={(value) => handleFilterChange("propertyType", value)}
            >
              <SelectTrigger className="h-11 border-2 focus:border-green-400 bg-white">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {propertyTypesLoading ? (
                  <SelectItem value="" disabled>Loading...</SelectItem>
                ) : availablePropertyTypes && availablePropertyTypes.length > 0 ? (
                  availablePropertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === 'Apartment' && '🏢'} 
                      {type === 'House' && '🏠'} 
                      {type === 'Bunglow' && '🏘️'} 
                      {type === 'Villa' && '🏡'} 
                      {type === 'Commercial' && '🏢'} 
                      {!['Apartment', 'House', 'Bunglow', 'Villa', 'Commercial'].includes(type) && '🏗️'} 
                      {' '}{type}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No types available</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-10 h-11 border-2 focus:border-purple-400 bg-white"
                placeholder="Location..." 
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => handleLocationChange("")}
                  aria-label="Clear search"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <Button 
              onClick={applyFilters}
              className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Search className="mr-1 h-4 w-4" /> 
              Search
            </Button>
          </div>
          
          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {/* Property Type Quick Filters */}
            {availablePropertyTypes && availablePropertyTypes.map((type) => (
              <button
                key={`type-${type}`}
                onClick={() => {
                  setFilters(prev => ({ ...prev, propertyType: prev.propertyType === type ? "" : type }));
                  setTimeout(applyFilters, 100);
                }}
                className={`px-4 py-2 text-sm rounded-full border-2 transition-all font-medium shadow-sm ${
                  filters.propertyType === type
                    ? 'bg-green-500 text-white border-green-500 shadow-md transform scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50 hover:shadow-md'
                }`}
              >
                {type === 'Apartment' && '🏢'} 
                {type === 'House' && '🏠'} 
                {type === 'Bunglow' && '🏘️'} 
                {type === 'Villa' && '🏡'} 
                {type === 'Commercial' && '🏢'} 
                {!['Apartment', 'House', 'Bunglow', 'Villa', 'Commercial'].includes(type) && '🏗️'} 
                {' '}{type}
              </button>
            ))}
            
            {/* Price Quick Filters */}
            {[
              { label: 'Under ₹30L', icon: '💰', minPrice: 0, maxPrice: 3000000 },
              { label: '₹30L-₹1Cr', icon: '💵', minPrice: 3000000, maxPrice: 10000000 },
              { label: 'Above ₹1Cr', icon: '💎', minPrice: 10000000, maxPrice: 15000000 }
            ].map((priceRange) => (
              <button
                key={priceRange.label}
                onClick={() => {
                  const isActive = filters.minPrice === priceRange.minPrice && filters.maxPrice === priceRange.maxPrice;
                  if (isActive) {
                    handleFilterChange("minPrice", 0);
                    handleFilterChange("maxPrice", 15000000);
                  } else {
                    handleFilterChange("minPrice", priceRange.minPrice);
                    handleFilterChange("maxPrice", priceRange.maxPrice);
                  }
                  setTimeout(applyFilters, 100);
                }}
                className={`px-4 py-2 text-sm rounded-full border-2 transition-all font-medium shadow-sm ${
                  filters.minPrice === priceRange.minPrice && filters.maxPrice === priceRange.maxPrice
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                {priceRange.icon} {priceRange.label}
              </button>
            ))}

            {/* BHK Quick Filters */}
            {[
              { label: '1 BHK', icon: '🏠', beds: 1 },
              { label: '2+ BHK', icon: '🏡', beds: 2 },
              { label: '3+ BHK', icon: '🏘️', beds: 3 },
              { label: '4+ BHK', icon: '🏰', beds: 4 }
            ].map((bhkOption) => (
              <button
                key={bhkOption.label}
                onClick={() => {
                  const isActive = filters.minBeds === bhkOption.beds;
                  if (isActive) {
                    handleFilterChange("minBeds", 0);
                  } else {
                    handleFilterChange("minBeds", bhkOption.beds);
                  }
                  setTimeout(applyFilters, 100);
                }}
                className={`px-4 py-2 text-sm rounded-full border-2 transition-all font-medium shadow-sm ${
                  filters.minBeds === bhkOption.beds
                    ? 'bg-purple-500 text-white border-purple-500 shadow-md transform scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
                }`}
              >
                {bhkOption.icon} {bhkOption.label}
              </button>
            ))}
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
