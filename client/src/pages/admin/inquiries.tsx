import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2, Search, Mail, Phone, Home, Calendar, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Inquiry, Property } from "@shared/schema";
import { format } from "date-fns";

export default function AdminInquiriesPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewInquiry, setViewInquiry] = useState<Inquiry | null>(null);
  
  // Fetch inquiries
  const { data: inquiries, isLoading: isLoadingInquiries } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
    enabled: !isLoading,
  });
  
  // Fetch properties for reference
  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: !isLoading,
  });
  
  // Check if user is admin
  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin, requireAdmin]);

  if (isLoading || isLoadingInquiries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }
  
  // Filter inquiries based on search term
  const filteredInquiries = inquiries 
    ? inquiries.filter(inquiry => 
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Find property details for an inquiry
  const getPropertyDetails = (propertyId: number) => {
    return properties?.find(property => property.id === propertyId);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Inquiries | Admin | My Dream Property</title>
      </Helmet>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inquiries</h1>
          <p className="text-gray-600">Manage and respond to customer inquiries</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search inquiries..."
            className="pl-10 w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Inquiries</CardTitle>
          <CardDescription>All property inquiries from potential customers</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {inquiries?.length === 0 
                ? "No inquiries yet."
                : "No inquiries matching your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => {
                    const property = getPropertyDetails(inquiry.propertyId);
                    return (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                        <TableCell>{inquiry.email}</TableCell>
                        <TableCell>
                          {property ? (
                            <span className="max-w-[200px] truncate inline-block">
                              {property.title}
                            </span>
                          ) : (
                            <span className="text-gray-400">Unknown Property</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {inquiry.createdAt 
                            ? format(new Date(inquiry.createdAt), 'dd MMM yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewInquiry(inquiry)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inquiry details dialog */}
      {viewInquiry && (
        <Dialog open={!!viewInquiry} onOpenChange={() => setViewInquiry(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
              <DialogDescription>
                View the details of this customer inquiry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex items-start space-x-3">
                <User className="text-gray-400 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-sm">Customer</h3>
                  <p className="text-lg">{viewInquiry.name}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="text-gray-400 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-sm">Email</h3>
                  <p className="text-lg">{viewInquiry.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Home className="text-gray-400 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-sm">Property</h3>
                  <p className="text-lg">
                    {properties?.find(p => p.id === viewInquiry.propertyId)?.title || 'Unknown Property'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="text-gray-400 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-sm">Date Received</h3>
                  <p>
                    {viewInquiry.createdAt
                      ? format(new Date(viewInquiry.createdAt), 'dd MMMM yyyy, h:mm a')
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Message</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="whitespace-pre-line">{viewInquiry.message}</p>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setViewInquiry(null)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    window.location.href = `mailto:${viewInquiry.email}?subject=RE: Your Inquiry about Property&body=Dear ${viewInquiry.name},%0D%0A%0D%0AThank you for your inquiry about the property.%0D%0A%0D%0ABest regards,%0D%0AMy Dream Property Team`;
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Reply by Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}