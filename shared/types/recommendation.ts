// Interface for user preferences used in AI property recommendations
export interface PropertyPreference {
  budget?: number;
  minBeds?: number;
  minBaths?: number;
  location?: string;
  propertyType?: string;
  features?: string[];
  lifestyle?: string;
  commute?: string;
  familySize?: number;
}

// Type for recommendation results
export interface RecommendationResult {
  property: any; // Will use the Property type from schema.ts
  score: number;
  reason: string;
}