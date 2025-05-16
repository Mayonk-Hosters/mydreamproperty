import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';

// Helper function for generating user initials
function getUserInitials(name?: string | null): string {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function LoginButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage || undefined} alt={user.fullName || 'User'} />
              <AvatarFallback>{getUserInitials(user.fullName || user.email)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          {user.isAdmin && (
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => window.location.href = '/admin'}
            >
              <span>Admin Panel</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="cursor-pointer text-red-600" 
            onClick={() => window.location.href = '/api/logout'}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={() => window.location.href = '/api/login'}
      variant="default"
    >
      Login
    </Button>
  );
}