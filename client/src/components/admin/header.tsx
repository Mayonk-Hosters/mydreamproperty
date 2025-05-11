import { Menu, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
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
          <div className="ml-3 md:hidden text-lg font-semibold">RealEstate Pro Admin</div>
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
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full p-0">
                3
              </Badge>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" alt="Admin User" />
              <AvatarFallback>JA</AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium">John Admin</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          
          <Link href="/">
            <Button variant="outline" size="sm" className="ml-2 px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200 transition-all">
              Exit Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
