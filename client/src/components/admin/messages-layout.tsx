import { ReactNode } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "./admin-layout";
import { AdminHeader } from "./admin-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, PhoneCall, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MessagesLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function MessagesLayout({ children, title, description }: MessagesLayoutProps) {
  const [location, setLocation] = useLocation();

  // Fetch unread counts for badges
  const { data: propertyInquiries = [] } = useQuery({
    queryKey: ['/api/property-inquiries'],
  });

  const { data: contactMessages = [] } = useQuery({
    queryKey: ['/api/contact-messages'],
  });

  const { data: homeLoanInquiries = [] } = useQuery({
    queryKey: ['/api/home-loan-inquiries'],
  });

  // Calculate unread counts
  const unreadPropertyInquiries = Array.isArray(propertyInquiries) 
    ? propertyInquiries.filter((inquiry: any) => !inquiry.isRead).length 
    : 0;

  const unreadContactMessages = Array.isArray(contactMessages) 
    ? contactMessages.filter((message: any) => !message.isRead).length 
    : 0;

  const unreadHomeLoanInquiries = Array.isArray(homeLoanInquiries) 
    ? homeLoanInquiries.filter((inquiry: any) => !inquiry.isRead).length 
    : 0;

  // Determine current tab based on location
  const getCurrentTab = () => {
    if (location.includes('/admin/property-inquiries')) return 'property-inquiries';
    if (location.includes('/admin/contact-messages')) return 'contact-messages';
    if (location.includes('/admin/home-loan-inquiries')) return 'home-loan-inquiries';
    return 'property-inquiries';
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'property-inquiries':
        setLocation('/admin/property-inquiries');
        break;
      case 'contact-messages':
        setLocation('/admin/contact-messages');
        break;
      case 'home-loan-inquiries':
        setLocation('/admin/home-loan-inquiries');
        break;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminHeader 
          title={title}
          description={description}
        />

        {/* Messages Tab Navigation */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="property-inquiries" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Property Inquiries
                  {unreadPropertyInquiries > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadPropertyInquiries}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="contact-messages" className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4" />
                  Contact Messages
                  {unreadContactMessages > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadContactMessages}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="home-loan-inquiries" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home Loan Inquiries
                  {unreadHomeLoanInquiries > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadHomeLoanInquiries}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}