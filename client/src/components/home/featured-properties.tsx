import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/property-card";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Property } from "@shared/schema";

export function FeaturedProperties() {
  // Show all properties on homepage instead of just featured ones
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">All Properties</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all">
              <Filter className="mr-1 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all">
              <SlidersHorizontal className="mr-1 h-4 w-4" /> Sort
            </Button>
          </div>
        </div>
        
        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          ) : properties && properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No featured properties found.</p>
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
