import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ContactMessage } from "@/hooks/use-contact-messages";

type NotificationContextType = {
  hasUnreadMessages: boolean;
  unreadCount: number;
  checkForNewMessages: () => void;
  markAllAsRead: () => void;
};

export const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [lastCheckedTime, setLastCheckedTime] = useState<Date>(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get contact messages from cache or fetch them
  const { data: messages } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact-messages"],
    // Don't show error toasts for this background query
    onError: () => {},
    // Disabled by default - we'll trigger this manually
    enabled: false,
  });
  
  // Check for new messages
  const checkForNewMessages = async () => {
    try {
      // Refetch the latest messages
      await queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
      await queryClient.refetchQueries({ queryKey: ['/api/contact-messages'] });
      
      // Get the latest data after refetch
      const latestMessages = queryClient.getQueryData<ContactMessage[]>(["/api/contact-messages"]);
      
      if (!latestMessages) return;
      
      // Count unread messages
      const unreadMessages = latestMessages.filter(msg => !msg.isRead);
      setUnreadCount(unreadMessages.length);
      
      // Check for messages newer than last check time
      const newMessages = latestMessages.filter(
        msg => new Date(msg.createdAt) > lastCheckedTime && !msg.isRead
      );
      
      // Notify if there are new messages since last check
      if (newMessages.length > 0 && !location.startsWith('/admin/contact-messages')) {
        // Play notification sound
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(err => console.log('Audio play failed:', err));
        
        // Show toast notification
        toast({
          title: `${newMessages.length} New Contact ${newMessages.length === 1 ? 'Message' : 'Messages'}`,
          description: "You have new unread contact messages",
          variant: "default",
        });
      }
      
      // Update the last checked time
      setLastCheckedTime(new Date());
    } catch (error) {
      console.error("Error checking for new messages:", error);
    }
  };
  
  // Mark all as read (used when visiting the messages page)
  const markAllAsRead = () => {
    setUnreadCount(0);
  };
  
  // Periodically check for new messages when admin is logged in
  useEffect(() => {
    // Only run this for admin routes
    if (!location.startsWith('/admin')) return;
    
    // Initial check
    checkForNewMessages();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(() => {
      checkForNewMessages();
    }, 30000); // check every 30 seconds
    
    return () => clearInterval(interval);
  }, [location]);
  
  return (
    <NotificationContext.Provider
      value={{
        hasUnreadMessages: unreadCount > 0,
        unreadCount,
        checkForNewMessages,
        markAllAsRead,
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