import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Building,
  DollarSign,
  Users,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Edit,
  RefreshCw
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
import { DashboardOverview } from "./dashboard-overview";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";

export function Dashboard() {
  const { data: properties, refetch: refetchProperties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  const { data: inquiries } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  const handleRefresh = () => {
    refetchProperties();
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your real estate management system</p>
        </div>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Enhanced Overview Stats */}
      <DashboardOverview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Recent Properties Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold">Recent Property Listings</h2>
          <Link href="/admin/properties">
            <Button variant="link" className="text-sm text-primary hover:underline">
              View All Properties
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties && properties.length > 0 ? (
                properties.slice(0, 5).map((property) => (
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
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {property.title}
                          </div>
                          <div className="text-xs text-gray-500">{property.location}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(property.price)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{property.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        property.status === "active" ? "bg-green-100 text-green-800" :
                        property.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        property.status === "sold" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/properties/edit/${property.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:underline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No properties found</p>
                    <Link href="/admin/properties/new">
                      <Button className="mt-2">Add Your First Property</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
