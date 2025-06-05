import { useQuery } from "@tanstack/react-query";
import { 
  Building, 
  IndianRupee, 
  Users, 
  MessageCircle,
  Home,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property, Agent, Inquiry, ContactMessage, HomeLoanInquiry } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export function DashboardOverview() {
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  const { data: inquiries } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  const { data: contactMessages } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
  });

  const { data: homeLoanInquiries } = useQuery<HomeLoanInquiry[]>({
    queryKey: ['/api/home-loan-inquiries'],
  });

  // Calculate real statistics
  const totalProperties = properties?.length || 0;
  const activeProperties = properties?.filter(p => p.status === 'active').length || 0;
  const soldProperties = properties?.filter(p => p.status === 'sold').length || 0;
  const totalSalesValue = properties?.filter(p => p.status === 'sold')
    .reduce((sum, property) => sum + property.price, 0) || 0;
  
  const unreadInquiries = inquiries?.filter(i => !i.isRead).length || 0;
  const unreadMessages = contactMessages?.filter(m => !m.isRead).length || 0;
  const unreadHomeLoanInquiries = homeLoanInquiries?.filter(h => !h.isRead).length || 0;
  const totalUnread = unreadInquiries + unreadMessages + unreadHomeLoanInquiries;

  const stats = [
    {
      title: "Total Properties",
      value: totalProperties,
      icon: <Building className="h-6 w-6 text-blue-600" />,
      description: `${activeProperties} active, ${soldProperties} sold`,
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Total Sales Value",
      value: formatCurrency(totalSalesValue),
      icon: <IndianRupee className="h-6 w-6 text-green-600" />,
      description: `From ${soldProperties} sold properties`,
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Active Agents",
      value: agents?.length || 0,
      icon: <Users className="h-6 w-6 text-purple-600" />,
      description: "Registered agents",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Pending Responses",
      value: totalUnread,
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
      description: `${unreadInquiries} inquiries, ${unreadMessages} messages, ${unreadHomeLoanInquiries} loan requests`,
      color: "bg-orange-50 border-orange-200",
      urgent: totalUnread > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.color} ${stat.urgent ? 'ring-2 ring-orange-300' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {stat.description}
            </p>
            {stat.urgent && (
              <Badge variant="destructive" className="mt-2 text-xs">
                Needs Attention
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}