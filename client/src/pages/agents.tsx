import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Layout } from "@/components/common/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Phone, Mail, Search } from "lucide-react";
import { Agent } from "@shared/schema";
import { useState } from "react";

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: agents, isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });
  
  // Filter agents based on search query
  const filteredAgents = agents?.filter(agent => 
    !searchQuery || 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <Helmet>
        <title>Our Real Estate Consultants | RealEstate Pro</title>
        <meta name="description" content="Meet our team of experienced real estate consultants who are ready to help you find your dream property or sell your current home." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Our Real Estate Consultants</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet our team of experienced real estate consultants who are dedicated to helping you find your dream home or sell your property for the best price.
          </p>
          
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search consultants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(8).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-64" />
                <div className="p-6 text-center">
                  <Skeleton className="h-6 w-40 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto mb-4" />
                  <div className="flex justify-center space-x-2 mb-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
            ))
          ) : filteredAgents && filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
                <img 
                  src={agent.image} 
                  alt={agent.name} 
                  className="w-full h-64 object-cover object-center" 
                />
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{agent.title}</p>
                  
                  <div className="flex justify-center space-x-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center">
                      {agent.deals}+ Deals
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs flex items-center">
                      {agent.rating.toFixed(1)} <Star className="h-3 w-3 text-yellow-400 ml-1" />
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4 text-sm">
                    <p className="flex items-center justify-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" /> New York, NY
                    </p>
                    <p className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" /> (123) 456-7890
                    </p>
                    <p className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" /> {agent.name.toLowerCase().replace(' ', '.')}@realestatepro.com
                    </p>
                  </div>
                  
                  <Button className="w-full">Contact Agent</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No agents found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any agents matching your search criteria.
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
