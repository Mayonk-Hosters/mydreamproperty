import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  MessageSquare
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
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I'm interested in this property. Please contact me."
  });

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
  });

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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          {/* Property Images Carousel */}
          <Carousel className="mb-4 sm:mb-6">
            <CarouselContent>
              {propertyImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="h-[250px] sm:h-[300px] md:h-[400px] overflow-hidden rounded-lg">
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
          
          {/* Image Thumbnails - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-4 gap-2 mb-6">
            {propertyImages.slice(0, 4).map((image, index) => (
              <div 
                key={index} 
                className="h-16 sm:h-20 overflow-hidden rounded cursor-pointer border-2 hover:border-primary transition-all"
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
          
          {/* Mobile Property Header */}
          <div className="block lg:hidden bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between mb-2">
              <div className="flex items-center bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded">
                <Tag className="h-3.5 w-3.5 mr-1" /> 
                <span>{formatCurrency(property.price)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Heart className="h-4 w-4" />
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
                {property.propertyNumber && (
                  <div className="inline-block bg-primary/10 text-primary text-xs sm:text-sm font-medium px-2 sm:px-3 py-0.5 sm:py-1 rounded-md mt-2">
                    Property ID: {property.propertyNumber}
                  </div>
                )}
              </div>
              <div className="hidden lg:flex space-x-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <span>{property.address}, {property.location}</span>
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
                <span>{property.area} sq ft</span>
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
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="details" className="text-xs sm:text-sm py-1.5 px-1 sm:px-2">Details</TabsTrigger>
                <TabsTrigger value="features" className="text-xs sm:text-sm py-1.5 px-1 sm:px-2">Features</TabsTrigger>
                <TabsTrigger value="location" className="text-xs sm:text-sm py-1.5 px-1 sm:px-2">Location</TabsTrigger>
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
                          <span>Status: {property.status}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Year Built: {property.yearBuilt || 'Not specified'}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Parking: 2 Spaces</span>
                        </li>
                      </ul>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <h3 className="font-medium text-sm sm:text-base mb-2">Interior Details</h3>
                      <ul className="space-y-1.5 sm:space-y-2">
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Bedrooms: {property.beds}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Bathrooms: {property.baths}</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Total Area: {property.area} sq ft</span>
                        </li>
                        <li className="flex items-center text-xs sm:text-sm">
                          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary flex-shrink-0" /> 
                          <span>Appliances: Included</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  {/* Display property features */}
                  {Array.isArray(property.features) && property.features.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-sm sm:text-base mb-3">Property Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature, index) => (
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
              <TabsContent value="location">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg h-[250px] sm:h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Property Location</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">
                      {property.address}, {property.location}
                    </p>
                    <Button variant="outline" size="sm" className="text-sm">View on Maps</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Contact Form and Agent Info */}
        <div>
          <div className="bg-white shadow-sm sm:shadow-md rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Interested in this property?</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
              Send an inquiry to learn more about this property. Our agent will get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
              <div>
                <p className="font-medium text-sm sm:text-base">{property.title}</p>
                <p className="text-primary font-semibold">
                  {formatCurrency(property.price)}
                  {property.type === "rent" && <span className="text-sm font-normal text-gray-500">/month</span>}
                </p>
              </div>
              <Button 
                onClick={() => setIsInquiryFormOpen(true)}
                className="flex items-center mt-3 sm:mt-0 text-sm h-9 sm:h-10"
              >
                <MessageSquare className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Send Inquiry
              </Button>
            </div>
            <div className="text-gray-500 text-xs sm:text-sm italic">
              * By submitting an inquiry, you agree to our terms of service and privacy policy.
            </div>
          </div>
          
          <div className="bg-white shadow-sm sm:shadow-md rounded-lg p-4 sm:p-6">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                alt="Agent" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-2 sm:mb-3"
                loading="lazy"
              />
              <h3 className="font-semibold text-base sm:text-lg">Jessica Williams</h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">Luxury Property Specialist</p>
              <div className="flex justify-center space-x-2 mb-3 sm:mb-4">
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 rounded-full text-xs">120+ Deals</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 rounded-full text-xs flex items-center">
                  4.9 <span className="text-yellow-400 ml-1">★</span>
                </span>
              </div>
              <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-10">
                View Agent Profile
              </Button>
            </div>
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
  );
}
