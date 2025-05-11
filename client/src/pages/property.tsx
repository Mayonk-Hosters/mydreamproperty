import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/common/layout";
import { PropertyDetail } from "@/components/properties/property-detail";
import { Property } from "@shared/schema";

export default function PropertyPage() {
  const [match, params] = useRoute("/property/:id");
  const propertyId = match ? parseInt(params.id) : 0;
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: propertyId > 0,
  });
  
  // Handle incorrect URLs
  useEffect(() => {
    if (!match || isNaN(propertyId) || propertyId <= 0) {
      // Redirect to properties page for invalid property IDs
      window.location.href = "/properties";
    }
  }, [match, propertyId]);

  return (
    <Layout>
      <Helmet>
        <title>
          {isLoading 
            ? "Loading Property..." 
            : property 
              ? `${property.title} | ${property.location} | RealEstate Pro` 
              : "Property Not Found"}
        </title>
        {property && (
          <>
            <meta name="description" content={`${property.title} - ${property.beds} bed, ${property.baths} bath, ${property.area} sq ft ${property.propertyType.toLowerCase()} for ${property.status === 'active' ? 'sale' : property.status} in ${property.location}. ${property.description.substring(0, 120)}...`} />
            <meta property="og:title" content={`${property.title} | ${property.location}`} />
            <meta property="og:description" content={`${property.beds} bed, ${property.baths} bath, ${property.area} sq ft ${property.propertyType.toLowerCase()} for ${property.status === 'active' ? 'sale' : property.status}`} />
            <meta property="og:type" content="website" />
            {property.images && property.images.length > 0 && (
              <meta property="og:image" content={property.images[0]} />
            )}
          </>
        )}
      </Helmet>
      
      {match && propertyId > 0 && (
        <PropertyDetail propertyId={propertyId} />
      )}
    </Layout>
  );
}
