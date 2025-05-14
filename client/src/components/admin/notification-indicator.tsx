import { useNotifications } from "@/hooks/use-notifications";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationIndicator() {
  const { hasUnreadMessages, unreadCount, markAllAsRead } = useNotifications();
  const [location] = useLocation();
  
  // Mark all as read when visiting the contact messages page
  useEffect(() => {
    if (location === '/admin/contact-messages') {
      markAllAsRead();
    }
  }, [location, markAllAsRead]);
  
  // Don't show indicator on the contact messages page itself
  if (location === '/admin/contact-messages') {
    return null;
  }
  
  return (
    <div className="relative">
      <Bell className={cn(
        "h-5 w-5",
        hasUnreadMessages && "text-primary animate-pulse"
      )} />
      
      {hasUnreadMessages && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}