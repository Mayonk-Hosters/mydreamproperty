import { useState, useEffect, useRef } from "react";
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
  SelectValue,
} from "@/components/ui/select";
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
  
  const homeIconRef = useRef<HTMLDivElement>(null);
  
  // Fetch property types from API
  const { data: propertyTypes, isLoading } = useQuery<PropertyType[]>({
    queryKey: ['/api/property-types'],
  });

  // Fetch hero background images from API
  const { data: heroImages } = useQuery<HomepageImage[]>({
    queryKey: ['/api/homepage-images'],
    select: (data) => data?.filter(img => img.imageType === 'hero' && img.isActive) || [],
  });

  // Home icon scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-home-icon-entrance');
          }
        });
      },
      { threshold: 0.3 }
    );

    if (homeIconRef.current) {
      observer.observe(homeIconRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Typing animation effect without sound
  useEffect(() => {
    const text = "Find your dream property today...";
    const typingElement = document.getElementById("typing-text");
    if (!typingElement) return;

    let index = 0;
    typingElement.textContent = "";

    const typeNextChar = () => {
      if (index < text.length) {
        typingElement.textContent += text.charAt(index);
        index++;
        setTimeout(typeNextChar, 80); // 80ms delay between characters
      }
    };

    // Start typing animation
    const timer = setTimeout(typeNextChar, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Fetch tahsils with properties for quick tags
  const { data: tahsilsWithProperties } = useQuery({
    queryKey: ['/api/tehsils-with-properties'],
    queryFn: async () => {
      const response = await fetch('/api/tehsils-with-properties');
      if (!response.ok) throw new Error('Failed to fetch tahsils');
      return response.json();
    },
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
            
            {/* Hero Icon with Scroll Animation */}
            <div ref={homeIconRef} className="mb-8 opacity-0 transform translate-y-8">
              <HomeIcon className="h-16 w-16 text-white mx-auto" />
            </div>
            
            {/* Hero Title - Large for Desktop, Optimized for Mobile */}
            <h1 className="font-extrabold mb-8">
              <div className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 md:mb-4 block font-serif font-bold tracking-wide text-white drop-shadow-2xl filter brightness-110">
                Welcome To
              </div>
              <div className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl mb-2 md:mb-4 block font-serif font-bold tracking-wide drop-shadow-2xl filter brightness-110 relative overflow-hidden">
                <span className="relative inline-block animate-gold-glow bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  My Dream Property
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent animate-gold-shimmer"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100 to-transparent w-[150%] h-full animate-gold-sweep opacity-70"></span>
                  <span className="absolute inset-0 shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-gold-pulse"></span>
                </span>
              </div>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-3xl lg:text-4xl xl:text-5xl mb-8 px-2 font-bold text-white drop-shadow-2xl filter brightness-125" style={{ fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif' }}>
              <span id="typing-text" className="border-r-2 border-white animate-blink"></span>
            </p>

            {/* Quick Location Tags */}
            {tahsilsWithProperties && tahsilsWithProperties.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                  {tahsilsWithProperties.slice(0, 6).map((tahsil: any) => (
                    <button
                      key={tahsil.id}
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, location: tahsil.name }));
                        // Auto search when clicking quick tag
                        const queryParams = new URLSearchParams();
                        queryParams.set("type", searchParams.type);
                        if (searchParams.propertyType) queryParams.set("propertyType", searchParams.propertyType);
                        queryParams.set("location", tahsil.name);
                        setLocation(`/properties?${queryParams.toString()}`);
                      }}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full border border-white/30 hover:bg-white/30 transition-all duration-200 hover:scale-105"
                    >
                      {tahsil.name} ({tahsil.propertyCount})
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl">
                
                {/* Property Type Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 rounded-xl p-1 flex">
                    <button
                      type="button"
                      onClick={() => setSearchParams(prev => ({ ...prev, type: "buy" }))}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        searchParams.type === "buy"
                          ? "bg-blue-600 text-white shadow-lg transform scale-105"
                          : "text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchParams(prev => ({ ...prev, type: "rent" }))}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        searchParams.type === "rent"
                          ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      Rent
                    </button>
                  </div>
                </div>

                {/* Search Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <Select 
                      value={searchParams.propertyType} 
                      onValueChange={(value) => setSearchParams(prev => ({ ...prev, propertyType: value }))}
                    >
                      <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-blue-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(propertyTypes || DEFAULT_PROPERTY_TYPES).map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location"
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="flex items-end">
                    <Button 
                      type="submit"
                      className={`w-full h-12 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                        searchParams.type === "buy" 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Properties
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;