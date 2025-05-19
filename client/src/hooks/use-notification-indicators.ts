import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  propertyId: number;
  isRead: boolean;
  createdAt: string;
}

export function useNotificationIndicators() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date(0));
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [hasUnreadInquiries, setHasUnreadInquiries] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get messages
  const { 
    data: messages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
    staleTime: 30000, // 30 seconds
  });
  
  // Get inquiries
  const { 
    data: inquiries = [],
    isLoading: isLoadingInquiries,
    refetch: refetchInquiries
  } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
    staleTime: 30000, // 30 seconds
  });
  
  // Calculate unread counts
  const unreadMessages = messages?.filter(msg => !msg.isRead) || [];
  const unreadInquiries = inquiries?.filter(inq => !inq.isRead) || [];
  
  // Set unread states
  useEffect(() => {
    if (!isLoadingMessages) {
      setHasUnreadMessages(unreadMessages.length > 0);
    }
  }, [unreadMessages.length, isLoadingMessages]);
  
  useEffect(() => {
    if (!isLoadingInquiries) {
      setHasUnreadInquiries(unreadInquiries.length > 0);
    }
  }, [unreadInquiries.length, isLoadingInquiries]);
  
  // Update total unread count
  useEffect(() => {
    setUnreadCount(unreadMessages.length + unreadInquiries.length);
  }, [unreadMessages.length, unreadInquiries.length]);
  
  // Check for new messages
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchMessages();
      refetchInquiries();
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [refetchMessages, refetchInquiries]);
  
  // Mark all messages as read
  const markMessagesAsRead = useCallback(async () => {
    try {
      await apiRequest("PATCH", "/api/contact-messages/mark-read", {});
      queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      setHasUnreadMessages(false);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, [queryClient]);
  
  // Mark all inquiries as read
  const markInquiriesAsRead = useCallback(async () => {
    try {
      await apiRequest("PATCH", "/api/inquiries/mark-read", {});
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      setHasUnreadInquiries(false);
    } catch (error) {
      console.error("Failed to mark inquiries as read:", error);
    }
  }, [queryClient]);
  
  return {
    hasUnreadMessages,
    hasUnreadInquiries,
    unreadMessages,
    unreadInquiries,
    unreadMessagesCount: unreadMessages.length,
    unreadInquiriesCount: unreadInquiries.length,
    totalUnreadCount: unreadCount,
    isLoading: isLoadingMessages || isLoadingInquiries,
    markMessagesAsRead,
    markInquiriesAsRead,
    refetchAll: useCallback(() => {
      refetchMessages();
      refetchInquiries();
    }, [refetchMessages, refetchInquiries])
  };
}