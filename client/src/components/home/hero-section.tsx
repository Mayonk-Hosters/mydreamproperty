import { useState, useEffect } from "react";
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

  // Typing animation effect
  useEffect(() => {
    const text = "Find your dream property today";
    const typingElement = document.getElementById("typing-text");
    if (!typingElement) return;

    let index = 0;
    typingElement.textContent = "";

    // Create typewriter sound effect
    const createTypewriterSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create multiple noise sources for typewriter complexity
        const bufferSize = audioContext.sampleRate * 0.15;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate pink noise for typewriter character
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(0.5, i / bufferSize * 8);
        }
        
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        
        // Main typewriter strike oscillator
        const strikeOsc = audioContext.createOscillator();
        const metalOsc = audioContext.createOscillator();
        
        // Gain nodes
        const masterGain = audioContext.createGain();
        const noiseGain = audioContext.createGain();
        const strikeGain = audioContext.createGain();
        const metalGain = audioContext.createGain();
        
        // Filters for typewriter character
        const lowPass = audioContext.createBiquadFilter();
        const highPass = audioContext.createBiquadFilter();
        
        // Connect the typewriter audio graph
        strikeOsc.connect(strikeGain);
        metalOsc.connect(metalGain);
        noiseSource.connect(noiseGain);
        
        strikeGain.connect(lowPass);
        metalGain.connect(highPass);
        noiseGain.connect(lowPass);
        
        lowPass.connect(masterGain);
        highPass.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        // Typewriter frequencies - strike and metal resonance
        strikeOsc.frequency.setValueAtTime(120 + Math.random() * 80, audioContext.currentTime);
        metalOsc.frequency.setValueAtTime(2400 + Math.random() * 800, audioContext.currentTime);
        
        strikeOsc.type = 'square';
        metalOsc.type = 'triangle';
        
        // Typewriter filters
        lowPass.type = 'lowpass';
        lowPass.frequency.setValueAtTime(1200, audioContext.currentTime);
        lowPass.Q.setValueAtTime(1, audioContext.currentTime);
        
        highPass.type = 'highpass';
        highPass.frequency.setValueAtTime(1500, audioContext.currentTime);
        highPass.Q.setValueAtTime(2, audioContext.currentTime);
        
        // Typewriter envelope - sharp attack, longer decay
        const now = audioContext.currentTime;
        
        // Strike sound
        strikeGain.gain.setValueAtTime(0, now);
        strikeGain.gain.linearRampToValueAtTime(0.08, now + 0.003);
        strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        
        // Metal ping
        metalGain.gain.setValueAtTime(0, now);
        metalGain.gain.linearRampToValueAtTime(0.02, now + 0.001);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        
        // Mechanical noise
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.03, now + 0.002);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        
        // Master volume
        masterGain.gain.setValueAtTime(0.4, now);
        
        // Start all sounds
        strikeOsc.start(now);
        metalOsc.start(now);
        noiseSource.start(now);
        
        strikeOsc.stop(now + 0.12);
        metalOsc.stop(now + 0.08);
        noiseSource.stop(now + 0.06);
        
      } catch (e) {
        console.log("Typewriter sound not supported");
      }
    };

    const typeNextChar = () => {
      if (index < text.length) {
        typingElement.textContent += text.charAt(index);
        
        // Play typewriter sound
        createTypewriterSound();
        
        index++;
        setTimeout(typeNextChar, 100); // 100ms delay between characters
      }
    };

    // Start typing after a short delay
    const timer = setTimeout(typeNextChar, 1000);
    
    return () => clearTimeout(timer);
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
            
            {/* Simple Hero Icon */}
            <div className="mb-8">
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
              <span className="typing-container">
                <span id="typing-text" className="typing-text"></span>
                <span className="typing-cursor">|</span>
              </span>
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
              
              {/* Quick Tags - Tahsils with Properties */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 justify-center">
                  {tahsilsWithProperties && tahsilsWithProperties.length > 0 ? (
                    tahsilsWithProperties.slice(0, 6).map((tahsil: any) => (
                      <button
                        key={tahsil.id}
                        onClick={() => {
                          setSearchParams({
                            ...searchParams,
                            location: tahsil.name,
                            propertyType: '',
                            type: 'buy'
                          });
                          handleSearch();
                        }}
                        className="px-3 py-1 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 rounded-full transition-all duration-200 border border-blue-200 hover:border-blue-300 shadow-sm"
                      >
                        {tahsil.name} ({tahsil.property_count})
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500">Loading locations...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
