import { useState, useEffect } from "react";
import { Star, StarHalf, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { Button } from "@/components/ui/button";

// Client reviews data function that uses site name
function getClientReviews(siteName: string) {
  return [
    {
      id: 1,
      name: "David Wilson",
      location: "Bought a home in Mumbai",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      rating: 5,
      text: `Working with ${siteName} was the best decision we made. Rahul understood exactly what we were looking for and found us our dream home within our budget. The entire process was smooth and transparent.`,
      property: "3 BHK Apartment in Andheri",
      date: "January 2023"
    },
    {
      id: 2,
      name: "Emily Robertson",
      location: "Sold a property in Pune",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      rating: 4.5,
      text: `The team at ${siteName} helped me sell my property for more than I expected. Their marketing approach and negotiation skills were impressive. I appreciated their attention to detail.`,
      property: "Villa in Koregaon Park",
      date: "March 2023"
    },
    {
      id: 3,
      name: "Thomas Anderson",
      location: "Investor from Delhi",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      rating: 5,
      text: `As a real estate investor, I need agents who understand the market. The team at ${siteName} always delivers high-quality investment opportunities and their knowledge of local markets is exceptional.`,
      property: "Commercial Space in Connaught Place",
      date: "May 2023"
    },
    {
      id: 4,
      name: "Priya Sharma",
      location: "First-time homebuyer in Bangalore",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      rating: 5,
      text: `Being a first-time homebuyer, I was nervous about the process. ${siteName}'s team guided me through each step with patience and expertise. They found me a perfect apartment that matched all my requirements.`,
      property: "2 BHK in Electronic City",
      date: "August 2023"
    },
    {
      id: 5,
      name: "Rajesh Patel",
      location: "Property developer in Ahmedabad",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      rating: 4.5,
      text: `I've worked with many real estate agencies, but ${siteName} stands out for their professionalism and market knowledge. They understand the needs of developers and provide excellent support throughout projects.`,
      property: "Residential Complex in Satellite",
      date: "October 2023"
    },
    {
      id: 6,
      name: "Ananya Desai",
      location: "Relocated to Hyderabad",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      rating: 5,
      text: `When I had to relocate for work, ${siteName} made finding a new home stress-free. They arranged virtual tours and helped me secure a great apartment before I even arrived in the city. Exceptional service!`,
      property: "3 BHK in Gachibowli",
      date: "December 2023"
    }
  ];
}

export function Testimonials() {
  const { settings } = useSiteSettings();
  const allReviews = getClientReviews(settings.siteName);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(3);

  // Adjust display count based on window size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setDisplayCount(1);
      } else if (window.innerWidth < 1024) {
        setDisplayCount(2);
      } else {
        setDisplayCount(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate max index based on display count
  const maxIndex = allReviews.length - displayCount;
  
  // Navigate to previous testimonials
  const prevSlide = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };
  
  // Navigate to next testimonials
  const nextSlide = () => {
    setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex));
  };
  
  // Get visible reviews
  const visibleReviews = allReviews.slice(activeIndex, activeIndex + displayCount);
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Client Reviews</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about their experience with {settings.siteName}.
          </p>
        </div>
        
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10">
            <Button
              onClick={prevSlide}
              disabled={activeIndex === 0}
              variant="outline"
              size="icon"
              className="bg-white rounded-full shadow-md hover:bg-gray-50"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 md:translate-x-6 z-10">
            <Button
              onClick={nextSlide}
              disabled={activeIndex >= maxIndex}
              variant="outline"
              size="icon"
              className="bg-white rounded-full shadow-md hover:bg-gray-50"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
            {visibleReviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all hover:shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={review.image} 
                    alt={review.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary" 
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-lg">{review.name}</h4>
                    <p className="text-gray-500 text-sm">{review.location}</p>
                  </div>
                </div>
                
                <div className="mb-3 text-yellow-400 flex">
                  {renderStars(review.rating)}
                </div>
                
                <div className="relative">
                  <Quote className="absolute top-0 left-0 text-gray-200 h-8 w-8 -translate-x-2 -translate-y-2 transform opacity-50" />
                  <p className="text-gray-600 pt-2 pb-3 italic">"{review.text}"</p>
                </div>
                
                <div className="pt-3 mt-2 border-t border-gray-100">
                  <p className="text-primary font-medium">{review.property}</p>
                  <p className="text-gray-400 text-sm">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-primary" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">Ready to find your dream property?</p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-2"
          >
            Contact Us Today
          </Button>
        </div>
      </div>
    </section>
  );
}
