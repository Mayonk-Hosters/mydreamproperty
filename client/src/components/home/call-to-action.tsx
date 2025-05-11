import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CallToAction() {
  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Dream Home?</h2>
        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
          Let our expert agents guide you through the process of finding the perfect property that matches your needs and budget.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/properties">
            <Button size="lg" className="px-8 py-3 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition-all">
              Browse Properties
            </Button>
          </Link>
          <Link href="/agents">
            <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent text-white border border-white font-medium rounded-md hover:bg-white hover:bg-opacity-10 transition-all">
              Contact an Agent
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
