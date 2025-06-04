import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeader } from "@/components/admin/admin-header";
import { useAdmin } from "@/hooks/use-admin";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Search,
  Download,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { exportContactMessagesToExcel } from "@/lib/excel-export";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  propertyId: number;
  property?: {
    title: string;
    id: number;
  };
  createdAt: string;
  isRead: boolean;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export default function ClientManagementPage() {
  const { isAdmin, requireAdmin } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isInquiryDialogOpen, setIsInquiryDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'inquiry' | 'message' } | null>(null);

  // Fetch inquiries
  const {
    data: inquiries,
    isLoading: isLoadingInquiries,
    error: inquiriesError,
  } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
    enabled: !!(isAdmin || activeTab === "inquiries" || activeTab === "all"),
  });

  // Fetch contact messages
  const {
    data: contactMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact-messages"],
    enabled: !!(isAdmin || activeTab === "messages" || activeTab === "all"),
  });

  // Require admin access
  useEffect(() => {
    requireAdmin();
  }, [requireAdmin]);

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }

  // Handle viewing an inquiry
  const handleViewInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsInquiryDialogOpen(true);

    // Mark as read if not already
    if (!inquiry.isRead) {
      try {
        await apiRequest('PATCH', `/api/inquiries/${inquiry.id}/mark-read`, {});
        queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      } catch (error) {
        console.error('Error marking inquiry as read:', error);
      }
    }
  };

  // Handle viewing a message
  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsMessageDialogOpen(true);

    // Mark as read if not already
    if (!message.isRead) {
      try {
        await apiRequest('PATCH', `/api/contact-messages/${message.id}/mark-read`, {});
        queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id: number, type: 'inquiry' | 'message') => {
    setItemToDelete({ id, type });
    setIsConfirmDeleteOpen(true);
  };

  // Handle actual deletion
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const endpoint = itemToDelete.type === 'inquiry' 
        ? `/api/inquiries/${itemToDelete.id}`
        : `/api/contact-messages/${itemToDelete.id}`;

      await apiRequest('DELETE', endpoint, {});
      
      // Close the dialog and refresh data
      setIsConfirmDeleteOpen(false);
      
      // Invalidate the appropriate query
      if (itemToDelete.type === 'inquiry') {
        queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
        if (selectedInquiry?.id === itemToDelete.id) {
          setIsInquiryDialogOpen(false);
        }
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
        if (selectedMessage?.id === itemToDelete.id) {
          setIsMessageDialogOpen(false);
        }
      }

      toast({
        title: "Deleted successfully",
        description: `The ${itemToDelete.type} has been deleted.`,
      });
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete the ${itemToDelete.type}.`,
        variant: "destructive",
      });
    }
  };

  // Filter and search combined data
  const getFilteredData = () => {
    // Prepare data based on activeTab
    let combinedData: Array<{ type: 'inquiry' | 'message', data: any }> = [];
    
    if (activeTab === 'inquiries' || activeTab === 'all') {
      const inquiriesData = inquiries || [];
      combinedData = [
        ...combinedData,
        ...inquiriesData.map(item => ({ type: 'inquiry' as const, data: item }))
      ];
    }
    
    if (activeTab === 'messages' || activeTab === 'all') {
      const messagesData = contactMessages || [];
      combinedData = [
        ...combinedData,
        ...messagesData.map(item => ({ type: 'message' as const, data: item }))
      ];
    }

    // Apply read/unread filter
    if (filterType === 'read') {
      combinedData = combinedData.filter(item => item.data.isRead);
    } else if (filterType === 'unread') {
      combinedData = combinedData.filter(item => !item.data.isRead);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      combinedData = combinedData.filter(item => {
        const data = item.data;
        return (
          data.name.toLowerCase().includes(query) ||
          data.email.toLowerCase().includes(query) ||
          (data.phone && data.phone.toLowerCase().includes(query)) ||
          data.message.toLowerCase().includes(query) ||
          (item.type === 'message' && data.subject.toLowerCase().includes(query))
        );
      });
    }

    // Sort by date (newest first)
    combinedData.sort((a, b) => {
      const dateA = new Date(a.data.createdAt);
      const dateB = new Date(b.data.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return combinedData;
  };

  const filteredData = getFilteredData();

  // Export to CSV
  const exportToCSV = () => {
    const data = getFilteredData();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "Type,ID,Name,Email,Phone,Message,Subject,Date,Status\n";
    
    // Data
    data.forEach(item => {
      const row = [
        item.type,
        item.data.id,
        item.data.name,
        item.data.email,
        item.data.phone || 'N/A',
        `"${item.data.message.replace(/"/g, '""')}"`,
        item.type === 'message' ? `"${item.data.subject.replace(/"/g, '""')}"` : 'N/A',
        item.data.createdAt,
        item.data.isRead ? 'Read' : 'Unread'
      ];
      csvContent += row.join(',') + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `client-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Client Management | Admin | My Dream Property</title>
      </Helmet>

      <AdminHeader 
        title="Client Management" 
        description="View and manage all client communications including inquiries and contact messages"
      />

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Client Communications</CardTitle>
              <CardDescription>
                Manage all client communications in one place
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-64 rounded-l-md rounded-r-none"
                />
                <Button variant="outline" className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Filter Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => {
                  if (activeTab === 'messages') {
                    exportContactMessagesToExcel(contactMessages || []);
                  } else if (activeTab === 'inquiries') {
                    window.location.href = '/admin/inquiries';
                  } else {
                    // Export contact messages for all tab
                    exportContactMessagesToExcel(contactMessages || []);
                  }
                }} 
                variant="outline"
                disabled={
                  activeTab === 'messages' 
                    ? (!contactMessages || contactMessages.length === 0)
                    : activeTab === 'inquiries'
                    ? (!inquiries || inquiries.length === 0)
                    : (!contactMessages || contactMessages.length === 0)
                }
              >
                <Download className="mr-2 h-4 w-4" />
                {activeTab === 'messages' ? 'Export Messages' : activeTab === 'inquiries' ? 'Export Inquiries' : 'Export Data'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="px-6">
                All Communications
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="px-6">
                Property Inquiries
              </TabsTrigger>
              <TabsTrigger value="messages" className="px-6">
                Contact Messages
              </TabsTrigger>
            </TabsList>

            {/* Content for all tabs */}
            <TabsContent value="all" className="mt-0">
              <ClientTable 
                data={filteredData}
                onView={(item) => {
                  if (item.type === 'inquiry') {
                    handleViewInquiry(item.data);
                  } else {
                    handleViewMessage(item.data);
                  }
                }}
                onDelete={(item) => handleDeleteConfirm(item.data.id, item.type)}
                isLoading={isLoadingInquiries || isLoadingMessages}
                error={inquiriesError || messagesError}
              />
            </TabsContent>

            <TabsContent value="inquiries" className="mt-0">
              <ClientTable 
                data={filteredData.filter(item => item.type === 'inquiry')}
                onView={(item) => handleViewInquiry(item.data)}
                onDelete={(item) => handleDeleteConfirm(item.data.id, item.type)}
                isLoading={isLoadingInquiries}
                error={inquiriesError}
              />
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <div className="mb-4 flex justify-end">
                <Button 
                  onClick={() => exportContactMessagesToExcel(contactMessages || [])} 
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!contactMessages || contactMessages.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export Contact Messages to Excel
                </Button>
              </div>
              <ClientTable 
                data={filteredData.filter(item => item.type === 'message')}
                onView={(item) => handleViewMessage(item.data)}
                onDelete={(item) => handleDeleteConfirm(item.data.id, item.type)}
                isLoading={isLoadingMessages}
                error={messagesError}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Inquiry Detail Dialog */}
      <Dialog open={isInquiryDialogOpen} onOpenChange={setIsInquiryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Property Inquiry #{selectedInquiry.id}</span>
                  <Badge variant={selectedInquiry.isRead ? "outline" : "default"}>
                    {selectedInquiry.isRead ? "Read" : "New"}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Inquiry details and client information
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      Client Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {selectedInquiry.name}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Email:</span> 
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-500" />
                          <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                            {selectedInquiry.email}
                          </a>
                        </div>
                      </div>
                      {selectedInquiry.phone && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Phone:</span>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />
                            <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">
                              {selectedInquiry.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Date:</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {new Date(selectedInquiry.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                      Inquiry Message
                    </h3>
                    <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-gray-700">
                      {selectedInquiry.message}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Property Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Property ID:</span> {selectedInquiry.propertyId}
                      </div>
                      {selectedInquiry.property && (
                        <div>
                          <span className="font-medium">Title:</span> {selectedInquiry.property.title}
                        </div>
                      )}
                      <div className="mt-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/properties/${selectedInquiry.propertyId}`} target="_blank" rel="noopener noreferrer">
                            View Property
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline">
                        <a href={`mailto:${selectedInquiry.email}?subject=Re: Property Inquiry&body=Dear ${selectedInquiry.name},%0D%0A%0D%0AThank you for your inquiry about our property.%0D%0A%0D%0A`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Reply by Email
                        </a>
                      </Button>
                      {selectedInquiry.phone && (
                        <Button asChild variant="outline">
                          <a href={`tel:${selectedInquiry.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Client
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setIsInquiryDialogOpen(false);
                          handleDeleteConfirm(selectedInquiry.id, 'inquiry');
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Inquiry
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInquiryDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Message Detail Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Contact Message #{selectedMessage.id}</span>
                  <Badge variant={selectedMessage.isRead ? "outline" : "default"}>
                    {selectedMessage.isRead ? "Read" : "New"}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Contact message details and client information
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      Client Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {selectedMessage.name}
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Email:</span> 
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-500" />
                          <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                            {selectedMessage.email}
                          </a>
                        </div>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Phone:</span>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />
                            <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                              {selectedMessage.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Date:</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Subject:</span> {selectedMessage.subject}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                      Message Content
                    </h3>
                    <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-gray-700">
                      {selectedMessage.message}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline">
                        <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}&body=Dear ${selectedMessage.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0A`}>
                          <Mail className="mr-2 h-4 w-4" />
                          Reply by Email
                        </a>
                      </Button>
                      {selectedMessage.phone && (
                        <Button asChild variant="outline">
                          <a href={`tel:${selectedMessage.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Client
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setIsMessageDialogOpen(false);
                          handleDeleteConfirm(selectedMessage.id, 'message');
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Reusable client table component
function ClientTable({ 
  data, 
  onView, 
  onDelete, 
  isLoading, 
  error 
}: { 
  data: Array<{type: 'inquiry' | 'message', data: any}>;
  onView: (item: {type: 'inquiry' | 'message', data: any}) => void;
  onDelete: (item: {type: 'inquiry' | 'message', data: any}) => void;
  isLoading: boolean;
  error: any;
}) {
  // Helper to get time ago string
  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading data: {error.message || "Unknown error"}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        No communications found matching your criteria
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Client communications list</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow 
            key={`${item.type}-${item.data.id}`}
            className={!item.data.isRead ? "bg-primary/5" : ""}
          >
            <TableCell>
              <Badge variant="outline">
                {item.type === 'inquiry' ? 'Property Inquiry' : 'Contact Message'}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{item.data.name}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" /> 
                  <a 
                    href={`mailto:${item.data.email}`} 
                    className="text-primary hover:underline text-sm"
                  >
                    {item.data.email}
                  </a>
                </div>
                {item.data.phone && (
                  <div className="flex items-center mt-1">
                    <Phone className="h-3 w-3 mr-1" /> 
                    <a 
                      href={`tel:${item.data.phone}`} 
                      className="text-primary hover:underline text-sm"
                    >
                      {item.data.phone}
                    </a>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {item.type === 'message' ? (
                <div>
                  <div className="font-medium text-sm">{item.data.subject}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">
                    {item.data.message}
                  </div>
                </div>
              ) : (
                <div className="text-sm truncate max-w-[200px]">
                  {item.data.message}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm text-gray-500" title={new Date(item.data.createdAt).toLocaleString()}>
                {getTimeAgo(item.data.createdAt)}
              </div>
            </TableCell>
            <TableCell>
              {item.data.isRead ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Read</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span>Unread</span>
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onView(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}