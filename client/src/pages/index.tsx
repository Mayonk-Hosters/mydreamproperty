import { Layout } from "@/components/common/layout";
import { PageTitle } from "@/components/common/page-title";
import { HeroSection } from "@/components/home/hero-section";
import { PropertyTabs } from "@/components/home/property-tabs";
import { AllPropertiesSlider } from "@/components/home/all-properties-slider";
import { CallToAction } from "@/components/home/call-to-action";
import { FooterProperties } from "@/components/home/footer-properties";

export default function HomePage() {
  return (
    <Layout>
      <PageTitle 
        title="Find Your Dream Home"
        description="Discover your perfect property from our extensive listings of homes, apartments, and commercial properties. We offer the best selection of properties for sale and rent."
      />
      
      <HeroSection />
      <PropertyTabs />
      <AllPropertiesSlider />
      <CallToAction />
      <FooterProperties />
    </Layout>
  );
}
