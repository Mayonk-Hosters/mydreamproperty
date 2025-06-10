import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/properties/property-card";
import { Property, PropertyType } from "@shared/schema";
import { Home, Building, Hotel, Store, Castle, Crown, Filter } from "lucide-react";

export function FooterProperties() {
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("all");
  
  // Fetch property types from database
  const { data: propertyTypes, isLoading: propertyTypesLoading } = useQuery<PropertyType[]>({
    queryKey: ['/api/property-types'],
  });
  
  // Fetch all properties
  const { data: allProperties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  // Filter properties by selected type
  const filteredProperties = allProperties?.filter(property => {
    if (selectedPropertyType === "all") return true;
    return property.propertyType === selectedPropertyType;
  }) || [];
  
  // Get active property types (only those that have properties)
  const activePropertyTypes = propertyTypes?.filter(type => 
    type.active && allProperties?.some(property => property.propertyType === type.name)
  ) || [];
  
  // Icons for each property type
  const getIconForType = (type: string) => {
    switch (type) {
      case 'House':
        return <Home className="h-5 w-5 text-primary" />;
      case 'Apartment':
        return <Building className="h-5 w-5 text-primary" />;
      case 'Villa':
        return <Hotel className="h-5 w-5 text-primary" />;
      case 'Commercial':
        return <Store className="h-5 w-5 text-primary" />;
      case 'Bunglow':
      case 'Twin Bunglow':
        return <Castle className="h-5 w-5 text-primary" />;
      case 'Penthouse':
        return <Crown className="h-5 w-5 text-primary" />;
      default:
        return <Building className="h-5 w-5 text-primary" />;
    }
  };
  
  const isLoading = propertyTypesLoading || propertiesLoading;
  
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Browse Properties by Type
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Explore our diverse collection of properties filtered by type from our database
          </p>
          
          {/* Property Type Filter */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
                <SelectTrigger className="w-48 border-none shadow-none">
                  <SelectValue placeholder="Filter by Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      All Property Types
                    </div>
                  </SelectItem>
                  {activePropertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      <div className="flex items-center gap-2">
                        {getIconForType(type.name)}
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Property Type Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow animate-pulse">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            activePropertyTypes.map((type) => {
              const typeCount = allProperties?.filter(p => p.propertyType === type.name).length || 0;
              return (
                <Card 
                  key={type.id} 
                  className={`hover:shadow-lg transition-all cursor-pointer ${
                    selectedPropertyType === type.name ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPropertyType(type.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-3">
                      {getIconForType(type.name)}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{type.name}</h3>
                    <p className="text-xs text-gray-600">{typeCount} Properties</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        {/* Filtered Properties Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {selectedPropertyType === "all" 
                ? `All Properties (${filteredProperties.length})` 
                : `${selectedPropertyType} Properties (${filteredProperties.length})`
              }
            </h3>
            <Link href="/properties">
              <Button variant="outline" size="sm">
                View All Properties
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredProperties.length > 0 ? (
              filteredProperties.slice(0, 8).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedPropertyType === "all" 
                    ? "No properties are currently available."
                    : `No ${selectedPropertyType.toLowerCase()} properties are currently available.`
                  }
                </p>
                <Button variant="outline" onClick={() => setSelectedPropertyType("all")}>
                  View All Property Types
                </Button>
              </div>
            )}
          </div>
          
          {/* Show More Button */}
          {filteredProperties.length > 8 && (
            <div className="text-center mt-8">
              <Link href={`/properties${selectedPropertyType !== "all" ? `?type=${selectedPropertyType}` : ""}`}>
                <Button variant="default" size="lg">
                  View More {selectedPropertyType !== "all" ? selectedPropertyType : ""} Properties
                  <span className="ml-2">({filteredProperties.length - 8} more)</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}