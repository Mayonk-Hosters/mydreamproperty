import { Menu, Bell, ChevronDown, Settings, LogOut, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { User as UserType, ContactMessage, Inquiry } from "@shared/schema";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useNotificationIndicators } from "@/hooks/use-notification-indicators";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  // Fetch the user profile for the header
  const { data: profile } = useQuery<UserType>({
    queryKey: ['/api/user/profile']
  });
  
  const { settings } = useSiteSettings();
  
  // Use the notification indicators hook to get unread counts
  const { 
    unreadMessagesCount, 
    unreadInquiriesCount, 
    totalUnreadCount 
  } = useNotificationIndicators();

  // Determine the display name and initials
  const displayName = profile?.fullName || profile?.username || "Admin";
  const initials = profile?.fullName 
    ? profile.fullName.split(" ").map(n => n[0]).join("").toUpperCase() 
    : profile?.username?.substring(0, 2).toUpperCase() || "AD";
    
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Button>
          <div className="ml-3 md:hidden text-lg font-semibold">{settings.siteName} Admin</div>
        </div>
        
        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input 
              type="search" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Bell with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Bell className="h-5 w-5" />
                  {totalUnreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full p-0">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {totalUnreadCount === 0 ? (
                <div className="py-4 px-2 text-center text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <>
                  {unreadInquiriesCount > 0 && (
                    <Link href="/admin/inquiries">
                      <DropdownMenuItem>
                        <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">New Property Inquiries</div>
                          <div className="text-xs text-muted-foreground">
                            {unreadInquiriesCount} unread inquiries from potential clients
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {unreadMessagesCount > 0 && (
                    <Link href="/admin/contact-messages">
                      <DropdownMenuItem>
                        <MessageCircle className="mr-2 h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium">Contact Messages</div>
                          <div className="text-xs text-muted-foreground">
                            {unreadMessagesCount} unread contact messages
                          </div>
                        </div>
                      </DropdownMenuItem>
                    </Link>
                  )}
                </>
              )}
              
              <DropdownMenuSeparator />
              <Link href="/admin/message-dashboard">
                <DropdownMenuItem>
                  <span className="text-xs text-center w-full">View all notifications</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <Avatar>
                  <AvatarImage src={profile?.profileImage || undefined} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">{displayName}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/admin/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <Link href="/" onClick={() => {
                // Only invalidate admin-specific queries when exiting admin panel
                queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
                queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
                queryClient.invalidateQueries({ queryKey: ['/api/property-types'] });
                queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
                queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
                queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
              }}>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Exit Admin</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link href="/" onClick={() => {
            // Only invalidate admin-specific queries when exiting admin panel
            queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
            queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
            queryClient.invalidateQueries({ queryKey: ['/api/property-types'] });
            queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
            queryClient.invalidateQueries({ queryKey: ['/api/contact-messages'] });
            queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
          }}>
            <Button variant="outline" size="sm" className="ml-2 px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200 transition-all">
              Exit Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
