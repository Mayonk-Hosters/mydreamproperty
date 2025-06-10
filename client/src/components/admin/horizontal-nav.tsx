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
  PhoneCall,
  ChevronDown,
  Image as ImageIcon,
  Menu
} from "lucide-react";
import { NotificationIndicator } from "./notification-indicator";
import { useNotificationIndicators } from "@/hooks/use-notification-indicators";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function HorizontalNav() {
  const [location] = useLocation();
  const { settings } = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { 
    unreadMessagesCount, 
    unreadInquiriesCount, 
    totalUnreadCount,
    hasUnreadMessages,
    hasUnreadInquiries
  } = useNotificationIndicators();
  
  const hasUnread = hasUnreadMessages || hasUnreadInquiries;

  const isActiveLink = (path: string) => {
    if (path === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(path);
  };

  const mainNavItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      name: "Properties",
      path: "/admin/properties",
      icon: <Building className="h-4 w-4" />
    },
    {
      name: "Agents",
      path: "/admin/agents",
      icon: <UserCheck className="h-4 w-4" />
    },
    {
      name: "Inquiries",
      path: "/admin/inquiries-center",
      icon: <MessageCircle className="h-4 w-4" />,
      hasNotification: hasUnread,
      notificationCount: totalUnreadCount
    }
  ];

  // Messages Center removed

  const managementItems = [
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-4 w-4" />
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <UserCog className="h-4 w-4" />
    },
    {
      name: "Locations",
      path: "/admin/locations",
      icon: <MapPin className="h-4 w-4" />
    },
    {
      name: "Contact Info",
      path: "/admin/contact",
      icon: <PhoneCall className="h-4 w-4" />
    },
    {
      name: "Property Types",
      path: "/admin/property-types",
      icon: <Building className="h-4 w-4" />
    },
    {
      name: "Homepage Images",
      path: "/admin/homepage-images",
      icon: <ImageIcon className="h-4 w-4" />
    }
  ];

  const NavItem = ({ item, className = "" }: { item: any; className?: string }) => (
    <Link href={item.path}>
      <div className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden",
        isActiveLink(item.path) 
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105" 
          : "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md hover:scale-105",
        className
      )}>
        <div className="relative z-10">
          {item.icon}
          {item.hasNotification && (
            <NotificationIndicator count={item.notificationCount} />
          )}
        </div>
        <span className="hidden lg:block relative z-10 font-medium">{item.name}</span>
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      </div>
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white tracking-tight">{settings.siteName}</span>
                <span className="hidden sm:block text-xs text-slate-300 font-medium">Admin Dashboard</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Main Navigation */}
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}

            {/* Messages Center removed */}

            {/* Management Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                    managementItems.some((item: any) => isActiveLink(item.path))
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105" 
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-md hover:scale-105"
                  )}
                >
                  <Settings className="h-4 w-4 relative z-10" />
                  <span className="relative z-10 font-medium">Management</span>
                  <ChevronDown className="h-3 w-3 relative z-10 transition-transform group-hover:rotate-180" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 shadow-xl">
                <DropdownMenuLabel className="text-slate-200 font-semibold">System Management</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {managementItems.map((item: any) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link href={item.path}>
                      <div className="flex items-center space-x-3 w-full p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all duration-200">
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Analytics */}
            <NavItem item={{
              name: "Analytics",
              path: "/admin/analytics",
              icon: <PieChart className="h-4 w-4" />
            }} />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Exit Admin */}
            <Link href="/" onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
              queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
              queryClient.invalidateQueries({ queryKey: ['/api/property-types'] });
              queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
              queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
              queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
            }}>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-red-400 hover:border-red-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block font-medium">Exit Admin</span>
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-2">
            <div className="grid grid-cols-2 gap-1">
              {mainNavItems.map((item) => (
                <NavItem key={item.path} item={item} className="justify-center text-center" />
              ))}

              {managementItems.map((item: any) => (
                <NavItem key={item.path} item={item} className="justify-center text-center" />
              ))}
              <NavItem item={{
                name: "Analytics",
                path: "/admin/analytics",
                icon: <PieChart className="h-4 w-4" />
              }} className="justify-center text-center" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}