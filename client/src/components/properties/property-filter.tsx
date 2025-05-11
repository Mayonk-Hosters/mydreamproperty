import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { PROPERTY_TYPES } from "@shared/schema";
import { Search, Filter, XCircle } from "lucide-react";

interface PropertyFilterProps {
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function PropertyFilter({ onFilterChange }: PropertyFilterProps) {
  const [location, setLocation] = useLocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
    
    if (filters.propertyType) {
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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filter Properties</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="h-4 w-4 mr-1" /> Filters
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetFilters}
          >
            <XCircle className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>
      </div>
      
      <div className={`space-y-4 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="type">Buy or Rent</Label>
            <Select 
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select 
              value={filters.propertyType}
              onValueChange={(value) => handleFilterChange("propertyType", value)}
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any type</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location"
              placeholder="Enter city, neighborhood..." 
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Price Range</Label>
              <span className="text-sm text-gray-500">
                {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
              </span>
            </div>
            <div className="pt-2 px-2">
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
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minBeds">Minimum Beds</Label>
              <Select 
                value={filters.minBeds.toString()}
                onValueChange={(value) => handleFilterChange("minBeds", parseInt(value))}
              >
                <SelectTrigger id="minBeds">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="minBaths">Minimum Baths</Label>
              <Select 
                value={filters.minBaths.toString()}
                onValueChange={(value) => handleFilterChange("minBaths", parseInt(value))}
              >
                <SelectTrigger id="minBaths">
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
        </div>
        
        <Button className="w-full" onClick={applyFilters}>
          <Search className="mr-2 h-4 w-4" /> Apply Filters
        </Button>
      </div>
    </div>
  );
}
