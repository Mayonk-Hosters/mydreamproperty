import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Building, 
  MessageCircle, 
  Home,
  Clock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Property, PropertyInquiry, ContactMessage, HomeLoanInquiry } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export function RecentActivity() {
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: inquiries } = useQuery<PropertyInquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  const { data: contactMessages } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
  });

  const { data: homeLoanInquiries } = useQuery<HomeLoanInquiry[]>({
    queryKey: ['/api/home-loan-inquiries'],
  });

  // Combine and sort all recent activities
  const activities: any[] = [];

  // Recent properties (last 5)
  if (properties) {
    properties
      .slice(0, 5)
      .forEach(property => {
        (activities as any[]).push({
          type: 'property',
          id: property.id,
          title: property.title,
          description: `${property.type} • ${formatCurrency(property.price)}`,
          location: property.location,
          timestamp: property.createdAt,
          status: property.status,
          icon: <Building className="h-4 w-4" />
        });
      });
  }

  // Messages moved to Inquiries Center tab

  // Sort by timestamp (most recent first)
  const sortedActivities = activities
    .filter(activity => activity.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const getActivityLink = (activity: any) => {
    switch (activity.type) {
      case 'property':
        return `/admin/properties/edit/${activity.id}`;
      case 'inquiry':
        return '/admin/inquiries';
      case 'message':
        return '/admin/contact-messages';
      case 'home-loan':
        return '/admin/home-loan-inquiries';
      default:
        return '/admin';
    }
  };

  const getStatusBadge = (activity: any) => {
    if (activity.type === 'property') {
      return (
        <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
          {activity.status}
        </Badge>
      );
    }
    return (
      <Badge variant={activity.status === 'unread' ? 'destructive' : 'secondary'}>
        {activity.status === 'unread' ? 'New' : 'Read'}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
        <Link href="/admin/analytics">
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedActivities.length > 0 ? (
            sortedActivities.map((activity, index) => (
              <Link key={index} href={getActivityLink(activity)}>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-full">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400">
                        {activity.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getStatusBadge(activity)}
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}