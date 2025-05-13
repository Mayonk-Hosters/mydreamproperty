import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAdmin } from "@/hooks/use-admin";
import { Loader2, Search, UserPlus, Pencil, Trash, UserCheck, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminClientsPage() {
  const { isAdmin, isLoading, requireAdmin } = useAdmin();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    fullName: string;
    isAdmin: boolean;
    password: string;
  }>({
    username: "",
    email: "",
    fullName: "",
    isAdmin: false,
    password: "",
  });
  
  const { toast } = useToast();
  
  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !isLoading && !!isAdmin,
  });
  
  // Check if user is admin
  useEffect(() => {
    requireAdmin();
  }, [isLoading, isAdmin, requireAdmin]);

  // Reset form when dialogs close
  useEffect(() => {
    if (!isEditDialogOpen && !isCreateDialogOpen) {
      if (selectedClient && isEditDialogOpen) {
        setFormData({
          username: selectedClient.username,
          email: selectedClient.email || "",
          fullName: selectedClient.fullName || "",
          isAdmin: selectedClient.isAdmin || false,
          password: "",
        });
      } else {
        setFormData({
          username: "",
          email: "",
          fullName: "",
          isAdmin: false,
          password: "",
        });
      }
    }
  }, [isEditDialogOpen, isCreateDialogOpen, selectedClient]);

  // Set form data when a client is selected for editing
  useEffect(() => {
    if (selectedClient && isEditDialogOpen) {
      setFormData({
        username: selectedClient.username,
        email: selectedClient.email || "",
        fullName: selectedClient.fullName || "",
        isAdmin: selectedClient.isAdmin || false,
        password: "",
      });
    }
  }, [selectedClient, isEditDialogOpen]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const res = await apiRequest("POST", "/api/users", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create user");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<typeof formData> }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/users/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission for creating a new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  // Handle form submission for updating a user
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    const updateData: Partial<typeof formData> = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      isAdmin: formData.isAdmin,
    };
    
    // Only include password if it's been changed
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    updateUserMutation.mutate({
      id: selectedClient.id,
      userData: updateData,
    });
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (!selectedClient) return;
    deleteUserMutation.mutate(selectedClient.id);
  };

  if (isLoading || isLoadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via the useAdmin hook
  }
  
  // Filter users based on search term and selected tab
  const filteredUsers = users
    ? Array.isArray(users) 
      ? users.filter(user => {
          const matchesSearch = 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase());
          
          if (selectedTab === "all") {
            return matchesSearch;
          } else if (selectedTab === "admins") {
            return matchesSearch && user.isAdmin;
          } else if (selectedTab === "clients") {
            return matchesSearch && !user.isAdmin;
          }
          
          return matchesSearch;
        })
      : []
    : [];

  return (
    <AdminLayout>
      <Helmet>
        <title>Clients & Users | Admin | My Dream Property</title>
      </Helmet>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clients Management</h1>
          <p className="text-gray-600">Manage your clients and user accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search clients..."
              className="pl-10 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users & Clients</CardTitle>
          <CardDescription>Manage all user accounts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="admins">Administrators</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {Array.isArray(users) && users.length === 0 
                ? "No users found. Add your first user to get started."
                : "No users matching your search criteria."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Client
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.createdAt 
                          ? format(new Date(user.createdAt), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedClient(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setSelectedClient(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                />
                <Label htmlFor="isAdmin">Administrator Access</Label>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500">
                  Leave blank to keep the current password
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                />
                <Label htmlFor="isAdmin">Administrator Access</Label>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{selectedClient?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}