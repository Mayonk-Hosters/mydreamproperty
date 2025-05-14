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
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Sidebar() {
  const [location] = useLocation();
  const { settings } = useSiteSettings();
  const { hasUnreadMessages } = useNotifications();
  
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
          name: "Inquiries",
          path: "/admin/inquiries",
          icon: <MessageCircle className="h-5 w-5" />
        },
        {
          name: "Contact Messages",
          path: "/admin/contact-messages",
          icon: <PhoneCall className="h-5 w-5" />,
          notification: true
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
              <Link key={itemIndex} href={item.path}>
                <a className={cn(
                  "block px-4 py-2 rounded mx-2 mb-1 flex items-center space-x-2",
                  isActiveLink(item.path) 
                    ? "text-white bg-primary-dark" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}>
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
        ))}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
        <Link href="/">
          <a className="block px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded flex items-center space-x-2">
            <LogOut className="h-5 w-5" />
            <span>Exit Admin</span>
          </a>
        </Link>
      </div>
    </aside>
  );
}
