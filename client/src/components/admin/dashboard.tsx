import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Building,
  DollarSign,
  Users,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Property, Agent, Inquiry } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export function Dashboard() {
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  const { data: inquiries } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  // Mock stats for demonstration
  const stats = [
    {
      title: "Total Properties",
      value: properties?.length || 0,
      icon: <Building className="text-xl text-primary" />,
      change: 12.5,
      trend: "up"
    },
    {
      title: "Total Sales",
      value: properties ? formatCurrency(properties.reduce((sum, property) => property.status === "sold" ? sum + property.price : sum, 0)) : "$0",
      icon: <DollarSign className="text-xl text-secondary" />,
      change: 8.2,
      trend: "up"
    },
    {
      title: "Active Agents",
      value: agents?.length || 0,
      icon: <Users className="text-xl text-accent" />,
      change: 4.3,
      trend: "up"
    },
    {
      title: "New Inquiries",
      value: inquiries?.length || 0,
      icon: <MessageCircle className="text-xl text-green-500" />,
      change: 2.5,
      trend: "down"
    }
  ];

  // Mock performance data
  const performanceData = [
    { name: "Listing Views", value: 82 },
    { name: "Inquiries Response Rate", value: 94 },
    { name: "Conversion Rate", value: 28 },
    { name: "Agent Performance", value: 76 }
  ];

  // Mock top areas data
  const topAreas = [
    { name: "Beverly Hills, CA", value: "$12.4M" },
    { name: "San Francisco, CA", value: "$8.7M" },
    { name: "New York, NY", value: "$7.2M" }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your properties today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-full p-3 bg-opacity-10 ${
                  index === 0 ? 'bg-primary' :
                  index === 1 ? 'bg-secondary' :
                  index === 2 ? 'bg-accent' : 'bg-green-100'
                }`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">{stat.title}</h2>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className={`text-xs flex items-center ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                    {stat.change}% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Listings & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Listings */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold">Recent Property Listings</h2>
            <Link href="/admin/properties">
              <Button variant="link" className="text-sm text-primary hover:underline">
                View All
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties && properties.length > 0 ? (
                  properties.slice(0, 4).map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <img 
                            src={Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : 
                              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=40"} 
                            alt={property.title} 
                            className="w-10 h-10 rounded object-cover" 
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{property.title}</div>
                            <div className="text-xs text-gray-500">{property.location}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(property.price)}</TableCell>
                      <TableCell>Agent Name</TableCell>
                      <TableCell>
                        <Badge className={
                          property.status === "active" ? "bg-green-100 text-green-800" :
                          property.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/properties/edit/${property.id}`}>
                          <Button variant="link" className="text-primary hover:underline">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No properties found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Performance Overview</h2>
          <div className="space-y-6">
            {performanceData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-sm mb-3">Top Performing Areas</h3>
            <div className="space-y-2">
              {topAreas.map((area, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{area.name}</span>
                  <span className="font-medium">{area.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Inquiries & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Latest Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold">Latest Inquiries</h2>
            <Link href="/admin/inquiries">
              <Button variant="link" className="text-sm text-primary hover:underline">
                View All
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {inquiries && inquiries.length > 0 ? (
              inquiries.slice(0, 3).map((inquiry) => (
                <div key={inquiry.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                        alt="Client" 
                        className="w-8 h-8 rounded-full mr-3" 
                      />
                      <div>
                        <p className="font-medium text-sm">{inquiry.name}</p>
                        <p className="text-xs text-gray-500">{inquiry.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Interested in: <span className="font-medium">Property #{inquiry.propertyId}</span>
                  </p>
                  <p className="text-sm text-gray-600">{inquiry.message}</p>
                  <div className="mt-2 flex space-x-2">
                    <Button size="sm" className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90">
                      Reply
                    </Button>
                    <Button size="sm" variant="outline" className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                      Archive
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No inquiries found
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/properties/new">
              <Button className="w-full flex items-center justify-between p-3 bg-primary bg-opacity-10 rounded hover:bg-opacity-20 transition-all text-left">
                <div className="flex items-center">
                  <Building className="text-primary mr-3 h-5 w-5" />
                  <span className="text-sm font-medium">Add New Property</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="/admin/agents/new">
              <Button className="w-full flex items-center justify-between p-3 bg-secondary bg-opacity-10 rounded hover:bg-opacity-20 transition-all text-left">
                <div className="flex items-center">
                  <Users className="text-secondary mr-3 h-5 w-5" />
                  <span className="text-sm font-medium">Add New Agent</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Button className="w-full flex items-center justify-between p-3 bg-accent bg-opacity-10 rounded hover:bg-opacity-20 transition-all text-left">
              <div className="flex items-center">
                <MessageCircle className="text-accent mr-3 h-5 w-5" />
                <span className="text-sm font-medium">Send Newsletter</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            <Button className="w-full flex items-center justify-between p-3 bg-green-100 rounded hover:bg-green-200 transition-all text-left">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">Generate Reports</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-sm mb-3">Upcoming Tasks</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-sm">Follow up with potential buyers</span>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-sm">Update property descriptions</span>
                </div>
                <span className="text-xs text-gray-500">Tomorrow</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-sm">Schedule team meeting</span>
                </div>
                <span className="text-xs text-gray-500">Aug 24</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
