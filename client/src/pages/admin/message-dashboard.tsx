import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useContactMessages, type ContactMessage } from "@/hooks/use-contact-messages";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfDay, endOfDay, isWithinInterval, isSameDay } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Loader2, Phone, Mail, CalendarIcon, MessageSquare } from "lucide-react";

export default function MessageDashboardPage() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "all">("7days");
  const [messagesByDate, setMessagesByDate] = useState<any[]>([]);
  const [readUnreadData, setReadUnreadData] = useState<any[]>([]);
  const [todayMessages, setTodayMessages] = useState<ContactMessage[]>([]);
  const [phoneEmailStats, setPhoneEmailStats] = useState({ withPhone: 0, withoutPhone: 0 });
  
  const { contactMessages, isLoading } = useContactMessages();
  
  useEffect(() => {
    if (contactMessages.length > 0) {
      processMessageData();
    }
  }, [contactMessages, timeRange]);
  
  const processMessageData = () => {
    // Define date ranges based on selected timeRange
    const now = new Date();
    const today = startOfDay(now);
    let startDate;
    
    if (timeRange === "7days") {
      startDate = subDays(today, 6);
    } else if (timeRange === "30days") {
      startDate = subDays(today, 29);
    } else {
      // For "all", we'll use the oldest message date or default to 90 days back
      const dates = contactMessages.map(msg => new Date(msg.createdAt));
      startDate = dates.length > 0 
        ? new Date(Math.min(...dates.map(d => d.getTime())))
        : subDays(today, 90);
    }
    
    // Generate full date range for x-axis (important for showing days with zero messages)
    const dateRange: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Filter messages based on timeRange
    const filteredMessages = timeRange === "all" 
      ? contactMessages 
      : contactMessages.filter(msg => {
          const msgDate = new Date(msg.createdAt);
          return isWithinInterval(msgDate, { 
            start: startDate, 
            end: endOfDay(now) 
          });
        });
    
    // Count messages by date
    const messageCountByDate = dateRange.map(date => {
      const count = filteredMessages.filter(msg => 
        isSameDay(new Date(msg.createdAt), date)
      ).length;
      
      return {
        date: format(date, "MMM dd"),
        count,
      };
    });
    
    // Set messages received today
    const messagesFromToday = contactMessages.filter(msg => 
      isSameDay(new Date(msg.createdAt), today)
    );
    
    // Count read vs unread messages
    const readCount = filteredMessages.filter(msg => msg.isRead).length;
    const unreadCount = filteredMessages.filter(msg => !msg.isRead).length;
    
    // Count messages with/without phone
    const withPhone = filteredMessages.filter(msg => msg.phone && msg.phone.trim() !== '').length;
    const withoutPhone = filteredMessages.length - withPhone;
    
    // Update state with processed data
    setMessagesByDate(messageCountByDate);
    setReadUnreadData([
      { name: 'Read', value: readCount, color: '#10b981' },
      { name: 'Unread', value: unreadCount, color: '#f43f5e' }
    ]);
    setTodayMessages(messagesFromToday);
    setPhoneEmailStats({
      withPhone,
      withoutPhone
    });
  };
  
  // Colors for the pie chart
  const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b'];
  
  // Handle click on message card to navigate to the full message view
  const handleMessageClick = (id: number) => {
    window.location.href = `/admin/contact-messages?message=${id}`;
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
          
          <Tabs 
            value={timeRange} 
            onValueChange={(value) => setTimeRange(value as "7days" | "30days" | "all")}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 md:w-[300px]">
              <TabsTrigger value="7days">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contactMessages.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeRange === "7days" ? "Last 7 days" : 
                     timeRange === "30days" ? "Last 30 days" : 
                     "All time"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Messages Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayMessages.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(), "MMM dd, yyyy")}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Read Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contactMessages.length > 0 
                      ? `${Math.round((contactMessages.filter(m => m.isRead).length / contactMessages.length) * 100)}%`
                      : "0%"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {contactMessages.filter(m => m.isRead).length} of {contactMessages.length} messages
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Messages with Phone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contactMessages.length > 0 
                      ? `${Math.round((phoneEmailStats.withPhone / contactMessages.length) * 100)}%`
                      : "0%"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {phoneEmailStats.withPhone} of {contactMessages.length} messages
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Messages Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages Over Time</CardTitle>
                  <CardDescription>
                    Number of messages received per day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={messagesByDate}
                        margin={{ top: 5, right: 30, left: 5, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45} 
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" name="Messages" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Read vs Unread */}
              <Card>
                <CardHeader>
                  <CardTitle>Read vs. Unread</CardTitle>
                  <CardDescription>
                    Status of received messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex justify-center items-center">
                    {readUnreadData[0].value === 0 && readUnreadData[1].value === 0 ? (
                      <p className="text-muted-foreground">No data available</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={readUnreadData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {readUnreadData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => [`${value} messages`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Today's Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Messages</CardTitle>
                <CardDescription>
                  Messages received today ({format(new Date(), "MMM dd, yyyy")})
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
                              {format(new Date(message.createdAt), "h:mm a")}
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}