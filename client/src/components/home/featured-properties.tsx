import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/property-card";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Property } from "@shared/schema";

export function FeaturedProperties() {
  // Query all properties directly
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  // Log data to help debug
  useEffect(() => {
    if (properties) {
      console.log("Properties loaded:", properties.length);
    }
    if (error) {
      console.error("Error loading properties:", error);
    }
  }, [properties, error]);

  // Filter active properties only
  const activeProperties = properties?.filter(property => 
    property.status === 'active' || property.status === undefined
  );

  // Group properties by type for mobile slider view
  const propertiesByType = useMemo(() => {
    if (!activeProperties?.length) return {};
    
    const grouped = activeProperties.reduce((acc, property) => {
      const type = property.propertyType || 'Other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(property);
      return acc;
    }, {} as Record<string, Property[]>);
    
    // Sort by property type name for consistent ordering
    const sortedGrouped = Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, Property[]>);
    
    return sortedGrouped;
  }, [activeProperties]);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Available Properties</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all">
              <Filter className="mr-1 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all">
              <SlidersHorizontal className="mr-1 h-4 w-4" /> Sort
            </Button>
          </div>
        </div>
        
        {/* Desktop View - Grid Layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-40 mb-1" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex justify-between mb-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20 ml-2" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </div>
            ))
          ) : activeProperties && activeProperties.length > 0 ? (
            // Show all properties for desktop
            activeProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No properties found.</p>
              {error && <p className="text-red-500 mt-2">Error: {String(error)}</p>}
            </div>
          )}
        </div>

        {/* Mobile View - Property Types with Horizontal Sliders */}
        <div className="block sm:hidden">
          {isLoading ? (
            <div className="space-y-6">
              {Array(2).fill(0).map((_, index) => (
                <div key={index} className="mb-8">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-8 rounded-full" />
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex space-x-4 px-2">
                      {Array(3).fill(0).map((_, cardIndex) => (
                        <div key={cardIndex} className="w-72 flex-shrink-0">
                          <Skeleton className="h-48 w-full rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(propertiesByType).length > 0 ? (
            Object.entries(propertiesByType).map(([propertyType, typeProperties]) => (
              <div key={propertyType} className="mb-8">
                {/* Property Type Title */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-lg font-bold text-gray-800">{propertyType}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {typeProperties.length}
                  </span>
                </div>
                
                {/* Horizontal Scrollable Container with 15% next card preview */}
                <div className="overflow-x-auto overflow-y-hidden scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="flex space-x-4 pl-2 pr-16" style={{ width: 'max-content' }}>
                    {typeProperties.map((property, index) => (
                      <div 
                        key={property.id} 
                        className="flex-shrink-0 cursor-pointer transform transition-transform duration-200 hover:scale-105 scroll-snap-start"
                        style={{ 
                          width: index === typeProperties.length - 1 ? '288px' : 'calc(85vw - 32px)',
                          maxWidth: '288px'
                        }}
                        onClick={() => window.location.href = `/property/${property.id}`}
                      >
                        <PropertyCard property={property} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties found.</p>
              {error && <p className="text-red-500 mt-2">Error: {String(error)}</p>}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/properties">
            <Button variant="outline" className="px-6 py-2 border border-primary text-primary font-medium rounded hover:bg-primary hover:text-white transition-all">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
