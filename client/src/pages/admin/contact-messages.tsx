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
import { useNotifications } from "@/hooks/use-notifications";

export default function AdminContactMessagesPage() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  
  const {
    contactMessages,
    isLoading,
    markAsRead,
    isMarkingAsRead,
    deleteMessage,
    isDeleting
  } = useContactMessages();
  
  const { markAllAsRead } = useNotifications();
  
  // Mark all messages as read when visiting this page
  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);
  
  const unreadMessages = contactMessages.filter(msg => !msg.isRead);
  const readMessages = contactMessages.filter(msg => msg.isRead);
  
  const displayMessages = selectedTab === "all" 
    ? contactMessages 
    : selectedTab === "unread" 
      ? unreadMessages 
      : readMessages;
  
  // Sort messages by date (newest first)
  const sortedMessages = [...displayMessages].sort((a, b) => 
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  {unreadMessages.length} unread messages
                </CardDescription>
                <Tabs 
                  value={selectedTab} 
                  onValueChange={setSelectedTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="all">
                      All ({contactMessages.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread">
                      Unread ({unreadMessages.length})
                    </TabsTrigger>
                    <TabsTrigger value="read">
                      Read ({readMessages.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sortedMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No messages found
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {sortedMessages.map((message) => (
                        <Card 
                          key={message.id} 
                          className={`cursor-pointer hover:bg-accent ${
                            selectedMessage?.id === message.id ? "border-primary" : ""
                          }`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{message.name}</h3>
                                {!message.isRead && (
                                  <Badge variant="outline" className="bg-primary text-primary-foreground">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(message.createdAt), "MMM d, yyyy")}
                              </div>
                            </div>
                            <p className="text-sm font-medium">
                              {message.subject}
                            </p>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground truncate">
                              {message.message}
                            </p>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between">
                            <div className="text-xs text-muted-foreground">
                              {message.email}
                            </div>
                            <div className="flex gap-2">
                              {!message.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(message.id);
                                  }}
                                  disabled={isMarkingAsRead}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(message.id);
                                }}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {selectedMessage.isRead ? (
                        <MailOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Mail className="h-5 w-5 text-primary" />
                      )}
                      <div>
                        <CardTitle>{selectedMessage.subject}</CardTitle>
                        <CardDescription>
                          From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(selectedMessage.createdAt), "PPpp")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-4" />
                  <ScrollArea className="h-[400px]">
                    <div className="whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    {!selectedMessage.isRead && (
                      <Button
                        variant="outline"
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        disabled={isMarkingAsRead}
                      >
                        {isMarkingAsRead && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mark as Read
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedMessage.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Message
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex justify-center items-center">
                <CardContent className="text-center py-16">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No message selected</h3>
                  <p className="text-muted-foreground">
                    Select a message from the list to view its contents
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}