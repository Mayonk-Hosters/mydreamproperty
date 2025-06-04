import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { ArrowLeft, MapPin, Phone, Mail, Star, Home, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/property-card";

export function AgentProfile() {
  const [, params] = useRoute("/agent/:id");
  const agentId = params?.id;

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: [`/api/agents/${agentId}`],
    enabled: !!agentId,
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: [`agent-properties`, agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const response = await fetch(`/api/properties?agentId=${agentId}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    enabled: !!agentId,
  });

  if (agentLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 text-center md:text-left">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-6 w-36 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-6">The agent you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const agentProperties = properties || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Property
        </Button>

        {/* Agent Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Agent Photo */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {agent.image ? (
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256"
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
              <p className="text-primary font-semibold text-lg mb-4">{agent.title}</p>

              {/* Contact Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                {agent.contactNumber && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{agent.contactNumber}</span>
                  </div>
                )}
                {agent.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{agent.email}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{agentProperties.length}</div>
                  <div className="text-sm text-gray-600">Properties</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Award className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{agent.deals || '0'}</div>
                  <div className="text-sm text-gray-600">Deals Closed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{agent.rating || '0'}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">5+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {agent.contactNumber && (
                  <Button asChild>
                    <a href={`tel:${agent.contactNumber}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}
                {agent.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${agent.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agent's Properties */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Properties by {agent.name}</h2>
          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : agentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Properties Listed</h3>
              <p className="text-gray-600">This agent doesn't have any properties listed at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}