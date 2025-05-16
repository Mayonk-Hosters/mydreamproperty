import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: adminStatus, isLoading: isAdminCheckLoading } = useQuery({
    queryKey: ['/api/auth/check-admin'],
    enabled: !!user, // Only check admin status if user is logged in
    retry: false,
  });

  return {
    user,
    isLoading: isLoading || isAdminCheckLoading,
    isAuthenticated: !!user,
    isAdmin: adminStatus?.isAdmin || false,
    error,
  };
}