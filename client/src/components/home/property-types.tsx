import { Link } from "wouter";
import { Building, Home, Store, Hotel, Castle, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_PROPERTY_TYPES, PropertyType } from "@shared/schema";

interface PropertyTypeCountResponse {
  propertyType: string;
  count: number;
}

export function PropertyTypes() {
  // Fetch property types from API
  const { data: propertyTypesData, isLoading: propertyTypesLoading } = useQuery<PropertyType[]>({
    queryKey: ['/api/property-types'],
    enabled: true,
  });
  
  // Fetch property counts by type
  const { data: countsData, isLoading: countsLoading } = useQuery<PropertyTypeCountResponse[]>({
    queryKey: ['/api/properties/counts-by-type'],
  });
  
  // Use property types from the counts data (which includes all types that have properties)
  const propertyTypes = countsData?.map(item => item.propertyType) || DEFAULT_PROPERTY_TYPES;
  const isLoading = countsLoading;

  // Icons for each property type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'House':
        return <Home className="h-6 w-6 text-primary" />;
      case 'Apartment':
        return <Building className="h-6 w-6 text-primary" />;
      case 'Villa':
        return <Hotel className="h-6 w-6 text-primary" />;
      case 'Commercial':
        return <Store className="h-6 w-6 text-primary" />;
      case 'Bunglow':
      case 'Twin Bunglow':
        return <Castle className="h-6 w-6 text-primary" />;
      case 'Penthouse':
        return <Crown className="h-6 w-6 text-primary" />;
      default:
        return <Building className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Browse By Property Type</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            // Loading placeholders
            DEFAULT_PROPERTY_TYPES.map((type, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center animate-pulse">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-200 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))
          ) : (
            // Actual property type counts
            propertyTypes.map((type) => {
              const typeData = countsData?.find(item => item.propertyType === type);
              const count = typeData?.count || 0;
              
              return (
                <Link key={type} href={`/properties?propertyType=${type}`} className="block">
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center cursor-pointer">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary-light bg-opacity-10 rounded-full mb-4">
                      {getIconForType(type)}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{type}s</h3>
                    <p className="text-gray-500 text-sm">{count} Properties</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
