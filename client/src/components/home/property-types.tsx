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
  // Show all property types that actually have properties in the database
  const propertyTypes = countsData?.map(item => item.propertyType) || [];
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
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Browse By Property Type
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your perfect property from our diverse collection of residential and commercial spaces
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading placeholders - show 8 placeholder items to accommodate all possible property types
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center animate-pulse">
                <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gray-200 rounded-full mb-6"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))
          ) : (
            // Actual property type counts
            propertyTypes.map((type, index) => {
              const typeData = countsData?.find(item => item.propertyType === type);
              const count = typeData?.count || 0;
              
              return (
                <Link key={type} href={`/properties?propertyType=${type}`} className="block">
                  <div className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center cursor-pointer transform hover:scale-105 hover:-translate-y-2 animate-slide-up group ${
                    index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'
                  }`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="mx-auto w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300 animate-float">
                      <div className="scale-125 group-hover:scale-150 transition-transform duration-300">
                        {getIconForType(type)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                      {type}s
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">
                      {count} Properties Available
                    </p>
                    <div className="mt-4 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 mx-auto"></div>
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
