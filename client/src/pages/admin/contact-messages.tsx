import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Helmet } from "react-helmet";
import { 
  Eye, 
  Trash2, 
  Check, 
  Mail, 
  Phone, 
  User,
  Calendar,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  MessageSquare
} from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/admin-layout";
import { exportContactMessagesToExcel } from "@/lib/excel-export";
import { apiRequest } from "@/lib/queryClient";

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

export default function AdminContactMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "read" | "unread">("all");
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contactMessages = [], isLoading, error } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
    queryFn: async () => {
      const response = await fetch('/api/contact-messages');
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('/api/contact-messages/mark-read', {
        method: 'PATCH',
        body: JSON.stringify({ messageId: id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      toast({
        title: "Success",
        description: "Message marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/contact-messages/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      setSelectedMessage(null);
      setIsDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Success",
        description: "Contact message deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact message",
        variant: "destructive",
      });
    },
  });

  const handleView = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleDeleteConfirm = (id: number) => {
    setItemToDelete({ id, type: 'contact-message' });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMessageMutation.mutate(itemToDelete.id);
    }
  };

  const handleExportExcel = () => {
    if (contactMessages && contactMessages.length > 0) {
      exportContactMessagesToExcel(contactMessages);
      toast({
        title: "Success",
        description: "Contact messages exported to Excel successfully",
      });
    }
  };

  // Filter and search functionality
  const getFilteredMessages = () => {
    let filtered = contactMessages;

    // Apply read/unread filter
    if (filterType === 'read') {
      filtered = filtered.filter(message => message.isRead);
    } else if (filterType === 'unread') {
      filtered = filtered.filter(message => !message.isRead);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(query) ||
        message.email.toLowerCase().includes(query) ||
        message.subject.toLowerCase().includes(query) ||
        message.message.toLowerCase().includes(query) ||
        (message.phone && message.phone.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredMessages = getFilteredMessages();

  if (isLoading) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Contact Messages | Admin | My Dream Property</title>
        </Helmet>
        <AdminHeader 
          title="Contact Messages" 
          description="Manage contact messages from website visitors" 
        />
        <div className="text-center py-8">Loading...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Contact Messages | Admin | My Dream Property</title>
        </Helmet>
        <AdminHeader 
          title="Contact Messages" 
          description="Manage contact messages from website visitors" 
        />
        <div className="text-center py-8 text-red-500">Error loading contact messages</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Contact Messages | Admin | My Dream Property</title>
      </Helmet>

      <AdminHeader 
        title="Contact Messages" 
        description="View and manage contact messages from website visitors"
      />

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>
                Manage all contact messages from the website
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex">
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-64 rounded-l-md rounded-r-none"
                />
                <Button variant="outline" className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select value={filterType} onValueChange={(value: "all" | "read" | "unread") => setFilterType(value)}>
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
                onClick={handleExportExcel}
                variant="outline"
                className="flex items-center gap-2"
                disabled={contactMessages.length === 0}
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || filterType !== 'all' 
                ? "No messages found matching your criteria" 
                : "No contact messages found"
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {message.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{message.email}</span>
                        </div>
                        {message.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{message.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{message.subject}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {message.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={message.isRead ? "secondary" : "destructive"}>
                        {message.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(message.createdAt), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => handleView(message)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {!message.isRead && (
                            <DropdownMenuItem 
                              onClick={() => markAsReadMutation.mutate(message.id)}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteConfirm(message.id)}
                            className="flex items-center gap-2 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  Received {formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })} 
                  on {format(new Date(selectedMessage.createdAt), 'MMMM dd, yyyy at h:mm a')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Name</p>
                          <p className="text-sm text-muted-foreground">{selectedMessage.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                        </div>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{selectedMessage.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Message Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Subject</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {selectedMessage.subject}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Message</p>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">
                        {selectedMessage.message}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submission Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Submission Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Submitted On</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedMessage.createdAt), 'MMMM dd, yyyy at h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedMessage.isRead ? "Read" : "Unread"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2 pt-4">
                {!selectedMessage.isRead && (
                  <Button
                    onClick={() => markAsReadMutation.mutate(selectedMessage.id)}
                    disabled={markAsReadMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Read
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteConfirm(selectedMessage.id)}
                  disabled={deleteMessageMutation.isPending}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}