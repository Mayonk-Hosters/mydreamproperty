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
      name: "Clients",
      path: "/admin/clients",
      icon: <Users className="h-4 w-4" />
    }
  ];

  const messageNavItems = [
    {
      name: "Client Management",
      path: "/admin/client-management",
      icon: <Users className="h-4 w-4" />,
      hasNotification: hasUnread,
      notificationCount: totalUnreadCount
    },
    {
      name: "Inquiries",
      path: "/admin/inquiries",
      icon: <MessageCircle className="h-4 w-4" />,
      hasNotification: hasUnreadInquiries,
      notificationCount: unreadInquiriesCount
    },
    {
      name: "Contact Messages",
      path: "/admin/contact-messages",
      icon: <PhoneCall className="h-4 w-4" />,
      hasNotification: hasUnreadMessages,
      notificationCount: unreadMessagesCount
    },
    {
      name: "Home Loan Inquiries",
      path: "/admin/home-loan-inquiries",
      icon: <Home className="h-4 w-4" />
    }
  ];

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
    }
  ];

  const NavItem = ({ item, className = "" }: { item: any; className?: string }) => (
    <Link href={item.path}>
      <div className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActiveLink(item.path) 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}>
        <div className="relative">
          {item.icon}
          {item.hasNotification && (
            <NotificationIndicator count={item.notificationCount} />
          )}
        </div>
        <span className="hidden lg:block">{item.name}</span>
      </div>
    </Link>
  );

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{settings.siteName}</span>
              <span className="hidden sm:block text-xs text-muted-foreground">Admin</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Main Navigation */}
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}

            {/* Messages Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    messageNavItems.some(item => isActiveLink(item.path))
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <MessageCircle className="h-4 w-4" />
                    {hasUnread && (
                      <NotificationIndicator count={totalUnreadCount} />
                    )}
                  </div>
                  <span>Messages</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Message Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {messageNavItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link href={item.path}>
                      <div className="flex items-center space-x-2 w-full">
                        <div className="relative">
                          {item.icon}
                          {item.hasNotification && (
                            <NotificationIndicator count={item.notificationCount} />
                          )}
                        </div>
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Management Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    managementItems.some(item => isActiveLink(item.path))
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span>Management</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>System Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {managementItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link href={item.path}>
                      <div className="flex items-center space-x-2 w-full">
                        {item.icon}
                        <span>{item.name}</span>
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
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Exit Admin</span>
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
              {messageNavItems.map((item) => (
                <NavItem key={item.path} item={item} className="justify-center text-center" />
              ))}
              {managementItems.map((item) => (
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