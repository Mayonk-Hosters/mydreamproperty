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
  IndianRupee, 
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
  DialogTrigger,
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

  const { data: inquiries = [], isLoading } = useQuery<HomeLoanInquiry[]>({
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
      const response = await fetch(`/api/home-loan-inquiries/${id}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) {
        throw new Error('Failed to mark inquiry as read');
      }
      return response.json();
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
      const response = await fetch(`/api/home-loan-inquiries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/home-loan-inquiries'] });
      toast({
        title: "Success",
        description: "Inquiry deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete inquiry",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      deleteInquiryMutation.mutate(id);
    }
  };

  const InquiryDetailsDialog = ({ inquiry }: { inquiry: HomeLoanInquiry }) => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Home Loan Inquiry Details
        </DialogTitle>
        <DialogDescription>
          Submitted on {format(new Date(inquiry.createdAt), 'PPP')} at {format(new Date(inquiry.createdAt), 'p')}
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
                  <p className="text-sm text-muted-foreground">{inquiry.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{inquiry.email}</p>
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
                    {loanTypeLabels[inquiry.loanType] || inquiry.loanType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Loan Amount</p>
                  <p className="text-sm text-muted-foreground">₹{inquiry.loanAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Property Location</p>
                  <p className="text-sm text-muted-foreground">{inquiry.propertyLocation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Employment Type</p>
                  <p className="text-sm text-muted-foreground">
                    {employmentLabels[inquiry.employment] || inquiry.employment}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Monthly Income</p>
                  <p className="text-sm text-muted-foreground">₹{inquiry.monthlyIncome.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {!inquiry.isRead && (
            <Button
              onClick={() => handleMarkAsRead(inquiry.id)}
              disabled={markAsReadMutation.isPending}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Mark as Read
            </Button>
          )}
          <Button
            onClick={() => handleDelete(inquiry.id)}
            disabled={deleteInquiryMutation.isPending}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader 
          title="Home Loan Inquiries" 
          description="Manage home loan inquiry submissions" 
        />
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setLocation('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>
      </div>
      
      <AdminHeader 
        title="Home Loan Inquiries" 
        description="Manage home loan inquiry submissions from the website" 
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle>Recent Inquiries</CardTitle>
              <CardDescription>
                {inquiries.length} total inquiries
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No home loan inquiries found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{inquiry.phone}</div>
                        <div className="text-muted-foreground">{inquiry.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {loanTypeLabels[inquiry.loanType] || inquiry.loanType}
                    </TableCell>
                    <TableCell>₹{inquiry.loanAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={inquiry.isRead ? "secondary" : "destructive"}>
                        {inquiry.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(inquiry.createdAt), 'h:mm a')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInquiry(inquiry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedInquiry && selectedInquiry.id === inquiry.id && (
                            <InquiryDetailsDialog inquiry={selectedInquiry} />
                          )}
                        </Dialog>
                        
                        {!inquiry.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(inquiry.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(inquiry.id)}
                          disabled={deleteInquiryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}