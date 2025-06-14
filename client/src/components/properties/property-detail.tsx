import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { 
  MapPin, 
  Home, 
  Droplets, 
  Ruler, 
  Heart, 
  Share2,
  Calendar,
  Tag,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  Star
} from "lucide-react";
import { InquiryForm } from "./inquiry-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import { Property } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { getInteriorImage } from "@/lib/utils";
import { ShareButtons } from "@/components/ui/share-buttons-fixed";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PropertyDetailProps {
  propertyId: number;
}

export function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const [selectedTab, setSelectedTab] = useState("details");
  const [isInquiryFormOpen, setIsInquiryFormOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [userRating, setUserRating] = useState(0);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I'm interested in this property. Please contact me."
  });

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
  });
  
  // Fetch agent data when we have a property with an agentId
  const { data: agent } = useQuery({
    queryKey: [`/api/agents/${property?.agentId}`],
    queryFn: async () => {
      if (!property?.agentId) return null;
      const response = await fetch(`/api/agents/${property.agentId}`);
      if (!response.ok) throw new Error('Failed to fetch agent');
      return response.json();
    },
    enabled: !!property?.agentId,
    staleTime: 0, // Always refetch agent data
  });

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!agent?.id) throw new Error('No agent selected');
      
      return apiRequest(`/api/agents/${agent.id}/rate`, 'POST', {
        rating,
        userEmail: 'anonymous@user.com' // For anonymous ratings
      });
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this Real Estate Consultant!",
      });
      // Invalidate agent data to refetch updated rating
      queryClient.invalidateQueries({ queryKey: [`/api/agents/${agent?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Check if property is in favorites on load
  useEffect(() => {
    if (propertyId) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(propertyId));
    }
  }, [propertyId]);

  // Track current image index when carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);
  
  // Toggle favorite status
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter((id: number) => id !== propertyId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      toast({
        title: "Removed from favorites",
        description: "This property has been removed from your favorites",
      });
    } else {
      // Add to favorites
      if (!favorites.includes(propertyId)) {
        localStorage.setItem('favorites', JSON.stringify([...favorites, propertyId]));
        toast({
          title: "Added to favorites",
          description: "This property has been added to your favorites",
        });
      }
    }
    
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full h-[400px] rounded-lg mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-full h-20 rounded" />
              ))}
            </div>
            <div className="mt-6">
              <Skeleton className="w-3/4 h-10 mb-2" />
              <Skeleton className="w-1/2 h-6 mb-6" />
              <div className="flex space-x-4 mb-6">
                <Skeleton className="w-24 h-8" />
                <Skeleton className="w-24 h-8" />
                <Skeleton className="w-24 h-8" />
              </div>
              <Skeleton className="w-full h-40" />
            </div>
          </div>
          <div>
            <Skeleton className="w-full h-[450px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Property</h2>
        <p className="text-gray-600">
          There was an error loading the property details. Please try again later.
        </p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // Generate additional interior images for the property
  const propertyImages = Array.isArray(property.images) && property.images.length > 0 
    ? property.images 
    : [0, 1, 2, 3].map(i => getInteriorImage(i));

  // No need for the handleContactFormChange and handleContactFormSubmit 
  // functions as we'll be using the InquiryForm component instead

  // Get current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const ogImageUrl = `/api/og-image?id=${propertyId}`;
  const description = `${property.type === 'sale' ? 'Buy' : 'Rent'} this ${property.propertyType} in ${property.location}. ${property.beds} beds, ${property.baths} baths, ${property.area} sqft. Price: ${formatCurrency(property.price)}`;

  return (
    <>
      <Helmet>
        <title>{property.title} - My Dream Property</title>
        <meta name="description" content={description} />
        
        {/* Open Graph meta tags for social sharing */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={property.title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="My Dream Property" />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={property.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Additional meta tags */}
        <meta name="keywords" content={`${property.propertyType}, ${property.location}, ${property.type === 'sale' ? 'buy' : 'rent'}, real estate, Maharashtra, property`} />
      </Helmet>
    
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          {/* Property Images Carousel */}
          <Carousel className="mb-4 sm:mb-6" setApi={setCarouselApi}>
            <CarouselContent>
              {propertyImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="h-[250px] sm:h-[300px] md:aspect-square md:h-auto overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`${property.title} - Image ${index + 1}`} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 w-8 h-8 sm:w-10 sm:h-10" />
            <CarouselNext className="right-2 w-8 h-8 sm:w-10 sm:h-10" />
          </Carousel>
          
          {/* Image Thumbnails - Show all images */}
          <div className="hidden sm:block mb-6">
            <div className="grid grid-cols-6 gap-2">
              {propertyImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`aspect-square overflow-hidden rounded cursor-pointer border-2 transition-all hover:border-primary ${
                    index === currentImageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    if (carouselApi) {
                      carouselApi.scrollTo(index);
                      setCurrentImageIndex(index);
                    }
                  }}
                >
                  <img 
                    src={image} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            {propertyImages.length > 6 && (
              <div className="text-center mt-2 text-sm text-gray-500">
                {propertyImages.length} images total
              </div>
            )}
          </div>
          
          {/* Price Display - Highlighted Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{formatCurrency(property.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Property Type</p>
                <p className="text-lg font-semibold text-gray-800">{property.propertyType}</p>
              </div>
            </div>
            {property.type && (
              <div className="mt-2">
                <span className="inline-block bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                  For {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile Property Header */}
          <div className="block lg:hidden bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-2">
              <div className="flex items-center bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded">
                <Tag className="h-3.5 w-3.5 mr-1" /> 
                <span>{formatCurrency(property.price)}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`h-8 w-8 ${isFavorite ? 'bg-red-50 text-red-500 hover:text-red-500 hover:bg-red-50' : ''}`}
                  onClick={toggleFavorite}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="end">
                    <div className="text-sm font-medium mb-2">Share this property</div>
                    <ShareButtons 
                      url={`/property/${property.id}`}
                      title={`${property.title} | My Dream Property`}
                      description={`${property.beds} bed, ${property.baths} bath ${property.propertyType} for ${property.type} at ${formatCurrency(property.price)} in ${property.location}`}
                      iconSize={28}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button 
              className="w-full text-sm h-9 mt-2"
              onClick={() => setIsInquiryFormOpen(true)}
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Contact Agent
            </Button>
          </div>
          
          {/* Property Details */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{property.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {property.propertyNumber && (
                    <div className="inline-block bg-primary/10 text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-md">
                      Property ID: {property.propertyNumber}
                    </div>
                  )}
                  {(property as any).maharera_registered && (
                    <div className="inline-block bg-green-100 text-green-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-md">
                      MahaRERA Registered
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden lg:flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className={`${isFavorite ? 'bg-red-50 text-red-500 hover:text-red-500 hover:bg-red-50' : ''}`}
                  onClick={toggleFavorite}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="end">
                    <div className="text-sm font-medium mb-3">Share this property</div>
                    <ShareButtons 
                      url={`/property/${property.id}`}
                      title={`${property.title} | My Dream Property`}
                      description={`${property.beds} bed, ${property.baths} bath ${property.propertyType} for ${property.type} at ${formatCurrency(property.price)} in ${property.location}`}
                      iconSize={32}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm sm:text-base flex items-center mt-2 sm:mt-4 mb-3 sm:mb-4">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1 flex-shrink-0" /> 
              <span>
                {property.address}
                {property.location && `, ${property.location}`}
                {(property as any).tehsilArea && `, ${(property as any).tehsilArea}`}
                {(property as any).tehsilName && `, ${(property as any).tehsilName}`}
                {(property as any).talukaName && `, ${(property as any).talukaName}`}
                {(property as any).districtName && `, ${(property as any).districtName}`}
                {(property as any).stateName && `, ${(property as any).stateName}`}
              </span>
            </p>
            
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary flex-shrink-0" /> 
                <span>{property.beds} Beds</span>
              </div>
              <div className="flex items-center bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base">
                <Droplets className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary flex-shrink-0" /> 
                <span>{property.baths} Baths</span>
              </div>
              <div className="flex items-center bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base">
                <Ruler className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary flex-shrink-0" /> 
                <span>{property.area} {(property as any).areaUnit === 'acres' ? 'acres' : 'sq ft'}</span>
              </div>
              <div className="hidden lg:flex items-center bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-primary flex-shrink-0" /> 
                <span>{formatCurrency(property.price)}</span>
              </div>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 text-sm sm:text-base">{property.description}</p>
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6 sm:mb-8">
              <TabsList className="grid grid-cols-3 w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-lg border border-blue-200">
                <TabsTrigger value="details" className="text-xs sm:text-sm py-2 px-2 sm:px-3 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-blue-100 text-blue-700">Details</TabsTrigger>
                <TabsTrigger value="features" className="text-xs sm:text-sm py-2 px-2 sm:px-3 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-100 text-emerald-700">Features</TabsTrigger>
                <TabsTrigger value="agent" className="text-xs sm:text-sm py-2 px-2 sm:px-3 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-amber-100 text-amber-700">Real Estate Consultant</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm sm:text-base mb-2">Property Details</h3>
                      <ul className="space-y-1.5 sm:space-y-2">
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Property Type: {property.propertyType}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Transaction Type: {property.type === 'buy' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : property.type}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Status: {property.status}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Beds: {property.beds}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Baths: {property.baths}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Area: {property.area} {(property as any).areaUnit === 'acres' ? 'acres' : 'sq ft'}</span>
                        </li>
                        {property.yearBuilt !== undefined && property.yearBuilt !== null && (
                          <li className="flex items-center text-xs sm:text-sm">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                            <span>Year Built: {property.yearBuilt}</span>
                          </li>
                        )}
                        {property.parking !== undefined && property.parking !== null && (
                          <li className="flex items-center text-xs sm:text-sm">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                            <span>Parking: {property.parking} {property.parking === 1 ? 'Space' : 'Spaces'}</span>
                          </li>
                        )}
                        {property.propertyNumber && (
                          <li className="flex items-center text-xs sm:text-sm">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                            <span>Property ID: {property.propertyNumber}</span>
                          </li>
                        )}
                        {(property as any).maharera_registered && (
                          <li className="flex items-center text-xs sm:text-sm">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                            <span>MahaRERA Registered</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm sm:text-base mb-2">Additional Information</h3>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {property.agentId && (
                          <li className="flex items-center text-xs sm:text-sm">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                            <span>Contact Agent</span>
                          </li>
                        )}
                        {property.featured && (
                          <li className="flex items-center text-xs sm:text-sm">
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                            <span>Featured Property</span>
                          </li>
                        )}

                      </ul>
                    </div>

                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  {/* Display property features */}
                  {property.features && 
                   ((Array.isArray(property.features) && property.features.length > 0) || 
                    (typeof property.features === 'string' && property.features.length > 0)) ? (
                    <div>
                      <h3 className="font-medium text-sm sm:text-base mb-3">Property Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(property.features) ? property.features : 
                           (typeof property.features === 'string' ? 
                             JSON.parse(property.features) : [])).map((feature: any, index: number) => (
                          <div key={index} className="flex items-center bg-white border border-gray-200 px-3 py-2 rounded-md text-xs sm:text-sm">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No specific features have been added for this property.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Agent Tab */}
              <TabsContent value="agent">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  {property?.agentId ? (
                    <div className="flex flex-col items-center sm:flex-row sm:items-start">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-full mb-3 sm:mb-0 sm:mr-4 bg-gray-200 flex-shrink-0">
                        {agent?.image ? (
                          <img 
                            src={agent.image}
                            alt={agent.name || "Agent"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <img 
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256"
                            alt="Agent"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-base sm:text-lg">
                          {agent?.name ? agent.name : "Property Consultant"}
                        </h3>
                        <p className="text-primary font-medium text-sm">
                          {agent?.title ? agent.title : "Real Estate Consultant"}
                        </p>
                        {agent?.contactNumber && (
                          <p className="text-gray-700 text-sm mt-2">
                            Contact: {agent.contactNumber}
                          </p>
                        )}
                        {agent?.email && (
                          <p className="text-gray-700 text-sm">
                            Email: {agent.email}
                          </p>
                        )}
                        {agent?.deals && (
                          <p className="text-gray-700 text-sm">
                            Deals Closed: {agent.deals}
                          </p>
                        )}
                        {agent?.rating && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-700 text-sm">Rating:</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(agent.rating) 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-gray-600 text-sm ml-1">
                                ({agent.rating.toFixed(1)}/5)
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Rating Section */}
                        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                          <h4 className="font-medium text-sm mb-2">Rate this Consultant</h4>
                          <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                className="p-1 hover:scale-110 transition-transform disabled:opacity-50"
                                disabled={ratingMutation.isPending}
                                onClick={() => {
                                  setUserRating(star);
                                  ratingMutation.mutate(star);
                                }}
                                onMouseEnter={() => setUserRating(star)}
                                onMouseLeave={() => setUserRating(0)}
                              >
                                <Star 
                                  className={`h-5 w-5 cursor-pointer transition-colors ${
                                    star <= userRating 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300 hover:text-yellow-400'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {ratingMutation.isPending 
                              ? 'Submitting your rating...' 
                              : 'Click on a star to rate this consultant\'s service'
                            }
                          </p>
                        </div>
                        
                        <p className="text-gray-600 text-sm sm:text-base my-3">
                          Our property expert will guide you through every step of your real estate journey.
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setIsInquiryFormOpen(true)}
                          >
                            Contact Agent
                          </Button>
                          <Button
                            size="sm"
                          >
                            View Listings
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No agent information available for this property.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right Sidebar - Property Summary */}
        <div className="lg:col-span-1">
          {/* Property Overview Card */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 mb-4">
            {/* Property Header */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {property.propertyNumber && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                        ID: {property.propertyNumber}
                      </span>
                    )}
                    {(property as any).maharera_registered && (
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md font-medium">
                        MahaRERA Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="h-8 w-8"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <ShareButtons
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        title={property.title}
                        description={`${property.beds} bed, ${property.baths} bath, ${property.area} sq ft ${property.propertyType.toLowerCase()} for ${property.type} at ${formatCurrency(property.price)} in ${property.location}`}
                        iconSize={32}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(property.price)}</p>
                  {property.type === "rent" && <span className="text-sm text-gray-500">/month</span>}
                </div>
                <div className="text-right">
                  <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                    For {property.type?.charAt(0).toUpperCase() + property.type?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Home className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Bedrooms</p>
                <p className="font-semibold text-gray-900">{property.beds}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Droplets className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Bathrooms</p>
                <p className="font-semibold text-gray-900">{property.baths}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Ruler className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Area</p>
                <p className="font-semibold text-gray-900">{property.area} {(property as any).areaUnit === 'acres' ? 'acres' : 'sq ft'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Tag className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Type</p>
                <p className="font-semibold text-gray-900 text-xs">{property.propertyType}</p>
              </div>
            </div>

            {/* Property Description */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{property.description}</p>
            </div>

            {/* Key Features */}
            {property.features && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(property.features) ? property.features : 
                     (typeof property.features === 'string' ? 
                       JSON.parse(property.features) : [])).slice(0, 4).map((feature: any, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}


          </div>

          {/* Quick Stats Card */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{property.status}</span>
              </div>
              {property.yearBuilt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Year Built</span>
                  <span className="text-sm font-medium text-gray-900">{property.yearBuilt}</span>
                </div>
              )}
              {property.parking && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Parking</span>
                  <span className="text-sm font-medium text-gray-900">{property.parking} spaces</span>
                </div>
              )}
              {property.featured && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Featured</span>
                  <span className="text-sm font-medium text-green-600">Yes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interested in Property Section - Moved Down with Attractive Design */}
      <div className="mt-8 mb-6">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/60 rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              💙 Interested in This Property?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get in touch with our friendly property experts! We're here to help you find your dream home.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">{property.title}</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(property.price)}
                {property.type === "rent" && <span className="text-lg font-normal text-gray-500">/month</span>}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                📍 {property.location}
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">✨ Why Choose Us?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>🏠 Expert property guidance</li>
                <li>⚡ Quick response time</li>
                <li>🤝 Personalized service</li>
                <li>📞 24/7 support available</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => setIsInquiryFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <MessageSquare className="mr-3 h-5 w-5" /> 
              Send Inquiry Now
            </Button>
            <p className="text-gray-500 text-xs mt-3 italic">
              💝 Free consultation • No hidden fees • Trusted by thousands
            </p>
          </div>
        </div>
      </div>



      {/* Property Inquiry Form */}
      {property && (
        <InquiryForm
          property={property}
          isOpen={isInquiryFormOpen}
          onClose={() => setIsInquiryFormOpen(false)}
        />
      )}
    </div>
    </>
  );
}
