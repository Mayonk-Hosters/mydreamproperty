import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Agent } from "@shared/schema";
import { Star } from "lucide-react";

export function FeaturedAgents() {
  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Our Top Agents</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all text-center">
                <Skeleton className="w-full h-64 object-cover object-center" />
                <div className="p-4">
                  <Skeleton className="h-6 w-32 mx-auto mb-1" />
                  <Skeleton className="h-4 w-40 mx-auto mb-3" />
                  <div className="flex justify-center space-x-2 mb-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
            ))
          ) : agents && agents.length > 0 ? (
            agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all text-center">
                <img 
                  src={agent.image} 
                  alt={agent.name} 
                  className="w-full h-64 object-cover object-center" 
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{agent.title}</p>
                  <div className="flex justify-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {agent.deals}+ Deals
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center">
                      {agent.rating.toFixed(1)} <Star className="h-3 w-3 text-yellow-400 ml-1" />
                    </span>
                  </div>
                  <Button variant="outline" className="w-full py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-all">
                    Contact Agent
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No agents found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
