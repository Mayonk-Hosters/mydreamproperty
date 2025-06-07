import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string | null;
  isRead: boolean;
  createdAt: string;
}

export function useContactMessages() {
  const { toast } = useToast();
  
  const query = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact-messages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contact-messages");
      return response.json();
    },
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/contact-messages/${id}/mark-read`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({
        title: "Message marked as read",
        description: "The contact message has been marked as read.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark message as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contact-messages/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-messages"] });
      toast({
        title: "Message deleted",
        description: "The contact message has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return {
    contactMessages: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    deleteMessage: deleteMessageMutation.mutate,
    isDeleting: deleteMessageMutation.isPending,
    refetch: query.refetch
  };
}