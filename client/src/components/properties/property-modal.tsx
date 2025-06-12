import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  MapPin, 
  Home, 
  Droplets, 
  Ruler, 
  Calendar,
  Tag,
  X,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { InquiryForm } from "./inquiry-form";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { getInteriorImage } from "@/lib/utils";

interface PropertyModalProps {
  propertyId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyModal({ propertyId, isOpen, onClose }: PropertyModalProps) {
  const [isInquiryFormOpen, setIsInquiryFormOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<any>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: isOpen && propertyId > 0,
  });

  // Generate property images based on available images or fallbacks
  const propertyImages = property && Array.isArray(property.images) && property.images.length > 0 
    ? property.images 
    : [0, 1, 2, 3].map(i => getInteriorImage(i));

  // Track current image index when carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="w-3/4 h-8" />
            </DialogTitle>
            <DialogDescription>Loading property details...</DialogDescription>
            <DialogClose onClick={onClose} />
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="w-full h-[300px] rounded-lg" />
            <div>
              <Skeleton className="w-1/2 h-8 mb-3" />
              <Skeleton className="w-3/4 h-5 mb-4" />
              <div className="flex space-x-4 mb-4">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
              </div>
              <Skeleton className="w-full h-24 mb-4" />
              <Skeleton className="w-3/4 h-10" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !property) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Property</DialogTitle>
            <DialogDescription>Unable to retrieve property information at this time.</DialogDescription>
            <DialogClose onClick={onClose} />
          </DialogHeader>
          <p className="text-red-500">There was an error loading the property details.</p>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-2xl font-bold">{property.title}</DialogTitle>
              <DialogDescription className="sr-only">
                Property details for {property.title} located at {property.address}, {property.location}
              </DialogDescription>
              {property.propertyNumber && (
                <div className="text-sm font-medium text-primary mt-1">
                  {property.propertyNumber}
                </div>
              )}
            </div>
            <DialogClose onClick={onClose} />
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Images */}
            <div>
              <Carousel className="mb-4" setApi={setCarouselApi}>
                <CarouselContent>
                  {propertyImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square overflow-hidden rounded-lg">
                        <img 
                          src={image} 
                          alt={`${property.title} - Image ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-1" />
                <CarouselNext className="right-1" />
              </Carousel>

              {/* Image Thumbnails - Show all with click functionality */}
              <div className="grid grid-cols-4 gap-2">
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
                    />
                  </div>
                ))}
              </div>
              {propertyImages.length > 4 && (
                <div className="text-center mt-2 text-xs text-gray-500">
                  {propertyImages.length} images total
                </div>
              )}
            </div>

            {/* Property Details */}
            <div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                {formatCurrency(property.price)}
                {property.type === "rent" && <span className="text-sm font-normal text-gray-500">/month</span>}
              </h3>

              <p className="text-gray-600 flex items-center mb-4">
                <MapPin className="h-5 w-5 mr-1" /> {property.address}, {property.location}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md">
                  <Home className="h-5 w-5 text-primary" /> 
                  <span className="mt-1 text-sm font-medium">{property.beds} Beds</span>
                </div>
                <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md">
                  <Droplets className="h-5 w-5 text-primary" /> 
                  <span className="mt-1 text-sm font-medium">{property.baths} Baths</span>
                </div>
                <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md">
                  <Ruler className="h-5 w-5 text-primary" /> 
                  <span className="mt-1 text-sm font-medium">{property.area} {(property as any).areaUnit === 'acres' ? 'acres' : 'sq ft'}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-1">Property Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-primary" /> Type: {property.propertyType}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-primary" /> Status: {property.status}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-gray-700 text-sm">
                  {property.description.length > 200 
                    ? `${property.description.substring(0, 200)}...` 
                    : property.description}
                </p>
              </div>

              <div className="flex justify-between mt-2">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex items-center"
                >
                  <X className="mr-1 h-4 w-4" /> Close
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex items-center"
                    onClick={() => setIsInquiryFormOpen(true)}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" /> Inquire
                  </Button>
                  <Link href={`/property/${property.id}`}>
                    <Button className="flex items-center">
                      View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Inquiry Form */}
      {property && (
        <InquiryForm
          property={property}
          isOpen={isInquiryFormOpen}
          onClose={() => setIsInquiryFormOpen(false)}
        />
      )}
    </>
  );
}