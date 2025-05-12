import { Helmet } from "react-helmet";
import { Layout } from "@/components/common/layout";
import { HeroSection } from "@/components/home/hero-section";
import { PropertyTabs } from "@/components/home/property-tabs";
import { PropertyTypes } from "@/components/home/property-types";
import { FeaturedAgents } from "@/components/home/featured-agents";
import { Testimonials } from "@/components/home/testimonials";
import { CallToAction } from "@/components/home/call-to-action";

export default function HomePage() {
  return (
    <Layout>
      <Helmet>
        <title>My Dream Property - Find Your Dream Home</title>
        <meta name="description" content="Discover your perfect property from our extensive listings of homes, apartments, and commercial properties. My Dream Property offers the best selection of properties for sale and rent." />
        <meta property="og:title" content="My Dream Property - Find Your Dream Home" />
        <meta property="og:description" content="Discover your perfect property from our extensive listings of homes, apartments, and commercial properties." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HeroSection />
      <PropertyTabs />
      <PropertyTypes />
      <FeaturedAgents />
      <Testimonials />
      <CallToAction />
    </Layout>
  );
}
