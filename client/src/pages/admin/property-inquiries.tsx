import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, EyeOff, Mail, Phone, MessageSquare, IndianRupee, Download } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MessagesLayout } from "@/components/admin/messages-layout";
import { Helmet } from "react-helmet";
import * as XLSX from 'xlsx';

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

export default function PropertyInquiriesPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: inquiries = [], isLoading, refetch } = useQuery<PropertyInquiry[]>({
    queryKey: ['/api/inquiries'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/inquiries/${id}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      toast({ title: "Success", description: "Property inquiry marked as read" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      toast({ title: "Success", description: "Property inquiry deleted successfully" });
    },
  });

  const handleExportToExcel = async () => {
    try {
      const response = await fetch("/api/export/property-inquiries", {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      
      const data = await response.json();
      
      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Property Inquiries");
      
      // Generate filename with current date
      const filename = `property-inquiries-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      toast({ 
        title: "Success", 
        description: "Property inquiries exported to Excel successfully" 
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to export property inquiries", 
        variant: "destructive" 
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(inquiries.map((inquiry) => inquiry.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectInquiry = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteMutation.mutateAsync(id)));
      setSelectedIds([]);
      toast({ title: "Success", description: "Selected property inquiries deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete property inquiries", variant: "destructive" });
    }
  };

  const unreadCount = inquiries.filter((inquiry) => !inquiry.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <MessagesLayout
      title="Messages Management"
      description="Manage all customer communications including property inquiries, contact messages, and home loan requests"
    >
      <Helmet>
        <title>Property Inquiries | Admin | My Dream Property</title>
      </Helmet>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Property Inquiries</h2>
            <p className="text-gray-600 text-sm mt-1">
              Manage property-specific inquiries from potential buyers
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportToExcel}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No property inquiries yet</h3>
            <p className="text-gray-500 text-center">
              Property inquiries will appear here when potential buyers express interest in specific properties.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Checkbox
                checked={inquiries.length > 0 && selectedIds.length === inquiries.length}
                onCheckedChange={handleSelectAll}
              />
              Property Inquiries ({inquiries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`p-4 border rounded-lg transition-all ${
                  inquiry.isRead 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-blue-200 bg-blue-50 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedIds.includes(inquiry.id)}
                      onCheckedChange={(checked) => handleSelectInquiry(inquiry.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
                        {!inquiry.isRead && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {inquiry.inquiryType}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{inquiry.email}</span>
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{inquiry.phone}</span>
                          </div>
                        )}
                        {inquiry.budget && (
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            <span>Budget: ₹{inquiry.budget.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Property ID: {inquiry.propertyId}</span>
                        </div>
                      </div>
                      
                      {inquiry.message && (
                        <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                          <strong>Message:</strong>
                          <p className="mt-1">{inquiry.message}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Received on {format(new Date(inquiry.createdAt), "PPP 'at' p")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!inquiry.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(inquiry.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(inquiry.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      </div>
    </MessagesLayout>
  );
}