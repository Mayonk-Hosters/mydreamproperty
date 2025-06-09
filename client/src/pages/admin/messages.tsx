import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Trash2, MessageSquare, Eye, EyeOff, PhoneCall, Mail, MapPin, Calendar, DollarSign, Home, User, Building, Phone } from "lucide-react";
import { Link } from "wouter";
import * as XLSX from "xlsx";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for different message types
interface PropertyInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId: number;
  inquiryType: string;
  budget?: number;
  isRead: boolean;
  createdAt: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface HomeLoanInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  occupation?: string;
  monthlyIncome?: number;
  loanAmount?: number;
  propertyValue?: number;
  propertyId?: number;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("property-inquiries");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();

  // Fetch data for all three message types
  const { data: propertyInquiries = [], isLoading: isLoadingProperty, refetch: refetchProperty } = useQuery<PropertyInquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  const { data: contactMessages = [], isLoading: isLoadingContact, refetch: refetchContact } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
  });

  const { data: homeLoanInquiries = [], isLoading: isLoadingLoan, refetch: refetchLoan } = useQuery<HomeLoanInquiry[]>({
    queryKey: ['/api/home-loan-inquiries'],
  });

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "property-inquiries": return propertyInquiries;
      case "contact-messages": return contactMessages;
      case "home-loan-inquiries": return homeLoanInquiries;
      default: return [];
    }
  };

  const getCurrentEndpoint = () => {
    switch (activeTab) {
      case "property-inquiries": return "inquiries";
      case "contact-messages": return "contact-messages";
      case "home-loan-inquiries": return "home-loan-inquiries";
      default: return "inquiries";
    }
  };

  const getCurrentRefetch = () => {
    switch (activeTab) {
      case "property-inquiries": return refetchProperty;
      case "contact-messages": return refetchContact;
      case "home-loan-inquiries": return refetchLoan;
      default: return refetchProperty;
    }
  };

  const getCurrentQueryKey = () => {
    switch (activeTab) {
      case "property-inquiries": return ['/api/inquiries'];
      case "contact-messages": return ['/api/contact-messages'];
      case "home-loan-inquiries": return ['/api/home-loan-inquiries'];
      default: return ['/api/inquiries'];
    }
  };

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const endpoint = getCurrentEndpoint();
      const response = await fetch(`/api/${endpoint}/${id}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      getCurrentRefetch()();
      queryClient.invalidateQueries({ queryKey: getCurrentQueryKey() });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const endpoint = getCurrentEndpoint();
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      getCurrentRefetch()();
      queryClient.invalidateQueries({ queryKey: getCurrentQueryKey() });
    },
  });

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      const currentData = getCurrentData();
      let data: any[] = [];
      let filename = "";

      switch (activeTab) {
        case "property-inquiries":
          data = (currentData as PropertyInquiry[]).map((inquiry) => ({
            Name: inquiry.name,
            Email: inquiry.email,
            Phone: inquiry.phone || 'N/A',
            'Property ID': inquiry.propertyId,
            'Inquiry Type': inquiry.inquiryType,
            Budget: inquiry.budget || 'Not specified',
            Message: inquiry.message || 'No message',
            Status: inquiry.isRead ? 'Read' : 'Unread',
            'Created At': new Date(inquiry.createdAt).toLocaleString()
          }));
          filename = `property-inquiries-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case "contact-messages":
          data = (currentData as ContactMessage[]).map((message) => ({
            Name: message.name,
            Email: message.email,
            Phone: message.phone || 'N/A',
            Subject: message.subject,
            Message: message.message,
            Status: message.isRead ? 'Read' : 'Unread',
            'Created At': new Date(message.createdAt).toLocaleString()
          }));
          filename = `contact-messages-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        case "home-loan-inquiries":
          data = (currentData as HomeLoanInquiry[]).map((inquiry) => ({
            Name: inquiry.name,
            Email: inquiry.email,
            Phone: inquiry.phone,
            Occupation: inquiry.occupation || 'Not specified',
            'Monthly Income': inquiry.monthlyIncome || 'Not specified',
            'Loan Amount': inquiry.loanAmount || 'Not specified',
            'Property Value': inquiry.propertyValue || 'Not specified',
            'Property ID': inquiry.propertyId || 'N/A',
            Message: inquiry.message || 'No message',
            Status: inquiry.isRead ? 'Read' : 'Unread',
            'Created At': new Date(inquiry.createdAt).toLocaleString()
          }));
          filename = `home-loan-inquiries-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      XLSX.writeFile(wb, filename);
      
      toast({ 
        title: "Success", 
        description: "Data exported to Excel successfully" 
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to export data", 
        variant: "destructive" 
      });
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    const currentData = getCurrentData();
    if (checked) {
      setSelectedIds(currentData.map((item: any) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteMutation.mutateAsync(id)));
      setSelectedIds([]);
      toast({ title: "Success", description: "Selected items deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete items", variant: "destructive" });
    }
  };

  // Reset selected items when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedIds([]);
  };

  const currentData = getCurrentData();
  const unreadCount = currentData.filter((item: any) => !item.isRead).length;
  const isLoading = activeTab === "property-inquiries" ? isLoadingProperty : 
                   activeTab === "contact-messages" ? isLoadingContact : isLoadingLoan;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages Center</h1>
            <p className="text-gray-600">Manage all customer communications in one place</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportToExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              disabled={deleteMutation.isPending}
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for different message types */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="property-inquiries" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Property Inquiries
            {propertyInquiries.filter(item => !item.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {propertyInquiries.filter(item => !item.isRead).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contact-messages" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact Messages
            {contactMessages.filter(item => !item.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {contactMessages.filter(item => !item.isRead).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="home-loan-inquiries" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Loan Inquiries
            {homeLoanInquiries.filter(item => !item.isRead).length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {homeLoanInquiries.filter(item => !item.isRead).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Content for each tab */}
        <TabsContent value={activeTab} className="mt-6">
          {currentData.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab.replace('-', ' ')} yet
                </h3>
                <p className="text-gray-500 text-center">
                  {activeTab === "property-inquiries" && "Property inquiries will appear here when potential buyers express interest."}
                  {activeTab === "contact-messages" && "Contact messages will appear here when visitors use the contact form."}
                  {activeTab === "home-loan-inquiries" && "Home loan inquiries will appear here when customers apply for loans."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Checkbox
                    checked={currentData.length > 0 && selectedIds.length === currentData.length}
                    onCheckedChange={handleSelectAll}
                  />
                  {activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({currentData.length})
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount} unread</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentData.map((item: any) => (
                  <MessageItem
                    key={item.id}
                    item={item}
                    type={activeTab}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={handleSelectItem}
                    onMarkAsRead={() => markAsReadMutation.mutate(item.id)}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    isMarkingAsRead={markAsReadMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual message item component
interface MessageItemProps {
  item: any;
  type: string;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  isMarkingAsRead: boolean;
  isDeleting: boolean;
}

function MessageItem({ item, type, isSelected, onSelect, onMarkAsRead, onDelete, isMarkingAsRead, isDeleting }: MessageItemProps) {
  const renderContent = () => {
    switch (type) {
      case "property-inquiries":
        return (
          <>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline">{item.inquiryType}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {item.email}
                  </div>
                  {item.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {item.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Property ID: {item.propertyId}
                  </div>
                  {item.budget && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ₹{item.budget.toLocaleString()}
                    </div>
                  )}
                </div>
                {item.message && (
                  <p className="text-sm text-gray-700 mt-2">{item.message}</p>
                )}
              </div>
            </div>
          </>
        );
      case "contact-messages":
        return (
          <>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline">{item.subject}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {item.email}
                  </div>
                  {item.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {item.phone}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-2">{item.message}</p>
              </div>
            </div>
          </>
        );
      case "home-loan-inquiries":
        return (
          <>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{item.name}</span>
                  {item.occupation && <Badge variant="outline">{item.occupation}</Badge>}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {item.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </div>
                  {item.monthlyIncome && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Monthly: ₹{item.monthlyIncome.toLocaleString()}
                    </div>
                  )}
                  {item.loanAmount && (
                    <div className="flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      Loan: ₹{item.loanAmount.toLocaleString()}
                    </div>
                  )}
                </div>
                {item.message && (
                  <p className="text-sm text-gray-700 mt-2">{item.message}</p>
                )}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg transition-all ${
        item.isRead 
          ? 'border-gray-200 bg-gray-50' 
          : 'border-blue-200 bg-blue-50 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.id, checked as boolean)}
          />
          <div className="flex-1">
            {renderContent()}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAsRead}
            disabled={isMarkingAsRead}
          >
            {item.isRead ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Mark Unread
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Mark Read
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}