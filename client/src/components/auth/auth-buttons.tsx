import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon } from 'lucide-react';

export const LoginButton = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
              ) : (
                <AvatarFallback>
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/account" className="flex items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Account</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/api/logout" className="flex items-center text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={() => window.location.href = '/api/login'}
    >
      Log in
    </Button>
  );
};

export const LogoutButton = () => {
  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={() => window.location.href = '/api/logout'}
    >
      Log out
    </Button>
  );
};