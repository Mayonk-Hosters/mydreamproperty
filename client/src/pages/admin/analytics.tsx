import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Property, Agent } from "@shared/schema";
import { Loader2 } from "lucide-react";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminAnalyticsPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  
  // Fetch data
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !isLoading,
  });
  
  const { data: agents, isLoading: isLoadingAgents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    enabled: !isLoading,
  });

  const { data: propertyCountByType } = useQuery<any[]>({
    queryKey: ["/api/properties/counts-by-type"],
    enabled: !isLoading,
  });

  // Check if user is admin
  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin, requireAdmin]);

  if (isLoading || isLoadingProperties || isLoadingAgents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }

  // Calculate property stats
  const propertiesByStatus = properties ? [
    { name: "Active", value: properties.filter(p => p.status === "active").length },
    { name: "Pending", value: properties.filter(p => p.status === "pending").length },
    { name: "Sold", value: properties.filter(p => p.status === "sold").length },
  ] : [];

  const propertiesByType = properties ? [
    { name: "House", value: properties.filter(p => p.propertyType === "House").length },
    { name: "Apartment", value: properties.filter(p => p.propertyType === "Apartment").length },
    { name: "Villa", value: properties.filter(p => p.propertyType === "Villa").length },
    { name: "Commercial", value: properties.filter(p => p.propertyType === "Commercial").length },
  ] : [];

  const propertiesByAgents = agents ? agents.map(agent => ({
    name: agent.name,
    listings: properties?.filter(p => p.agentId === agent.id).length || 0,
  })).sort((a, b) => b.listings - a.listings) : [];

  // Price ranges for properties
  const priceRanges = [
    { name: "< ₹50L", value: properties?.filter(p => p.price < 5000000).length || 0 },
    { name: "₹50L-1Cr", value: properties?.filter(p => p.price >= 5000000 && p.price < 10000000).length || 0 },
    { name: "₹1Cr-2Cr", value: properties?.filter(p => p.price >= 10000000 && p.price < 20000000).length || 0 },
    { name: "₹2Cr-5Cr", value: properties?.filter(p => p.price >= 20000000 && p.price < 50000000).length || 0 },
    { name: "> ₹5Cr", value: properties?.filter(p => p.price >= 50000000).length || 0 },
  ];

  return (
    <AdminLayout>
      <Helmet>
        <title>Analytics | Admin | My Dream Property</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600">Insights and statistics for your real estate portfolio</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm grid grid-cols-3 max-w-md">
            <TabsTrigger 
              value="overview"
              className="px-6 py-3 text-base font-semibold rounded-md transition-all data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="properties"
              className="px-6 py-3 text-base font-semibold rounded-md transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-blue-600"
            >
              Properties
            </TabsTrigger>
            <TabsTrigger 
              value="agents"
              className="px-6 py-3 text-base font-semibold rounded-md transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-emerald-600"
            >
              Agents
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Properties</CardTitle>
                <CardDescription>Current listing count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{properties?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Agents</CardTitle>
                <CardDescription>Active real estate agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{agents?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Avg. Property Price</CardTitle>
                <CardDescription>Average listing price</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {properties && properties.length > 0
                    ? `₹${(properties.reduce((acc, prop) => acc + prop.price, 0) / properties.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                    : '₹0'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Properties by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertiesByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {propertiesByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Properties']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Properties by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={propertyCountByType || propertiesByType}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={propertyCountByType ? "propertyType" : "name"} />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Properties']} />
                      <Legend />
                      <Bar dataKey={propertyCountByType ? "count" : "value"} fill="#8884d8" name="Property Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Properties by Price Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priceRanges}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Properties']} />
                      <Legend />
                      <Bar dataKey="value" fill="#00C49F" name="Number of Properties" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured vs. Regular Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Featured', value: properties?.filter(p => p.featured).length || 0 },
                          { name: 'Regular', value: properties?.filter(p => !p.featured).length || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#FFBB28" />
                        <Cell fill="#0088FE" />
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Properties']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Properties by Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={propertiesByAgents}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [value, 'Properties']} />
                    <Legend />
                    <Bar dataKey="listings" fill="#8884d8" name="Property Listings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={agents?.map(agent => ({
                      name: agent.name,
                      rating: agent.rating || 0
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value) => [value, 'Rating']} />
                    <Legend />
                    <Bar dataKey="rating" fill="#FF8042" name="Rating (0-5)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}