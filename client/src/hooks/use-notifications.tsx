import { ContactMessage } from "@/hooks/use-contact-messages";
import { createContext, ReactNode, useContext, useCallback, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";

type NotificationContextType = {
  hasUnreadMessages: boolean;
  unreadCount: number;
  checkForNewMessages: () => void;
  markAllAsRead: () => void;
};

export const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Fetch contact messages
  const { data: messages, refetch } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact-messages'],
    refetchInterval: 60000, // Check every minute
    refetchOnWindowFocus: true,
    staleTime: 30000
  });

  // Check for new messages when messages data changes
  useEffect(() => {
    if (!messages) return;
    
    // Check for new messages since last check
    const newMessages = messages.filter(message => {
      if (!message.createdAt) return false;
      return new Date(message.createdAt) > lastCheckedTime && !message.isRead;
    });
    
    // If new messages arrived, show a toast and update count
    if (newMessages.length > 0 && newMessages.length !== unreadCount) {
      setUnreadCount(newMessages.length);
      setHasUnreadMessages(true);
      
      // Show toast only if this isn't the initial load
      if (lastCheckedTime.getTime() > 0) {
        toast({
          title: "New Message Received",
          description: `You have ${newMessages.length} new contact message${newMessages.length > 1 ? 's' : ''}`,
          variant: "default",
        });
      }
    }
  }, [messages, lastCheckedTime, toast, unreadCount]);

  // Check for new messages
  const checkForNewMessages = useCallback(() => {
    refetch();
  }, [refetch]);

  // Mark all messages as read
  const markAllAsRead = useCallback(async () => {
    if (!messages) return;
    
    // Update UI state immediately
    setHasUnreadMessages(false);
    setUnreadCount(0);
    setLastCheckedTime(new Date());
    
    // For messages marked as read on the contact messages page,
    // the API call would happen there, not here
  }, [messages]);

  // Check for new messages on mount
  useEffect(() => {
    checkForNewMessages();
  }, [checkForNewMessages]);

  return (
    <NotificationContext.Provider
      value={{
        hasUnreadMessages,
        unreadCount,
        checkForNewMessages,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}