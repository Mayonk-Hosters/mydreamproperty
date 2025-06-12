import { useEffect, useRef } from "react";
import { Layout } from "@/components/common/layout";
import { PageTitle } from "@/components/common/page-title";
import { HeroSection } from "@/components/home/hero-section";
import { PropertyTabs } from "@/components/home/property-tabs";
import { AllPropertiesSlider } from "@/components/home/all-properties-slider";
import { CallToAction } from "@/components/home/call-to-action";
import { FooterProperties } from "@/components/home/footer-properties";

export default function HomePage() {
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  const addToRefs = (el: HTMLDivElement) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <Layout>
      <PageTitle 
        title="Find Your Dream Home"
        description="Discover your perfect property from our extensive listings of homes, apartments, and commercial properties. We offer the best selection of properties for sale and rent."
      />
      
      <HeroSection />
      
      <div ref={addToRefs} className="opacity-0 translate-y-8 transition-all duration-700 ease-out">
        <PropertyTabs />
      </div>
      
      <div ref={addToRefs} className="opacity-0 translate-y-8 transition-all duration-700 ease-out delay-200">
        <AllPropertiesSlider />
      </div>
      
      <div ref={addToRefs} className="opacity-0 translate-y-8 transition-all duration-700 ease-out delay-300">
        <CallToAction />
      </div>
      
      <div ref={addToRefs} className="opacity-0 translate-y-8 transition-all duration-700 ease-out delay-400">
        <FooterProperties />
      </div>
    </Layout>
  );
}
