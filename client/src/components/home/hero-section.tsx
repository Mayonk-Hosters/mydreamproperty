import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Search,
  Home as HomeIcon
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PROPERTY_TYPES } from "@shared/schema";

export function HeroSection() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    type: "buy", // buy or rent
    propertyType: "", // House, Apartment, etc.
    location: "" // Location search term
  });

  const handleSearch = (e?: React.FormEvent) => {
    // Prevent form submission if called from form submit event
    if (e) e.preventDefault();
    
    // Build query string from search parameters
    const queryParams = new URLSearchParams();
    
    if (searchParams.type) {
      queryParams.set("type", searchParams.type);
    }
    
    if (searchParams.propertyType) {
      queryParams.set("propertyType", searchParams.propertyType);
    }
    
    if (searchParams.location && searchParams.location.trim() !== "") {
      queryParams.set("location", searchParams.location.trim());
    }
    
    // Navigate to properties page with search params
    setLocation(`/properties?${queryParams.toString()}`);
  };

  return (
    <section className="relative">
      <div 
        className="h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-3xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Your Dream Home</h1>
            <p className="text-xl text-white mb-8">Discover the perfect property from our extensive listings</p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-lg w-full">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <Select 
                    defaultValue="buy"
                    onValueChange={(value) => setSearchParams({...searchParams, type: value})}
                  >
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Buy, Sell or Rent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    onValueChange={(value) => setSearchParams({...searchParams, propertyType: value})}
                  >
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-grow">
                  <Input 
                    type="text" 
                    placeholder="Location" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    value={searchParams.location}
                    onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit"
                  className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-all"
                >
                  <Search className="mr-1 h-4 w-4" /> Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
