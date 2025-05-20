import { useState } from "react";
import { Helmet } from "react-helmet";
import { PageLayout } from "@/components/common/page-layout";
import { PropertyRecommendationForm } from "@/components/home/property-recommendation-form";
import { PropertyRecommendations } from "@/components/home/property-recommendations";
import { usePropertyRecommendations } from "@/hooks/use-property-recommendations";
import { RecommendationResult, PropertyPreference } from "@shared/types/recommendation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function PropertyFinderPage() {
  const { 
    recommendations, 
    isLoading, 
    getRecommendations, 
    clearRecommendations 
  } = usePropertyRecommendations();
  
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleGetRecommendations = async (preferences: PropertyPreference) => {
    setFormSubmitted(true);
    await getRecommendations(preferences);
  };

  const handleReset = () => {
    clearRecommendations();
    setFormSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageLayout>
      <Helmet>
        <title>AI Property Finder | My Dream Property</title>
        <meta 
          name="description" 
          content="Find your dream property with our AI-powered recommendation engine. Tell us your preferences and we'll match you with the perfect properties."
        />
      </Helmet>
      
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Find Your Dream Property</h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-lg text-gray-600">AI-Powered Property Recommendations</p>
          </div>
          <p className="max-w-2xl mx-auto text-gray-600">
            Tell us about your preferences and our AI will analyze all available properties 
            to find the perfect matches for you. The more details you provide, the better 
            our recommendations will be.
          </p>
        </div>
        
        {!formSubmitted ? (
          <div className="max-w-4xl mx-auto">
            <PropertyRecommendationForm
              onSubmit={handleGetRecommendations}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Personalized Recommendations</h2>
              <Button onClick={handleReset} variant="outline">
                Start Over
              </Button>
            </div>
            
            <PropertyRecommendations
              recommendations={recommendations}
              isLoading={isLoading}
            />
            
            {recommendations.length === 0 && !isLoading && (
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 text-center">
                <h3 className="text-xl font-medium text-yellow-800 mb-2">No Matching Properties Found</h3>
                <p className="text-yellow-700 mb-4">
                  We couldn't find properties that match your specific criteria. 
                  Please try adjusting your preferences or check back later as new properties are added regularly.
                </p>
                <Button onClick={handleReset} variant="secondary">
                  Try Again With Different Preferences
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}