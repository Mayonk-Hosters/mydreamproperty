import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

export interface Neighborhood {
  id: number;
  name: string;
  city: string;
  description: string;
  locationData: {
    lat: number;
    lng: number;
    boundaries?: Array<{lat: number, lng: number}>;
  };
  createdAt: string;
  propertyCount?: number; // Count of properties in this neighborhood
}

export interface NeighborhoodMetrics {
  id: number;
  neighborhoodId: number;
  avgPropertyPrice: number;
  safetyScore: number;
  walkabilityScore: number;
  schoolsScore: number;
  publicTransportScore: number;
  diningScore: number;
  entertainmentScore: number;
  parkingScore: number;
  noiseLevel: number;
  schoolsCount: number;
  parksCount: number;
  restaurantsCount: number;
  hospitalsCount: number;
  shoppingCount: number;
  groceryStoresCount: number;
  gymsCount: number;
  updatedAt: string;
}

export interface NeighborhoodWithMetrics extends Neighborhood {
  metrics: NeighborhoodMetrics | null;
}

interface NeighborhoodComparisonContextProps {
  selectedNeighborhoods: number[];
  addNeighborhood: (id: number) => void;
  removeNeighborhood: (id: number) => void;
  clearNeighborhoods: () => void;
  comparisonData: NeighborhoodWithMetrics[];
  isLoading: boolean;
  error: Error | null;
}

const NeighborhoodComparisonContext = createContext<NeighborhoodComparisonContextProps | undefined>(undefined);

export const NeighborhoodComparisonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<number[]>([]);

  // Fetch comparison data when neighborhoods are selected
  const { data, isLoading, error } = useQuery<NeighborhoodWithMetrics[], Error>({
    queryKey: ['/api/neighborhoods/compare', selectedNeighborhoods],
    queryFn: async ({ queryKey }) => {
      const url = `${queryKey[0]}?ids=${selectedNeighborhoods.join(',')}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Error fetching comparison data: ${res.status}`);
      }
      return res.json();
    },
    enabled: selectedNeighborhoods.length > 0
  });

  const addNeighborhood = (id: number) => {
    if (!selectedNeighborhoods.includes(id) && selectedNeighborhoods.length < 5) {
      setSelectedNeighborhoods([...selectedNeighborhoods, id]);
    }
  };

  const removeNeighborhood = (id: number) => {
    setSelectedNeighborhoods(selectedNeighborhoods.filter(nId => nId !== id));
  };

  const clearNeighborhoods = () => {
    setSelectedNeighborhoods([]);
  };

  return (
    <NeighborhoodComparisonContext.Provider
      value={{
        selectedNeighborhoods,
        addNeighborhood,
        removeNeighborhood,
        clearNeighborhoods,
        comparisonData: data || [],
        isLoading,
        error
      }}
    >
      {children}
    </NeighborhoodComparisonContext.Provider>
  );
};

export const useNeighborhoodComparison = () => {
  const context = useContext(NeighborhoodComparisonContext);
  if (context === undefined) {
    throw new Error('useNeighborhoodComparison must be used within a NeighborhoodComparisonProvider');
  }
  return context;
};

// Hook for fetching all neighborhoods
export const useNeighborhoods = () => {
  return useQuery<Neighborhood[], Error>({
    queryKey: ['/api/neighborhoods'],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Error fetching neighborhoods: ${res.status}`);
      }
      const neighborhoods = await res.json();
      // This endpoint already filters neighborhoods that have properties
      // The server is configured to only return neighborhoods with propertyCount > 0
      return neighborhoods;
    }
  });
};

// Hook for fetching a single neighborhood with metrics
export const useNeighborhood = (id: number) => {
  const neighborhoodQuery = useQuery<Neighborhood, Error>({
    queryKey: [`/api/neighborhoods/${id}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Error fetching neighborhood: ${res.status}`);
      }
      return res.json();
    },
    enabled: !!id
  });

  const metricsQuery = useQuery<NeighborhoodMetrics, Error>({
    queryKey: [`/api/neighborhoods/${id}/metrics`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Error fetching neighborhood metrics: ${res.status}`);
      }
      return res.json();
    },
    enabled: !!id
  });

  return {
    neighborhood: neighborhoodQuery.data,
    metrics: metricsQuery.data,
    isLoading: neighborhoodQuery.isLoading || metricsQuery.isLoading,
    error: neighborhoodQuery.error || metricsQuery.error
  };
};