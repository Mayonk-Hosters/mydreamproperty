import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { useSiteSettings } from "@/hooks/use-site-settings";
import { DEFAULT_PROPERTY_TYPES, PropertyType, HomepageImage } from "@shared/schema";

export function HeroSection() {
  const [, setLocation] = useLocation();
  const { settings } = useSiteSettings();
  const [searchParams, setSearchParams] = useState({
    type: "buy", // buy or rent
    propertyType: "", // House, Apartment, etc.
    location: "" // Location search term
  });
  
  // Fetch property types from API
  const { data: propertyTypes, isLoading } = useQuery<PropertyType[]>({
    queryKey: ['/api/property-types'],
  });

  // Fetch hero background images from API
  const { data: heroImages } = useQuery<HomepageImage[]>({
    queryKey: ['/api/homepage-images'],
    select: (data) => data?.filter(img => img.imageType === 'hero' && img.isActive) || [],
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

  // Get the first active hero image or fallback
  const backgroundImage = heroImages && heroImages.length > 0 
    ? heroImages[0].imageUrl 
    : "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800";

  return (
    <section className="relative overflow-hidden">
      <div 
        className="min-h-[500px] sm:h-[600px] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('${backgroundImage}')`
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 h-full flex items-center justify-center px-4 py-8">
          <div className="text-center w-full">
            
            {/* Simple Hero Icon */}
            <div className="mb-8">
              <HomeIcon className="h-16 w-16 text-white mx-auto" />
            </div>
            
            {/* Hero Title - Large for Desktop, Optimized for Mobile */}
            <h1 className="text-white font-bold mb-8">
              <div className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 md:mb-4 block font-bold tracking-wide">
                Welcome To
              </div>
              <div className="text-2xl md:text-6xl lg:text-7xl xl:text-8xl font-black block tracking-wider">
                My Dream Property
              </div>
            </h1>
            
            {/* Subtitle */}
            <p className="text-white text-lg md:text-2xl lg:text-3xl xl:text-4xl mb-8 opacity-90 px-2 font-medium">
              Find your dream property today
            </p>
            
            {/* Compact Search Form */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl w-full max-w-4xl mx-auto border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Find Your Perfect Property</h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Compact Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select 
                    defaultValue="buy"
                    onValueChange={(value) => setSearchParams({...searchParams, type: value})}
                  >
                    <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="Buy/Rent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">🏠 Buy</SelectItem>
                      <SelectItem value="rent">🏡 Rent</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    onValueChange={(value) => setSearchParams({...searchParams, propertyType: value})}
                  >
                    <SelectTrigger className="h-11 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Type</SelectItem>
                      {isLoading ? (
                        <SelectItem value="" disabled>Loading...</SelectItem>
                      ) : propertyTypes && propertyTypes.length > 0 ? (
                        propertyTypes.map((type) => (
                          <SelectItem key={`db-${type.id}`} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))
                      ) : (
                        DEFAULT_PROPERTY_TYPES.map((type, index) => (
                          <SelectItem key={`default-${index}`} value={type}>
                            {type}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Location..." 
                      className="pl-10 h-11 border-2 border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <Search className="mr-1 h-4 w-4" /> 
                    Search
                  </Button>
                </div>
              </form>
              
              {/* Quick Tags */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 justify-center">
                  {['House Ahmednagar', 'Rent Apartment', 'Commercial', 'Agricultural'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        const [propertyType, location] = tag.includes('Ahmednagar') ? tag.split(' ') : [tag, ''];
                        setSearchParams({
                          ...searchParams,
                          propertyType: propertyType.includes('Rent') ? '' : propertyType,
                          location: location || '',
                          type: tag.includes('Rent') ? 'rent' : 'buy'
                        });
                        handleSearch();
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-full transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
