import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Search, 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  MessageSquare, 
  Home, 
  DollarSign,
  Calendar,
  User,
  Building,
  Filter,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";

// Unified message interface
interface UnifiedMessage {
  id: number;
  type: 'contact' | 'property-inquiry' | 'home-loan';
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  // Property inquiry specific
  propertyId?: number;
  propertyTitle?: string;
  inquiryType?: string;
  budget?: number;
  // Home loan specific
  loanType?: string;
  loanAmount?: number;
  propertyLocation?: string;
  monthlyIncome?: number;
  employment?: string;
}

function UnifiedMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all message types
  const { data: contactMessages = [] } = useQuery<any[]>({
    queryKey: ['/api/contact-messages'],
  });

  const { data: propertyInquiries = [] } = useQuery<any[]>({
    queryKey: ['/api/property-inquiries'],
  });

  const { data: homeLoanInquiries = [] } = useQuery<any[]>({
    queryKey: ['/api/home-loan-inquiries'],
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ['/api/properties'],
  });

  // Combine all messages into unified format
  const unifiedMessages: UnifiedMessage[] = [
    // Contact messages
    ...contactMessages.map((msg: any) => ({
      id: msg.id,
      type: 'contact' as const,
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    })),
    // Property inquiries
    ...propertyInquiries.map((inquiry: any) => {
      const property = properties.find((p: any) => p.id === inquiry.propertyId);
      return {
        id: inquiry.id,
        type: 'property-inquiry' as const,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        isRead: inquiry.isRead,
        createdAt: inquiry.createdAt,
        propertyId: inquiry.propertyId,
        propertyTitle: property?.title || `Property #${inquiry.propertyId}`,
        inquiryType: inquiry.inquiryType,
        budget: inquiry.budget,
      };
    }),
    // Home loan inquiries
    ...homeLoanInquiries.map((loan: any) => ({
      id: loan.id,
      type: 'home-loan' as const,
      name: loan.name,
      email: loan.email,
      phone: loan.phone,
      message: loan.message,
      isRead: loan.isRead,
      createdAt: loan.createdAt,
      loanType: loan.loanType,
      loanAmount: loan.loanAmount,
      propertyLocation: loan.propertyLocation,
      monthlyIncome: loan.monthlyIncome,
      employment: loan.employment,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter messages
  const filteredMessages = unifiedMessages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || message.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "read" && message.isRead) ||
      (statusFilter === "unread" && !message.isRead);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: string }) => {
      const endpoint = type === 'contact' ? '/api/contact-messages' :
                     type === 'property-inquiry' ? '/api/property-inquiries' :
                     '/api/home-loan-inquiries';
      
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    },
    onSuccess: (_, { type }) => {
      const queryKey = type === 'contact' ? '/api/contact-messages' :
                      type === 'property-inquiry' ? '/api/property-inquiries' :
                      '/api/home-loan-inquiries';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: "Message deleted",
        description: "The message has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    },
  });

  // Mark as read/unread mutation
  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, type, isRead }: { id: number; type: string; isRead: boolean }) => {
      const endpoint = type === 'contact' ? '/api/contact-messages' :
                     type === 'property-inquiry' ? '/api/property-inquiries' :
                     '/api/home-loan-inquiries';
      
      const action = isRead ? 'mark-read' : 'mark-unread';
      const response = await fetch(`${endpoint}/${id}/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update message status');
      }
    },
    onSuccess: (_, { type }) => {
      const queryKey = type === 'contact' ? '/api/contact-messages' :
                      type === 'property-inquiry' ? '/api/property-inquiries' :
                      '/api/home-loan-inquiries';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'contact':
        return <MessageSquare className="h-4 w-4" />;
      case 'property-inquiry':
        return <Building className="h-4 w-4" />;
      case 'home-loan':
        return <Home className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getMessageTypeBadge = (type: string) => {
    const colors = {
      'contact': 'bg-blue-100 text-blue-800',
      'property-inquiry': 'bg-green-100 text-green-800',
      'home-loan': 'bg-purple-100 text-purple-800',
    };
    
    const labels = {
      'contact': 'Contact',
      'property-inquiry': 'Property',
      'home-loan': 'Home Loan',
    };

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {getMessageTypeIcon(type)}
        <span className="ml-1">{labels[type as keyof typeof labels]}</span>
      </Badge>
    );
  };

  const handleViewMessage = (message: UnifiedMessage) => {
    setSelectedMessage(message);
    setIsDetailDialogOpen(true);
    
    // Mark as read if unread
    if (!message.isRead) {
      markAsReadMutation.mutate({ id: message.id, type: message.type, isRead: true });
    }
  };

  const handleDeleteMessage = (message: UnifiedMessage) => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate({ id: message.id, type: message.type });
    }
  };

  const toggleReadStatus = (message: UnifiedMessage) => {
    markAsReadMutation.mutate({ 
      id: message.id, 
      type: message.type, 
      isRead: !message.isRead 
    });
  };

  const unreadCount = unifiedMessages.filter(m => !m.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Messages</h1>
            <p className="text-muted-foreground">
              Unified view of all contact messages, property inquiries, and home loan requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {unreadCount} Unread
            </Badge>
            <Badge variant="outline">
              {unifiedMessages.length} Total
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Message Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Message Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contact">Contact Messages</SelectItem>
                  <SelectItem value="property-inquiry">Property Inquiries</SelectItem>
                  <SelectItem value="home-loan">Home Loan Requests</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Messages Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subject/Property</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <MessageSquare className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No messages found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMessages.map((message) => (
                      <TableRow 
                        key={`${message.type}-${message.id}`}
                        className={!message.isRead ? "bg-blue-50/50" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                message.isRead ? 'bg-gray-300' : 'bg-blue-500'
                              }`}
                            />
                            <span className="text-xs text-gray-500">
                              {message.isRead ? 'Read' : 'New'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getMessageTypeBadge(message.type)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {message.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {message.email}
                            </div>
                            {message.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {message.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {message.subject && (
                              <p className="font-medium text-sm truncate">{message.subject}</p>
                            )}
                            {message.propertyTitle && (
                              <p className="font-medium text-sm truncate">{message.propertyTitle}</p>
                            )}
                            {message.loanType && (
                              <p className="font-medium text-sm truncate">{message.loanType} Loan</p>
                            )}
                            {message.message && (
                              <p className="text-xs text-gray-600 truncate">{message.message}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(message.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewMessage(message)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleReadStatus(message)}
                              title={message.isRead ? "Mark as unread" : "Mark as read"}
                            >
                              {message.isRead ? 
                                <X className="h-4 w-4" /> : 
                                <Check className="h-4 w-4" />
                              }
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMessage(message)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMessage && getMessageTypeIcon(selectedMessage.type)}
              Message Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                {getMessageTypeBadge(selectedMessage.type)}
                <div className="text-sm text-gray-500">
                  {format(new Date(selectedMessage.createdAt), 'PPpp')}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{selectedMessage.email}</span>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedMessage.phone}</span>
                    </div>
                  )}
                </div>

                {/* Type-specific information */}
                <div className="space-y-2">
                  {selectedMessage.type === 'property-inquiry' && (
                    <>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span>{selectedMessage.propertyTitle}</span>
                      </div>
                      {selectedMessage.budget && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>Budget: ₹{selectedMessage.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}

                  {selectedMessage.type === 'home-loan' && (
                    <>
                      {selectedMessage.loanAmount && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>Loan: ₹{selectedMessage.loanAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedMessage.monthlyIncome && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>Income: ₹{selectedMessage.monthlyIncome.toLocaleString()}/month</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Subject */}
              {selectedMessage.subject && (
                <div>
                  <h4 className="font-medium mb-2">Subject</h4>
                  <p className="text-gray-700">{selectedMessage.subject}</p>
                </div>
              )}

              {/* Message */}
              {selectedMessage.message && (
                <div>
                  <h4 className="font-medium mb-2">Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {selectedMessage.type === 'home-loan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMessage.loanType && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-600">Loan Type</h5>
                      <p>{selectedMessage.loanType}</p>
                    </div>
                  )}
                  {selectedMessage.propertyLocation && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-600">Property Location</h5>
                      <p>{selectedMessage.propertyLocation}</p>
                    </div>
                  )}
                  {selectedMessage.employment && (
                    <div>
                      <h5 className="font-medium text-sm text-gray-600">Employment</h5>
                      <p>{selectedMessage.employment}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => toggleReadStatus(selectedMessage)}
                >
                  {selectedMessage.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteMessage(selectedMessage);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  Delete Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default UnifiedMessagesPage;