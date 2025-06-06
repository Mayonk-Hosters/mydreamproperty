import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Heart, MapPin, Home, Droplets, Ruler, Eye, MessageSquare, Share2 } from "lucide-react";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { PropertyModal } from "./property-modal";
import { InquiryForm } from "./inquiry-form";
import { useQuery } from "@tanstack/react-query";
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon
} from "react-share";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  
  // Fetch agent information for this property
  const { data: agent } = useQuery({
    queryKey: ['/api/agents', property.agentId],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${property.agentId}`);
      if (!response.ok) throw new Error('Failed to fetch agent');
      return response.json();
    },
    enabled: !!property.agentId,
  });
  
  // Use the first image as the main display image
  const mainImage = Array.isArray(property.images) && property.images.length > 0 
    ? property.images[0] 
    : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
  
  // Get full property URL for sharing
  const propertyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/property/${property.id}` 
    : `https://app.replit.app/property/${property.id}`;
    
  // Share title and description
  const shareTitle = `Check out this property: ${property.title}`;
  const shareDescription = `${property.beds} beds, ${property.baths} baths, ${property.area} sq ft in ${property.location} for ${formatCurrency(property.price)}`;
  
  // Click outside handler to close the share dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isShareOpen && 
          shareDropdownRef.current && 
          shareButtonRef.current && 
          !shareDropdownRef.current.contains(event.target as Node) &&
          !shareButtonRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    
    // Add click event listener to detect clicks outside the dropdown
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareOpen]);
  
  // Handler to open the quick view modal
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };
  
  // Handler to open the inquiry form
  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInquiryOpen(true);
  };
  
  // Handler to toggle share dropdown
  const handleToggleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareOpen(!isShareOpen);
  };
  
  // Handler for heart/favorites button
  const handleFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For now, just show an alert - can be replaced with actual favorites functionality
    alert('Added to favorites!');
  };
  
  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
        <div className="relative h-44 sm:h-48 overflow-hidden group">
          <img 
            src={mainImage} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy" // Add lazy loading for better mobile performance
          />
          
          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {property.featured && (
              <Badge className="bg-primary text-white text-xs">Featured</Badge>
            )}
          </div>
          

          
          {/* Overlay actions - hidden on mobile, visible on desktop hover */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-3"
          >
            <Button 
              variant="outline" 
              className="bg-white text-primary hover:bg-primary hover:text-white transition-colors text-sm"
              onClick={handleQuickView}
            >
              <Eye className="mr-2" size={15} /> Quick View
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-primary hover:bg-primary hover:text-white transition-colors text-sm"
              onClick={handleToggleShare}
            >
              <Share2 className="mr-2" size={15} /> Share
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-primary hover:bg-primary hover:text-white transition-colors text-sm"
              onClick={handleInquiry}
            >
              <MessageSquare className="mr-2" size={15} /> Inquire
            </Button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="flex justify-between mb-1 sm:mb-2">
            <span className="text-black font-bold text-sm sm:text-base">{formatCurrency(property.price)}</span>
            <span className="text-xs sm:text-sm text-gray-500">
              {property.createdAt ? formatRelativeTime(property.createdAt.toString()) : ''}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-base sm:text-lg hover:text-primary transition-colors line-clamp-1">
              <Link href={`/property/${property.id}`}>
                {property.title}
              </Link>
            </h3>
            {property.propertyNumber && (
              <Badge variant="outline" className="text-xs bg-gray-50 ml-1">
                {property.propertyNumber}
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 text-xs sm:text-sm mb-2 flex items-start line-clamp-2">
            <MapPin className="inline-block mr-1 flex-shrink-0 mt-0.5" size={12} /> 
            <span className="leading-relaxed">
              {[
                property.address,
                property.location,
                (property as any).tehsilArea,
                (property as any).tehsilName,
                (property as any).talukaName,
                (property as any).districtName,
                (property as any).stateName
              ].filter(Boolean).join(', ')}
            </span>
          </p>
          
          <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
            <span className="flex items-center">
              <Home className="mr-1 flex-shrink-0" size={12} /> {property.beds} beds
            </span>
            <span className="flex items-center">
              <Droplets className="mr-1 flex-shrink-0" size={12} /> {property.baths} baths
            </span>
            <span className="flex items-center">
              <Ruler className="mr-1 flex-shrink-0" size={12} /> {property.area} {(property as any).areaUnit === 'acres' ? 'acres' : 'sq ft'}
            </span>
          </div>
          
          {/* MahaRERA Registered Badge - Only shown for registered properties */}
          {property.maharera_registered === true && (
            <div className="mb-3 p-2 rounded-lg border border-green-200 bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="font-medium text-green-700 text-sm">MahaRERA Registered</span>
                  {property.maharera_number && (
                    <p className="text-green-600 text-xs mt-1">
                      Reg. No: {property.maharera_number}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Property Features */}
          {Array.isArray(property.features) && property.features.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1.5">
                {property.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-700">
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                    +{property.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="pt-2 sm:pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src={`https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40`} 
                alt="Agent" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                loading="lazy"
              />
              <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm">
                {agent?.name || 'Loading...'}
              </span>
            </div>
            <Link href={`/property/${property.id}`}>
              <Button 
                variant="link" 
                className="text-primary text-xs sm:text-sm font-medium hover:underline p-0 h-auto"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Property Quick View Modal */}
      <PropertyModal 
        propertyId={property.id} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      {/* Property Inquiry Form */}
      <InquiryForm
        property={property}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
    </>
  );
}
