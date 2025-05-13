import { Layout } from "@/components/common/layout";
import { PageTitle } from "@/components/common/page-title";
import { HeroSection } from "@/components/home/hero-section";
import { PropertyTabs } from "@/components/home/property-tabs";
import { PropertyTypes } from "@/components/home/property-types";
import { ServicesSection } from "@/components/home/services-section";
import { FeaturedAgents } from "@/components/home/featured-agents";
import { Testimonials } from "@/components/home/testimonials";
import { CallToAction } from "@/components/home/call-to-action";

export default function HomePage() {
  return (
    <Layout>
      <PageTitle 
        title="Find Your Dream Home"
        description="Discover your perfect property from our extensive listings of homes, apartments, and commercial properties. We offer the best selection of properties for sale and rent."
      />
      
      <HeroSection />
      <PropertyTabs />
      <PropertyTypes />
      <ServicesSection />
      <FeaturedAgents />
      <Testimonials />
      <CallToAction />
    </Layout>
  );
}
