import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { ContactMessage, Inquiry } from "@shared/schema";

export function useNotificationIndicators() {
  const queryClient = useQueryClient();

  // Get unread contact messages
  const { 
    data: contactMessages = [] as ContactMessage[],
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
    queryFn: async () => {
      const response = await fetch('/api/contact-messages');
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  // Get unread inquiries
  const { 
    data: inquiries = [] as Inquiry[], 
    isLoading: isLoadingInquiries,
    refetch: refetchInquiries
  } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
    queryFn: async () => {
      const response = await fetch('/api/inquiries');
      if (!response.ok) {
        throw new Error('Failed to fetch inquiries');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  // Filter for unread items
  const unreadMessages = contactMessages.filter((message: ContactMessage) => !message.isRead);
  const unreadInquiries = inquiries.filter((inquiry: Inquiry) => !inquiry.isRead);
  
  // Total unread count
  const unreadMessagesCount = unreadMessages.length;
  const unreadInquiriesCount = unreadInquiries.length;
  const totalUnreadCount = unreadMessagesCount + unreadInquiriesCount;

  // Refresh all notification data
  const refreshNotifications = useCallback(async () => {
    await Promise.all([
      refetchMessages(),
      refetchInquiries()
    ]);
  }, [refetchMessages, refetchInquiries]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    try {
      if (unreadMessages.length > 0) {
        await apiRequest('PATCH', '/api/contact-messages/mark-read', {
          ids: unreadMessages.map((msg: ContactMessage) => msg.id)
        });
        
        // Invalidate the messages cache to force a refresh
        queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [unreadMessages, queryClient]);

  // Mark inquiries as read
  const markInquiriesAsRead = useCallback(async () => {
    try {
      if (unreadInquiries.length > 0) {
        await apiRequest('PATCH', '/api/inquiries/mark-read', {
          ids: unreadInquiries.map((inq: Inquiry) => inq.id)
        });
        
        // Invalidate the inquiries cache to force a refresh
        queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      }
    } catch (error) {
      console.error('Error marking inquiries as read:', error);
    }
  }, [unreadInquiries, queryClient]);

  return {
    unreadMessages,
    unreadInquiries,
    unreadMessagesCount,
    unreadInquiriesCount,
    totalUnreadCount,
    hasUnreadMessages: unreadMessagesCount > 0,
    hasUnreadInquiries: unreadInquiriesCount > 0,
    hasUnread: totalUnreadCount > 0,
    isLoading: isLoadingMessages || isLoadingInquiries,
    markMessagesAsRead,
    markInquiriesAsRead,
    refreshNotifications
  };
}