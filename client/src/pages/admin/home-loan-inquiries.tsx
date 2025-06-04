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
  MapPin, 
  DollarSign, 
  Building, 
  User,
  Briefcase,
  Calendar,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreHorizontal
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
import { exportHomeLoanInquiriesToExcel } from "@/lib/excel-export";
import { apiRequest } from "@/lib/queryClient";

interface HomeLoanInquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  loanType: string;
  loanAmount: number;
  propertyLocation: string;
  monthlyIncome: number;
  employment: string;
  isRead: boolean;
  createdAt: string;
}

const loanTypeLabels: Record<string, string> = {
  "home-purchase": "Home Purchase Loan",
  "home-construction": "Home Construction Loan",
  "home-improvement": "Home Improvement Loan",
  "balance-transfer": "Balance Transfer",
  "top-up": "Top-up Loan",
};

const employmentLabels: Record<string, string> = {
  "salaried": "Salaried",
  "self-employed-business": "Self Employed - Business",
  "self-employed-professional": "Self Employed - Professional",
  "pensioner": "Pensioner",
};

export default function AdminHomeLoanInquiriesPage() {
  const [selectedInquiry, setSelectedInquiry] = useState<HomeLoanInquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "read" | "unread">("all");
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading, error } = useQuery<HomeLoanInquiry[]>({
    queryKey: ['/api/home-loan-inquiries'],
    queryFn: async () => {
      const response = await fetch('/api/home-loan-inquiries');
      if (!response.ok) {
        throw new Error('Failed to fetch home loan inquiries');
      }
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/home-loan-inquiries/${id}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/home-loan-inquiries'] });
      toast({
        title: "Success",
        description: "Inquiry marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark inquiry as read",
        variant: "destructive",
      });
    },
  });

  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/home-loan-inquiries/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/home-loan-inquiries'] });
      setSelectedInquiry(null);
      setIsDialogOpen(false);
      setItemToDelete(null);
      toast({
        title: "Success",
        description: "Home loan inquiry deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete home loan inquiry",
        variant: "destructive",
      });
    },
  });

  const handleView = (inquiry: HomeLoanInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDialogOpen(true);
    if (!inquiry.isRead) {
      markAsReadMutation.mutate(inquiry.id);
    }
  };

  const handleDeleteConfirm = (id: number) => {
    setItemToDelete({ id, type: 'home-loan-inquiry' });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteInquiryMutation.mutate(itemToDelete.id);
    }
  };

  // Filter and search functionality
  const getFilteredInquiries = () => {
    let filtered = inquiries;

    // Apply read/unread filter
    if (filterType === 'read') {
      filtered = filtered.filter(inquiry => inquiry.isRead);
    } else if (filterType === 'unread') {
      filtered = filtered.filter(inquiry => !inquiry.isRead);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inquiry =>
        inquiry.name.toLowerCase().includes(query) ||
        inquiry.email.toLowerCase().includes(query) ||
        inquiry.phone.toLowerCase().includes(query) ||
        inquiry.propertyLocation.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredInquiries = getFilteredInquiries();

  if (isLoading) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Home Loan Inquiries | Admin | My Dream Property</title>
        </Helmet>
        <AdminHeader 
          title="Home Loan Inquiries" 
          description="Manage home loan inquiry submissions" 
        />
        <div className="text-center py-8">Loading...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Home Loan Inquiries | Admin | My Dream Property</title>
        </Helmet>
        <AdminHeader 
          title="Home Loan Inquiries" 
          description="Manage home loan inquiry submissions" 
        />
        <div className="text-center py-8 text-red-500">Error loading inquiries</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Home Loan Inquiries | Admin | My Dream Property</title>
      </Helmet>

      <AdminHeader 
        title="Home Loan Inquiries" 
        description="View and manage home loan inquiry submissions from the website"
      />

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Home Loan Inquiries</CardTitle>
              <CardDescription>
                Manage all home loan inquiries in one place
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex">
                <Input
                  placeholder="Search by name, email, or location..."
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
                  <SelectItem value="all">All Inquiries</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => exportHomeLoanInquiriesToExcel(inquiries)} 
                variant="outline"
                className="flex items-center gap-2"
                disabled={inquiries.length === 0}
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || filterType !== 'all' 
                ? "No inquiries found matching your criteria" 
                : "No home loan inquiries found"
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Loan Details</TableHead>
                  <TableHead>Property Location</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{inquiry.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {inquiry.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{inquiry.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{inquiry.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="font-medium">
                          {loanTypeLabels[inquiry.loanType] || inquiry.loanType}
                        </div>
                        <div className="text-muted-foreground">
                          ₹{inquiry.loanAmount.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{inquiry.propertyLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>{employmentLabels[inquiry.employment] || inquiry.employment}</div>
                        <div className="text-muted-foreground">
                          ₹{inquiry.monthlyIncome.toLocaleString()}/month
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={inquiry.isRead ? "secondary" : "destructive"}>
                        {inquiry.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
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
                            onClick={() => handleView(inquiry)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {!inquiry.isRead && (
                            <DropdownMenuItem 
                              onClick={() => markAsReadMutation.mutate(inquiry.id)}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteConfirm(inquiry.id)}
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

      {/* Inquiry Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Home Loan Inquiry #{selectedInquiry.id}</span>
                  <Badge variant={selectedInquiry.isRead ? "outline" : "default"}>
                    {selectedInquiry.isRead ? "Read" : "New"}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDistanceToNow(new Date(selectedInquiry.createdAt), { addSuffix: true })} 
                  on {format(new Date(selectedInquiry.createdAt), 'MMMM dd, yyyy at h:mm a')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Name</p>
                          <p className="text-sm text-muted-foreground">{selectedInquiry.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{selectedInquiry.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">{selectedInquiry.email}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Loan Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Loan Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Loan Type</p>
                          <p className="text-sm text-muted-foreground">
                            {loanTypeLabels[selectedInquiry.loanType] || selectedInquiry.loanType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Loan Amount</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{selectedInquiry.loanAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Property Location</p>
                          <p className="text-sm text-muted-foreground">{selectedInquiry.propertyLocation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employment & Financial Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Employment & Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Employment Type</p>
                          <p className="text-sm text-muted-foreground">
                            {employmentLabels[selectedInquiry.employment] || selectedInquiry.employment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Monthly Income</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{selectedInquiry.monthlyIncome.toLocaleString()}
                          </p>
                        </div>
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
                            {format(new Date(selectedInquiry.createdAt), 'MMMM dd, yyyy at h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedInquiry.isRead ? "Read" : "Unread"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2 pt-4">
                {!selectedInquiry.isRead && (
                  <Button
                    onClick={() => markAsReadMutation.mutate(selectedInquiry.id)}
                    disabled={markAsReadMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Read
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteConfirm(selectedInquiry.id)}
                  disabled={deleteInquiryMutation.isPending}
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
            <AlertDialogTitle>Delete Home Loan Inquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this home loan inquiry? This action cannot be undone.
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