import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useNotifications() {
  // Get unread contact messages
  const { 
    data: contactMessages = [],
    isLoading: isLoadingMessages 
  } = useQuery({
    queryKey: ['/api/contact-messages'],
    queryFn: async () => {
      const response = await fetch('/api/contact-messages');
      return response.json();
    }
  });

  // Get unread inquiries
  const { 
    data: inquiries = [], 
    isLoading: isLoadingInquiries 
  } = useQuery({
    queryKey: ['/api/inquiries'],
    queryFn: async () => {
      const response = await fetch('/api/inquiries');
      return response.json();
    }
  });

  // Filter for unread items
  const unreadMessages = contactMessages.filter(message => !message.isRead);
  const unreadInquiries = inquiries.filter(inquiry => !inquiry.isRead);
  
  // Total unread count
  const unreadMessagesCount = unreadMessages.length;
  const unreadInquiriesCount = unreadInquiries.length;
  const totalUnreadCount = unreadMessagesCount + unreadInquiriesCount;

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    try {
      if (unreadMessages.length > 0) {
        await apiRequest('PATCH', '/api/contact-messages/mark-read', {
          ids: unreadMessages.map(msg => msg.id)
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [unreadMessages]);

  // Mark inquiries as read
  const markInquiriesAsRead = useCallback(async () => {
    try {
      if (unreadInquiries.length > 0) {
        await apiRequest('PATCH', '/api/inquiries/mark-read', {
          ids: unreadInquiries.map(inq => inq.id)
        });
      }
    } catch (error) {
      console.error('Error marking inquiries as read:', error);
    }
  }, [unreadInquiries]);

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
    markInquiriesAsRead
  };
}