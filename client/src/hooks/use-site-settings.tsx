import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ContactInfo } from "@shared/schema";

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  contactInfo?: ContactInfo;
}

// Default values
const defaultSettings: SiteSettings = {
  siteName: "My Dream Property",
  contactEmail: "info@mydreamproperty.com",
  contactPhone: "+91 98765 43210"
};

type SiteSettingsContextType = {
  settings: SiteSettings;
  isLoading: boolean;
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  isLoading: false
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Silently handle 404 errors as we'll use default settings
    onError: () => {},
  });
  
  // Use data if available, otherwise use default settings
  const settings: SiteSettings = data 
    ? { 
        siteName: data.siteName || defaultSettings.siteName,
        contactEmail: data.email1 || defaultSettings.contactEmail,
        contactPhone: data.phone1 || defaultSettings.contactPhone,
        contactInfo: data
      }
    : defaultSettings;
  
  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}