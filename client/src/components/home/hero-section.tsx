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
        className="h-[600px] bg-cover bg-center transition-all duration-1000 ease-in-out transform"
        style={{
          backgroundImage: `url('${backgroundImage}')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl px-4 animate-fade-in">
            <div className="mb-6">
              <HomeIcon className="h-16 w-16 text-white mx-auto mb-4 animate-bounce" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent animate-slide-up">
              Welcome to {settings.siteName}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 font-light animate-slide-up-delay leading-relaxed">
              Discover your dream property from our premium collection of homes and commercial spaces
            </p>
            
            {/* Enhanced Search Form */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto border border-white/20">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Find Your Perfect Property</h3>
                <p className="text-gray-600">Search through thousands of verified listings</p>
              </div>
              
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Property Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <HomeIcon className="h-4 w-4 text-blue-600" />
                      I want to
                    </label>
                    <Select 
                      defaultValue="buy"
                      onValueChange={(value) => setSearchParams({...searchParams, type: value})}
                    >
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all">
                        <SelectValue placeholder="Buy or Rent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">🏠 Buy Property</SelectItem>
                        <SelectItem value="rent">🏡 Rent Property</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Search className="h-4 w-4 text-green-600" />
                      Property Type
                    </label>
                    <Select
                      onValueChange={(value) => setSearchParams({...searchParams, propertyType: value})}
                    >
                      <SelectTrigger className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm hover:shadow-md transition-all">
                        <SelectValue placeholder="Any Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">🏢 Any Property Type</SelectItem>
                        {isLoading ? (
                          <SelectItem value="" disabled>Loading property types...</SelectItem>
                        ) : propertyTypes && propertyTypes.length > 0 ? (
                          propertyTypes.map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))
                        ) : (
                          DEFAULT_PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Location Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Search className="h-4 w-4 text-purple-600" />
                    Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Enter area, district, taluka, tehsil or landmark..." 
                      className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm hover:shadow-md transition-all text-base"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Try: "Ahmednagar", "Pune", "Mumbai" or any specific area</p>
                </div>
                
                {/* Search Button */}
                <div className="pt-4">
                  <Button 
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <Search className="mr-3 h-5 w-5" /> 
                    Search Properties
                    <span className="ml-2 text-sm opacity-90">({propertyTypes?.length || DEFAULT_PROPERTY_TYPES.length}+ types available)</span>
                  </Button>
                </div>
              </form>
              
              {/* Quick Search Tags */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-3">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {['House in Ahmednagar', 'Apartment for Rent', 'Commercial Property', 'Agricultural Land', 'Villa'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        const [propertyType, location] = tag.includes('in') ? tag.split(' in ') : [tag, ''];
                        setSearchParams({
                          ...searchParams,
                          propertyType: propertyType.includes('for') ? '' : propertyType,
                          location: location || '',
                          type: tag.includes('Rent') ? 'rent' : 'buy'
                        });
                        handleSearch();
                      }}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors border border-gray-200 hover:border-blue-300"
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
