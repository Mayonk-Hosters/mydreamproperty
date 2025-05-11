import { Star, StarHalf } from "lucide-react";

// Static testimonial data
const testimonials = [
  {
    id: 1,
    name: "David Wilson",
    location: "Bought a home in Seattle",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
    rating: 5,
    text: "Working with RealEstate Pro was the best decision we made. Jessica understood exactly what we were looking for and found us our dream home within our budget."
  },
  {
    id: 2,
    name: "Emily Robertson",
    location: "Sold a property in Portland",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
    rating: 4.5,
    text: "The team at RealEstate Pro helped me sell my property for more than I expected. Their marketing approach and negotiation skills were impressive."
  },
  {
    id: 3,
    name: "Thomas Anderson",
    location: "Investor from Chicago",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
    rating: 5,
    text: "As a real estate investor, I need agents who understand the market. The team at RealEstate Pro always delivers high-quality investment opportunities."
  }
];

export function Testimonials() {
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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">What Our Clients Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div className="ml-3">
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
              <div className="mb-3 text-yellow-400 flex">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-gray-600">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
