import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
  profileImage?: string;
}

export function useProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current user profile
  const { data: profile, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    onSuccess: (data) => {
      // Profile loaded successfully
      console.log("Profile loaded:", data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (profileData: ProfileUpdateData) => {
      const res = await apiRequest("PATCH", "/api/user/profile", profileData);
      return res.json();
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['/api/user/profile'], updatedProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    profile,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    updateProfile: updateMutation.mutate,
    isPending: updateMutation.isPending
  };
}