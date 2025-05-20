import OpenAI from "openai";
import { Property } from "@shared/schema";
import { PropertyPreference } from "@shared/types/recommendation";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generate AI-powered property recommendations based on user preferences
 * @param properties List of available properties
 * @param preferences User preferences
 * @param limit Maximum number of recommendations to return
 * @returns Array of recommended properties with matching scores
 */
export async function getPropertyRecommendations(
  properties: Property[],
  preferences: PropertyPreference,
  limit: number = 5
): Promise<Array<{ property: Property; score: number; reason: string }>> {
  try {
    if (!properties || properties.length === 0) {
      return [];
    }

    // Format properties data for the AI
    const propertiesData = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      beds: property.beds,
      baths: property.baths,
      area: property.area,
      propertyType: property.propertyType,
      features: property.features || []
    }));

    // Build a prompt for the AI
    const prompt = buildRecommendationPrompt(propertiesData, preferences);

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are a real estate expert AI assistant that analyzes property listings and user preferences to provide personalized recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the response
    const recommendations = JSON.parse(content);
    
    // Map the recommendations to our return format
    return recommendations.recommendations.map((rec: any) => {
      const property = properties.find(p => p.id === rec.propertyId);
      if (!property) {
        throw new Error(`Property with ID ${rec.propertyId} not found`);
      }
      return {
        property,
        score: rec.matchScore,
        reason: rec.reason
      };
    }).slice(0, limit);

  } catch (error) {
    console.error("Error generating property recommendations:", error);
    return [];
  }
}

/**
 * Build a prompt for the AI to generate property recommendations
 */
function buildRecommendationPrompt(
  properties: any[],
  preferences: PropertyPreference
): string {
  // Format user preferences into a readable string
  const preferencesText = Object.entries(preferences)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (key === 'features' && Array.isArray(value)) {
        return `- Desired features: ${value.join(', ')}`;
      }
      if (key === 'budget') {
        return `- Budget: $${value}`;
      }
      return `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
    })
    .join('\n');

  // Build the full prompt
  return `
I need your help to recommend properties based on a user's preferences.

USER PREFERENCES:
${preferencesText}

AVAILABLE PROPERTIES:
${JSON.stringify(properties, null, 2)}

Based on the user preferences, analyze the available properties and recommend the best matches.
For each recommended property, provide:
1. The property ID
2. A match score between 0-100 
3. A brief explanation of why this property matches the user's preferences

Return your response in the following JSON format:
{
  "recommendations": [
    {
      "propertyId": 123,
      "matchScore": 85,
      "reason": "This property matches your budget and location preferences, plus it has the 3 bedrooms you need."
    },
    ...more recommendations
  ]
}

Order the recommendations by match score from highest to lowest.
`;
}