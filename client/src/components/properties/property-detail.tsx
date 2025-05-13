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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Property Images Carousel */}
          <Carousel className="mb-6">
            <CarouselContent>
              {propertyImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="h-[400px] overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`${property.title} - Image ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          
          {/* Image Thumbnails */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {propertyImages.slice(0, 4).map((image, index) => (
              <div 
                key={index} 
                className="h-20 overflow-hidden rounded cursor-pointer border-2 hover:border-primary transition-all"
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
          
          {/* Property Details */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 flex items-center mb-4">
              <MapPin className="h-5 w-5 mr-1" /> {property.address}, {property.location}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                <Home className="h-5 w-5 mr-2 text-primary" /> 
                <span>{property.beds} Beds</span>
              </div>
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                <Droplets className="h-5 w-5 mr-2 text-primary" /> 
                <span>{property.baths} Baths</span>
              </div>
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                <Ruler className="h-5 w-5 mr-2 text-primary" /> 
                <span>{property.area} sq ft</span>
              </div>
              <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
                <Tag className="h-5 w-5 mr-2 text-primary" /> 
                <span>{formatCurrency(property.price)}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{property.description}</p>
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Property Details</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Property Type: {property.propertyType}
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Status: {property.status}
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Year Built: 2018
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Parking: 2 Spaces
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Interior Details</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Bedrooms: {property.beds}
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Bathrooms: {property.baths}
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Total Area: {property.area} sq ft
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Appliances: Included
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Interior Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Central Air Conditioning
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Heating System
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Modern Kitchen
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Hardwood Floors
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Exterior Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Backyard
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Garage
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Swimming Pool
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Garden
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="location">
                <div className="bg-gray-50 p-4 rounded-lg h-[300px] flex items-center justify-center">
                  <p className="text-gray-500">Map view would be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Contact Form and Agent Info */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Interested in this property?</h3>
            <p className="text-gray-600 mb-4">
              Send an inquiry to learn more about this property. Our agent will get back to you as soon as possible.
            </p>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">{property.title}</p>
                <p className="text-primary font-semibold">
                  {formatCurrency(property.price)}
                  {property.type === "rent" && <span className="text-sm font-normal text-gray-500">/month</span>}
                </p>
              </div>
              <Button 
                onClick={() => setIsInquiryFormOpen(true)}
                className="flex items-center"
              >
                <MessageSquare className="mr-2 h-4 w-4" /> Send Inquiry
              </Button>
            </div>
            <div className="text-gray-500 text-sm italic">
              * By submitting an inquiry, you agree to our terms of service and privacy policy.
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
                alt="Agent" 
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3" 
              />
              <h3 className="font-semibold text-lg">Jessica Williams</h3>
              <p className="text-gray-600 text-sm mb-3">Luxury Property Specialist</p>
              <div className="flex justify-center space-x-2 mb-4">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">120+ Deals</span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center">
                  4.9 <span className="text-yellow-400 ml-1">★</span>
                </span>
              </div>
              <Button variant="outline" className="w-full">
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
