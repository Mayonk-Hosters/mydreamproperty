import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Home, 
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { ContactMessage, PropertyInquiry, HomeLoanInquiry } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function InquiriesCenterPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: contactMessages } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
  });

  const { data: propertyInquiries } = useQuery<PropertyInquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  const { data: homeLoanInquiries } = useQuery<HomeLoanInquiry[]>({
    queryKey: ['/api/home-loan-inquiries'],
  });

  // Combine all inquiries for "all" tab
  const allInquiries = [
    ...(contactMessages || []).map(msg => ({
      ...msg,
      type: 'contact',
      icon: <MessageCircle className="h-4 w-4" />,
      title: `Contact Message from ${msg.name}`,
      subtitle: msg.subject || 'General Inquiry',
      link: '/admin/contact-messages'
    })),
    ...(propertyInquiries || []).map(inq => ({
      ...inq,
      type: 'property',
      icon: <Building className="h-4 w-4" />,
      title: `Property Inquiry from ${inq.name}`,
      subtitle: 'Property Interest',
      link: '/admin/property-inquiries'
    })),
    ...(homeLoanInquiries || []).map(loan => ({
      ...loan,
      type: 'loan',
      icon: <Home className="h-4 w-4" />,
      title: `Home Loan Request from ${loan.name}`,
      subtitle: `${loan.loanType} - ₹${Number(loan.loanAmount || 0).toLocaleString()}`,
      link: '/admin/home-loan-inquiries'
    }))
  ].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const getStatusBadge = (item: any) => (
    <Badge variant={item.isRead ? "secondary" : "destructive"}>
      {item.isRead ? "Read" : "New"}
    </Badge>
  );

  const InquiryCard = ({ item }: { item: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-gray-100 rounded-lg">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {item.subtitle}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  {item.name}
                </div>
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {item.email}
                </div>
                {item.phone && (
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {item.phone}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                {item.message}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            {getStatusBadge(item)}
            <Link href={item.link}>
              <Button size="sm" variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <Helmet>
        <title>Inquiries Center | Admin Dashboard</title>
      </Helmet>
      
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Inquiries Center</h1>
            <p className="text-muted-foreground mt-1">
              Manage all customer inquiries and messages
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link href="/admin/contact-messages">
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Messages
              </Button>
            </Link>
            <Link href="/admin/property-inquiries">
              <Button variant="outline">
                <Building className="h-4 w-4 mr-2" />
                Property Inquiries
              </Button>
            </Link>
            <Link href="/admin/home-loan-inquiries">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Loan Inquiries
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All Inquiries ({allInquiries.length})
            </TabsTrigger>
            <TabsTrigger value="contact">
              Contact ({(contactMessages || []).length})
            </TabsTrigger>
            <TabsTrigger value="property">
              Property ({(propertyInquiries || []).length})
            </TabsTrigger>
            <TabsTrigger value="loan">
              Home Loans ({(homeLoanInquiries || []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {allInquiries.length > 0 ? (
              allInquiries.map((item, index) => (
                <InquiryCard key={`${item.type}-${item.id}`} item={item} />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No inquiries found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-6">
            {(contactMessages || []).map((message) => (
              <InquiryCard 
                key={message.id} 
                item={{
                  ...message,
                  type: 'contact',
                  icon: <MessageCircle className="h-4 w-4" />,
                  title: `Contact Message from ${message.name}`,
                  subtitle: message.subject || 'General Inquiry',
                  link: '/admin/contact-messages'
                }} 
              />
            ))}
          </TabsContent>

          <TabsContent value="property" className="space-y-4 mt-6">
            {(propertyInquiries || []).map((inquiry) => (
              <InquiryCard 
                key={inquiry.id} 
                item={{
                  ...inquiry,
                  type: 'property',
                  icon: <Building className="h-4 w-4" />,
                  title: `Property Inquiry from ${inquiry.name}`,
                  subtitle: 'Property Interest',
                  link: '/admin/property-inquiries'
                }} 
              />
            ))}
          </TabsContent>

          <TabsContent value="loan" className="space-y-4 mt-6">
            {(homeLoanInquiries || []).map((loan) => (
              <InquiryCard 
                key={loan.id} 
                item={{
                  ...loan,
                  type: 'loan',
                  icon: <Home className="h-4 w-4" />,
                  title: `Home Loan Request from ${loan.name}`,
                  subtitle: `${loan.loanType} - ₹${(loan.loanAmount || 0).toLocaleString()}`,
                  link: '/admin/home-loan-inquiries'
                }} 
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}