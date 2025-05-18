import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useContactMessages, type ContactMessage } from "@/hooks/use-contact-messages";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Trash2, Check, Mail, MailOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationIndicators } from "@/hooks/use-notification-indicators";
import { useToast } from "@/hooks/use-toast";

export default function AdminContactMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();
  
  const {
    contactMessages,
    isLoading,
    markAsRead,
    isMarkingAsRead,
    deleteMessage,
    isDeleting
  } = useContactMessages();
  
  const { markMessagesAsRead } = useNotificationIndicators();
  
  // Mark all messages as read when visiting this page and when selecting a message
  useEffect(() => {
    // Only mark all as read when the page loads
    if (contactMessages.length > 0) {
      markMessagesAsRead();
    }
  }, [contactMessages.length, markMessagesAsRead]);
  
  // When a message is selected, mark it as read
  useEffect(() => {
    if (selectedMessage && !selectedMessage.isRead) {
      // Use markAsRead directly since it exists in the component scope
      markAsRead(selectedMessage.id);
      
      // Update the local state to reflect the change immediately
      setSelectedMessage({
        ...selectedMessage,
        isRead: true
      });
    }
  }, [selectedMessage, markAsRead]);
  
  // Sort messages by date (newest first)
  const sortedMessages = [...contactMessages].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
    if (selectedMessage && selectedMessage.id === id) {
      // Update the local state to reflect the change immediately
      setSelectedMessage({
        ...selectedMessage,
        isRead: true
      });
    }
  };
  
  const handleDelete = (id: number) => {
    deleteMessage(id);
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Contact Messages</h1>
            <p className="text-muted-foreground mt-1">
              Manage messages from the contact form
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Simplified Message List */}
          <div className="md:col-span-1">
            <div className="bg-card border rounded-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Messages</h2>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages found
                </div>
              ) : (
                <div className="divide-y max-h-[600px] overflow-auto">
                  {sortedMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                        selectedMessage?.id === message.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{message.name}</h3>
                          {!message.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(message.createdAt), "MMM d")}
                        </div>
                      </div>
                      <p className="font-medium text-sm truncate">{message.subject}</p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {message.message}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {message.email}
                        </div>
                        <div className="flex gap-1">
                          {!message.isRead && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(message.id);
                              }}
                              disabled={isMarkingAsRead}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(message.id);
                            }}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Simplified Message Detail */}
          <div className="md:col-span-2">
            {selectedMessage ? (
              <div className="bg-card border rounded-lg h-full">
                <div className="p-4 border-b flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedMessage.subject}</h2>
                    <div className="text-sm">
                      From: <span className="font-medium">{selectedMessage.name}</span>
                      <span className="text-muted-foreground"> &lt;{selectedMessage.email}&gt;</span>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span>Phone:</span>
                        <button 
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded hover:bg-muted/80 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMessage.phone || "");
                            toast({
                              title: "Phone number copied",
                              description: "The phone number has been copied to your clipboard.",
                              duration: 2000,
                            });
                          }}
                        >
                          {selectedMessage.phone}
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(selectedMessage.createdAt), "PPpp")}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!selectedMessage.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        disabled={isMarkingAsRead}
                      >
                        {isMarkingAsRead ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(selectedMessage.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="p-4 h-[500px] overflow-auto">
                  <div className="whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card border rounded-lg h-full flex flex-col justify-center items-center p-10">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No message selected</h3>
                <p className="text-muted-foreground text-center">
                  Select a message from the list to view its contents
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}