import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContactMessages, type ContactMessage } from "@/hooks/use-contact-messages";
import { Loader2, Phone, Mail, MessageSquare } from "lucide-react";

export default function MessageDashboardPage() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "all">("7days");
  const [todayMessages, setTodayMessages] = useState<ContactMessage[]>([]);
  const [messagesWithPhone, setMessagesWithPhone] = useState(0);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messagesRead, setMessagesRead] = useState(0);
  
  const { contactMessages, isLoading } = useContactMessages();
  
  useEffect(() => {
    processData();
  }, [contactMessages, timeRange]);
  
  const processData = () => {
    if (!contactMessages || !Array.isArray(contactMessages)) {
      setTodayMessages([]);
      setMessagesWithPhone(0);
      setMessagesTotal(0);
      setMessagesRead(0);
      return;
    }
    
    // Count today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMsgs = contactMessages.filter(msg => {
      if (!msg.createdAt) return false;
      try {
        const msgDate = new Date(msg.createdAt);
        return msgDate.toDateString() === today.toDateString();
      } catch (e) {
        return false;
      }
    });
    
    // Count messages with phone numbers
    const withPhone = contactMessages.filter(msg => 
      msg.phone && msg.phone.trim() !== ''
    ).length;
    
    // Count read messages
    const read = contactMessages.filter(msg => msg.isRead).length;
    
    // Update state
    setTodayMessages(todayMsgs);
    setMessagesWithPhone(withPhone);
    setMessagesTotal(contactMessages.length);
    setMessagesRead(read);
  };
  
  // Navigate to view a specific message
  const handleMessageClick = (id: number) => {
    window.location.href = `/admin/contact-messages?message=${id}`;
  };
  
  // Calculate percentage safely
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };
  
  // Format date like "May 15, 2023"
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Message Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze your contact form messages
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={timeRange === "7days" ? "default" : "outline"}
              onClick={() => setTimeRange("7days")}
              type="button"
            >
              Last 7 Days
            </Button>
            <Button
              variant={timeRange === "30days" ? "default" : "outline"}
              onClick={() => setTimeRange("30days")}
              type="button"
            >
              Last 30 Days
            </Button>
            <Button
              variant={timeRange === "all" ? "default" : "outline"}
              onClick={() => setTimeRange("all")}
              type="button"
            >
              All Time
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total Messages */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messagesTotal}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeRange === "7days" ? "Last 7 days" : 
                     timeRange === "30days" ? "Last 30 days" : 
                     "All time"}
                  </p>
                </CardContent>
              </Card>
              
              {/* Today's Messages */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Messages Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayMessages.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(new Date())}
                  </p>
                </CardContent>
              </Card>
              
              {/* Read Rate */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Read Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculatePercentage(messagesRead, messagesTotal)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {messagesRead} of {messagesTotal} messages
                  </p>
                </CardContent>
              </Card>
              
              {/* Phone Numbers */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Messages with Phone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculatePercentage(messagesWithPhone, messagesTotal)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {messagesWithPhone} of {messagesTotal} messages
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Today's Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Messages</CardTitle>
                <CardDescription>
                  Messages received today ({formatDate(new Date())})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-1">No Messages Today</h3>
                    <p className="text-muted-foreground">
                      You haven't received any contact messages today.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayMessages.map((message) => (
                      <Card 
                        key={message.id} 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleMessageClick(message.id)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{message.subject}</CardTitle>
                            <div className="text-xs text-muted-foreground">
                              {message.createdAt ? 
                                new Date(message.createdAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                }) : "--:--"}
                            </div>
                          </div>
                          <CardDescription>
                            From: {message.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <p className="text-sm line-clamp-2 text-muted-foreground">
                            {message.message}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{message.email}</span>
                            </div>
                            {message.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                <span>{message.phone}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Message Analysis */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Analysis</CardTitle>
                  <CardDescription>
                    Insights about contact form submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Read vs. Unread Messages</h3>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-primary h-4 rounded-full" 
                          style={{ width: calculatePercentage(messagesRead, messagesTotal) }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Read: {messagesRead}</span>
                        <span>Unread: {messagesTotal - messagesRead}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Messages with Phone Numbers</h3>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-500 h-4 rounded-full" 
                          style={{ width: calculatePercentage(messagesWithPhone, messagesTotal) }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>With Phone: {messagesWithPhone}</span>
                        <span>Without Phone: {messagesTotal - messagesWithPhone}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}