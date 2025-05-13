import { ArrowRight, Building2, BarChart2, Home, Key, FileText, Building } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ServiceCard = ({ title, description, icon }: ServiceCardProps) => (
  <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg">
    <CardHeader>
      <div className="mb-2 p-2 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-lg">
        {icon}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="text-base">{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow">
      
    </CardContent>
    <CardFooter>
      <Button variant="outline" className="w-full group">
        Learn More 
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </CardFooter>
  </Card>
);

export function ServicesSection() {
  const { toast } = useToast();
  
  const handleServiceClick = useCallback(() => {
    toast({
      title: "Coming Soon",
      description: "This service will be available shortly!",
    });
  }, [toast]);
  
  const services = [
    {
      title: "Property Management",
      description: "We handle all aspects of property management, from tenant screening to maintenance and rent collection.",
      icon: <Building2 className="h-6 w-6 text-primary" />
    },
    {
      title: "Market Analysis",
      description: "Get detailed market analysis to understand property values and market trends in your area.",
      icon: <BarChart2 className="h-6 w-6 text-primary" />
    },
    {
      title: "Home Loans",
      description: "We connect you with trusted financial partners to secure the best home loan rates available.",
      icon: <Home className="h-6 w-6 text-primary" />
    },
    {
      title: "Property Valuation",
      description: "Professional valuation services to help you understand the true value of your property.",
      icon: <Building className="h-6 w-6 text-primary" />
    },
    {
      title: "Legal Documentation",
      description: "Our legal experts assist with all property-related documentation and compliance requirements.",
      icon: <FileText className="h-6 w-6 text-primary" />
    },
    {
      title: "Rental Services",
      description: "Complete rental solutions including property listing, tenant screening, and lease management.",
      icon: <Key className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Services</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive real estate services for buyers, sellers, and property investors
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div key={index} className="h-full" onClick={handleServiceClick}>
            <ServiceCard 
              title={service.title} 
              description={service.description} 
              icon={service.icon} 
            />
          </div>
        ))}
      </div>
    </section>
  );
}