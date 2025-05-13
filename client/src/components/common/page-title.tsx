import { ReactNode, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSiteSettings } from '@/hooks/use-site-settings';

interface PageTitleProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function PageTitle({ title, description, children }: PageTitleProps) {
  const { settings } = useSiteSettings();
  
  // Create full title with site name
  const fullTitle = title 
    ? `${title} | ${settings.siteName}` 
    : settings.siteName;
    
  // Update document title when component mounts or title changes
  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);
  
  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
        
        {/* Open Graph tags for better social sharing */}
        <meta property="og:title" content={fullTitle} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
      </Helmet>
      {children}
    </>
  );
}