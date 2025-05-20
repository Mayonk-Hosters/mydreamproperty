import { Property } from "@shared/schema";
import { PropertyCard } from "@/components/properties/property-card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ThumbsUp } from "lucide-react";

interface PropertyRecommendationProps {
  recommendations: Array<{
    property: Property;
    score: number;
    reason: string;
  }>;
  isLoading?: boolean;
}

export function PropertyRecommendations({ 
  recommendations, 
  isLoading = false 
}: PropertyRecommendationProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-52 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About AI Recommendations</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                These properties have been selected based on your preferences by our AI assistant. 
                Each property comes with a match score and explanation of why it might be a good fit for you.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(({ property, score, reason }) => (
          <div key={property.id} className="flex flex-col h-full">
            <div className="relative">
              <PropertyCard property={property} />
              <div className="absolute top-2 right-2">
                <Badge className="bg-primary text-white">
                  <ThumbsUp className="h-3 w-3 mr-1" /> {score}% Match
                </Badge>
              </div>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-medium text-sm text-gray-700 mb-1">Why This Property?</h3>
              <p className="text-sm text-gray-600">{reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}