import { Link, useLocation } from "wouter";
import { 
  Home, 
  LayoutDashboard, 
  Building, 
  Users, 
  UserCheck, 
  MessageCircle, 
  Settings, 
  UserCog, 
  PieChart, 
  LogOut,
  MapPin,
  PhoneCall
} from "lucide-react";
import { NotificationIndicator } from "./notification-indicator";
import { useNotificationIndicators } from "@/hooks/use-notification-indicators";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { queryClient } from "@/lib/queryClient";

export function Sidebar() {
  const [location] = useLocation();
  const { settings } = useSiteSettings();
  const { 
    unreadMessagesCount, 
    unreadInquiriesCount, 
    totalUnreadCount,
    hasUnreadMessages,
    hasUnreadInquiries,
    hasUnread
  } = useNotificationIndicators();
  
  const sidebarItems = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          path: "/admin",
          icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
          name: "Properties",
          path: "/admin/properties",
          icon: <Building className="h-5 w-5" />
        },
        {
          name: "Agents",
          path: "/admin/agents",
          icon: <UserCheck className="h-5 w-5" />
        },
        {
          name: "Clients",
          path: "/admin/clients",
          icon: <Users className="h-5 w-5" />
        },
        {
          name: "Client Management",
          path: "/admin/client-management",
          icon: <Users className="h-5 w-5" />,
          hasNotification: hasUnread,
          notificationCount: totalUnreadCount
        },
        {
          name: "Inquiries",
          path: "/admin/inquiries",
          icon: <MessageCircle className="h-5 w-5" />,
          hasNotification: hasUnreadInquiries,
          notificationCount: unreadInquiriesCount
        },
        {
          name: "Contact Messages",
          path: "/admin/contact-messages",
          icon: <PhoneCall className="h-5 w-5" />,
          hasNotification: hasUnreadMessages,
          notificationCount: unreadMessagesCount
        },
        {
          name: "Home Loan Inquiries",
          path: "/admin/home-loan-inquiries",
          icon: <Home className="h-5 w-5" />
        },
        {
          name: "Message Dashboard",
          path: "/admin/message-dashboard",
          icon: <PieChart className="h-5 w-5" />,
          hasNotification: hasUnread,
          notificationCount: totalUnreadCount
        }
      ]
    },
    {
      title: "Management",
      items: [
        {
          name: "Settings",
          path: "/admin/settings",
          icon: <Settings className="h-5 w-5" />
        },
        {
          name: "User Management",
          path: "/admin/users",
          icon: <UserCog className="h-5 w-5" />
        },
        {
          name: "Locations",
          path: "/admin/locations",
          icon: <MapPin className="h-5 w-5" />
        },
        {
          name: "Contact Info",
          path: "/admin/contact",
          icon: <PhoneCall className="h-5 w-5" />
        },
        {
          name: "Property Types",
          path: "/admin/property-types",
          icon: <Building className="h-5 w-5" />
        },
        {
          name: "Analytics",
          path: "/admin/analytics",
          icon: <PieChart className="h-5 w-5" />
        }
      ]
    }
  ];

  const isActiveLink = (path: string) => {
    // Handle both exact matches and child routes
    if (path === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(path);
  };

  return (
    <aside className="w-64 bg-gray-900 text-white h-full">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Home className="text-2xl text-secondary" />
          <span className="font-bold text-xl">{settings.siteName}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">Admin Dashboard</div>
      </div>
      
      <nav className="mt-4">
        {sidebarItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
              {group.title}
            </div>
            
            {group.items.map((item, itemIndex) => (
              <div key={itemIndex} className="relative">
                <Link href={item.path}>
                  <div className={cn(
                    "block px-4 py-2 rounded mx-2 mb-1 flex items-center space-x-2 cursor-pointer",
                    isActiveLink(item.path) 
                      ? "text-white bg-primary-dark" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}>
                    <div className="relative">
                      {item.icon}
                      {item.hasNotification && (
                        <NotificationIndicator count={item.notificationCount} />
                      )}
                    </div>
                    <span>{item.name}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ))}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
        <Link href="/" onClick={() => {
          // Only invalidate admin-specific queries when exiting admin panel
          // This prevents errors when components unmount
          queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
          queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
          queryClient.invalidateQueries({ queryKey: ['/api/property-types'] });
          queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
          queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
          queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
          // Remove this operation as queryClient.gc() is not available in this version
        }}>
          <div className="block px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded flex items-center space-x-2 cursor-pointer">
            <LogOut className="h-5 w-5" />
            <span>Exit Admin</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
