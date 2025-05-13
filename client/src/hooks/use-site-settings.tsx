import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ContactInfo } from "@shared/schema";

export interface SiteSettings {
  siteName: string;
}

// Default values
const defaultSettings: SiteSettings = {
  siteName: "My Dream Property"
};

type SiteSettingsContextType = {
  settings: SiteSettings;
  isLoading: boolean;
  error: Error | null;
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: false,
  error: null
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  
  const { data, error, isLoading } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  useEffect(() => {
    if (data) {
      // Extract site name from contact info
      setSettings({
        siteName: data.siteName || defaultSettings.siteName,
      });
    }
  }, [data]);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading site settings",
        description: "Could not load site settings. Using default values.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, error: error as Error | null }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}