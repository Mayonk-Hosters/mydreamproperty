import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, EyeOff, Mail, Phone, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MessagesLayout } from "@/components/admin/messages-layout";
import { Helmet } from "react-helmet";

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

export default function ContactMessagesPage() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/contact-messages'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contact-messages/${id}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      toast({ title: "Success", description: "Contact message marked as read" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      toast({ title: "Success", description: "Contact message deleted successfully" });
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(messages.map((message: ContactMessage) => message.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectMessage = (id: number, checked: boolean) => {
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
      toast({ title: "Success", description: "Selected contact messages deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete contact messages", variant: "destructive" });
    }
  };

  const unreadCount = messages.filter((message: ContactMessage) => !message.isRead).length;

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
        <title>Contact Messages | Admin | My Dream Property</title>
      </Helmet>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Messages</h2>
            <div className="text-gray-600 text-sm mt-1 flex items-center gap-2">
              <span>Manage general contact form submissions from website visitors</span>
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>
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

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contact messages yet</h3>
            <p className="text-gray-500 text-center">
              Contact messages from the website contact form will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === messages.length}
                onCheckedChange={handleSelectAll}
              />
              Contact Messages ({messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.map((message: ContactMessage) => (
              <div
                key={message.id}
                className={`p-4 border rounded-lg transition-all ${
                  message.isRead 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-blue-200 bg-blue-50 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedIds.includes(message.id)}
                      onCheckedChange={(checked) => handleSelectMessage(message.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{message.name}</h3>
                        {!message.isRead && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{message.email}</span>
                        </div>
                        {message.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{message.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">Subject:</h4>
                        <p className="text-gray-700">{message.subject}</p>
                      </div>
                      
                      <div className="p-3 bg-gray-100 rounded text-sm">
                        <strong>Message:</strong>
                        <p className="mt-1 whitespace-pre-wrap">{message.message}</p>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Received on {format(new Date(message.createdAt), "PPP 'at' p")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!message.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(message.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(message.id)}
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