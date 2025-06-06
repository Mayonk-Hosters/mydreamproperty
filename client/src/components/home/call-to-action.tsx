import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Home, Users } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="animate-fade-in">
          <Home className="h-16 w-16 text-white mx-auto mb-8 animate-bounce" />
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-white/90 text-xl mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up-delay">
            Let our expert agents guide you through the process of finding the perfect property that matches your needs and budget. Your dream home is just a click away!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up-delay-2">
          <Link href="/properties">
            <Button size="lg" className="group px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <Home className="h-5 w-5 mr-3 group-hover:animate-bounce" />
              Browse Properties
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="group px-10 py-4 bg-transparent text-white border-2 border-white font-bold text-lg rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
              <Users className="h-5 w-5 mr-3 group-hover:animate-bounce" />
              Contact Us
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white/80 animate-fade-in">
          <div className="animate-slide-in-left">
            <div className="text-3xl font-bold mb-2">1000+</div>
            <div className="text-lg">Properties Listed</div>
          </div>
          <div className="animate-slide-up-delay">
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-lg">Happy Clients</div>
          </div>
          <div className="animate-slide-in-right">
            <div className="text-3xl font-bold mb-2">15+</div>
            <div className="text-lg">Years Experience</div>
          </div>
        </div>
      </div>
    </section>
  );
}
