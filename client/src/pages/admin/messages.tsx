import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Eye, 
  Trash2, 
  MessageSquare, 
  Building, 
  DollarSign,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all message types
  const { data: contactMessages = [], isLoading: loadingContacts } = useQuery({
    queryKey: ["/api/contact-messages"],
  });

  const { data: propertyInquiries = [], isLoading: loadingInquiries } = useQuery({
    queryKey: ["/api/inquiries"],
  });

  const { data: homeLoanInquiries = [], isLoading: loadingLoans } = useQuery({
    queryKey: ["/api/home-loan-inquiries"],
  });

  // Transform data into unified format
  const allMessages = [
    ...(contactMessages as any[]).map((msg) => ({
      ...msg,
      type: 'contact',
      displayType: 'Contact Message'
    })),
    ...(propertyInquiries as any[]).map((inquiry) => ({
      ...inquiry,
      type: 'property',
      displayType: 'Property Inquiry'
    })),
    ...(homeLoanInquiries as any[]).map((loan) => ({
      ...loan,
      type: 'home-loan',
      displayType: 'Home Loan Inquiry',
      message: `Loan: ₹${loan.loanAmount?.toLocaleString() || 'N/A'} | Income: ₹${loan.monthlyIncome?.toLocaleString() || 'N/A'}/month`
    })),
  ];

  // Filter messages
  const filteredMessages = allMessages.filter((msg) => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === "all" || msg.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "read" && msg.isRead) || 
      (statusFilter === "unread" && !msg.isRead);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const isLoading = loadingContacts || loadingInquiries || loadingLoans;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: string }) => {
      const endpoint = type === 'contact' ? 'contact-messages' : 
                     type === 'property' ? 'inquiries' : 'home-loan-inquiries';
      return apiRequest("PATCH", `/api/${endpoint}/${id}/mark-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home-loan-inquiries"] });
      toast({ title: "Message marked as read" });
    },
  });

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: string }) => {
      const endpoint = type === 'contact' ? 'contact-messages' : 
                     type === 'property' ? 'inquiries' : 'home-loan-inquiries';
      return apiRequest("DELETE", `/api/${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home-loan-inquiries"] });
      toast({ title: "Message deleted successfully" });
      setIsDetailDialogOpen(false);
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contact': return <MessageSquare className="h-4 w-4" />;
      case 'property': return <Building className="h-4 w-4" />;
      case 'home-loan': return <DollarSign className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string, displayType: string) => {
    const variants: Record<string, string> = {
      contact: "bg-blue-100 text-blue-800",
      property: "bg-green-100 text-green-800",
      'home-loan': "bg-orange-100 text-orange-800"
    };

    return (
      <Badge className={variants[type] || "bg-gray-100 text-gray-800"}>
        {getTypeIcon(type)}
        <span className="ml-1">{displayType}</span>
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">Loading messages...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Messages Center</h1>
          <div className="text-sm text-muted-foreground">
            Total: {filteredMessages.length} messages
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Message Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="home-loan">Home Loan</SelectItem>
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
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Messages ({filteredMessages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={`${message.type}-${message.id}`} className={!message.isRead ? "bg-blue-50" : ""}>
                    <TableCell>{getTypeBadge(message.type, message.displayType)}</TableCell>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.phone || "N/A"}</TableCell>
                    <TableCell>{format(new Date(message.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={message.isRead ? "secondary" : "destructive"}>
                        {message.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!message.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate({ id: message.id, type: message.type })}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredMessages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No messages found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMessage && getTypeIcon(selectedMessage.type)}
                Message Details
              </DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type:</label>
                    <div className="mt-1">{getTypeBadge(selectedMessage.type, selectedMessage.displayType)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status:</label>
                    <div className="mt-1">
                      <Badge variant={selectedMessage.isRead ? "secondary" : "destructive"}>
                        {selectedMessage.isRead ? "Read" : "Unread"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name:</label>
                    <p className="mt-1">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email:</label>
                    <p className="mt-1">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="text-sm font-medium">Phone:</label>
                      <p className="mt-1">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Date:</label>
                    <p className="mt-1">{format(new Date(selectedMessage.createdAt), "PPP")}</p>
                  </div>
                </div>
                
                {selectedMessage.message && (
                  <div>
                    <label className="text-sm font-medium">Message:</label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedMessage.message}</p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  {!selectedMessage.isRead && (
                    <Button
                      onClick={() => {
                        markAsReadMutation.mutate({ 
                          id: selectedMessage.id, 
                          type: selectedMessage.type 
                        });
                        setIsDetailDialogOpen(false);
                      }}
                      disabled={markAsReadMutation.isPending}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate({ 
                        id: selectedMessage.id, 
                        type: selectedMessage.type 
                      });
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Message
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}