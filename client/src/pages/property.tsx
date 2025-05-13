import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/common/layout";
import { PageTitle } from "@/components/common/page-title";
import { PropertyDetail } from "@/components/properties/property-detail";
import { Property } from "@shared/schema";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function PropertyPage() {
  const [match, params] = useRoute("/property/:id");
  const propertyId = match ? parseInt(params.id) : 0;
  const { settings } = useSiteSettings();
  
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

  // Create page title based on property data
  const pageTitle = isLoading 
    ? "Loading Property..." 
    : property 
      ? `${property.title} | ${property.location} | ${settings.siteName}` 
      : "Property Not Found";

  return (
    <Layout>
      <PageTitle title={pageTitle} />
      
      {/* Add metadata with Helmet */}
      {property && (
        <Helmet>
          <meta name="description" content={`${property.title} - ${property.beds} bed, ${property.baths} bath, ${property.area} sq ft ${property.propertyType.toLowerCase()} for ${property.status === 'active' ? 'sale' : property.status} in ${property.location}. ${property.description.substring(0, 120)}...`} />
          <meta property="og:title" content={`${property.title} | ${property.location}`} />
          <meta property="og:description" content={`${property.beds} bed, ${property.baths} bath, ${property.area} sq ft ${property.propertyType.toLowerCase()} for ${property.status === 'active' ? 'sale' : property.status}`} />
          <meta property="og:type" content="website" />
          {property.images && Array.isArray(property.images) && property.images.length > 0 && (
            <meta property="og:image" content={String(property.images[0])} />
          )}
        </Helmet>
      )}
      
      {match && propertyId > 0 && (
        <PropertyDetail propertyId={propertyId} />
      )}
    </Layout>
  );
}
