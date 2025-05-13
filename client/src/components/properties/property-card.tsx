import { useState } from "react";
import { Link } from "wouter";
import { Heart, MapPin, Home, Droplets, Ruler, Eye, MessageSquare } from "lucide-react";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { PropertyModal } from "./property-modal";
import { InquiryForm } from "./inquiry-form";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  
  // Use the first image as the main display image
  const mainImage = Array.isArray(property.images) && property.images.length > 0 
    ? property.images[0] 
    : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
  
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
  
  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
        <div className="relative h-48 overflow-hidden group">
          <img 
            src={mainImage} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {property.featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-white">Featured</Badge>
            </div>
          )}
          {property.status === "active" && property.createdAt && 
           new Date(property.createdAt.toString()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-secondary text-white">New</Badge>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white text-primary p-1.5 rounded-full hover:bg-gray-100"
              title="Add to favorites"
            >
              <Heart size={16} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white text-primary p-1.5 rounded-full hover:bg-gray-100"
              title="Quick view"
              onClick={handleQuickView}
            >
              <Eye size={16} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="bg-white text-primary p-1.5 rounded-full hover:bg-gray-100"
              title="Inquire about this property"
              onClick={handleInquiry}
            >
              <MessageSquare size={16} />
            </Button>
          </div>
          
          {/* Overlay actions */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
          >
            <Button 
              variant="outline" 
              className="bg-white text-primary hover:bg-primary hover:text-white transition-colors"
              onClick={handleQuickView}
            >
              <Eye className="mr-2" size={16} /> Quick View
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-primary hover:bg-primary hover:text-white transition-colors"
              onClick={handleInquiry}
            >
              <MessageSquare className="mr-2" size={16} /> Inquire
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between mb-2">
            <span className="text-secondary font-semibold">{formatCurrency(property.price)}</span>
            <span className="text-sm text-gray-500">
              {property.createdAt ? formatRelativeTime(property.createdAt.toString()) : ''}
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
            <Link href={`/property/${property.id}`}>
              {property.title}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm mb-2 flex items-center">
            <MapPin className="inline-block mr-1" size={14} /> {property.location}
          </p>
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span className="flex items-center">
              <Home className="mr-1" size={14} /> {property.beds} beds
            </span>
            <span className="flex items-center">
              <Droplets className="mr-1" size={14} /> {property.baths} baths
            </span>
            <span className="flex items-center">
              <Ruler className="mr-1" size={14} /> {property.area} sq ft
            </span>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src={`https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40`} 
                alt="Agent" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="ml-2 text-sm">Agent Name</span>
            </div>
            <Link href={`/property/${property.id}`}>
              <Button variant="link" className="text-primary text-sm font-medium hover:underline">
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
