import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@shared/schema";
import { PropertyPreference } from "../../server/ai-recommendation";
import { apiRequest } from "@/lib/queryClient";

type RecommendationResult = {
  property: Property;
  score: number;
  reason: string;
};

export const usePropertyRecommendations = () => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get property recommendations based on user preferences
   */
  const getRecommendations = async (preferences: PropertyPreference) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!preferences || Object.keys(preferences).length === 0) {
        throw new Error("Please provide property preferences");
      }

      const response = await apiRequest<RecommendationResult[]>(
        "POST",
        "/api/properties/recommendations",
        preferences
      );

      setRecommendations(response || []);
      return response;
    } catch (error) {
      console.error("Error getting property recommendations:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to get recommendations";
      setError(errorMsg);
      
      toast({
        title: "Recommendation Error",
        description: errorMsg,
        variant: "destructive",
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all recommendations
   */
  const clearRecommendations = () => {
    setRecommendations([]);
    setError(null);
  };

  return {
    recommendations,
    isLoading,
    error,
    getRecommendations,
    clearRecommendations,
  };
};