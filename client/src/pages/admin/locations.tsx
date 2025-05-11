import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { State, District, Taluka, Tehsil } from "@shared/schema";

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState("states");
  
  return (
    <AdminLayout>
      <div className="container px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Location Management</h1>
        
        <Tabs defaultValue="states" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="districts">Districts</TabsTrigger>
            <TabsTrigger value="talukas">Talukas</TabsTrigger>
            <TabsTrigger value="tehsils">Tehsils</TabsTrigger>
          </TabsList>
          
          <TabsContent value="states">
            <StatesManager />
          </TabsContent>
          
          <TabsContent value="districts">
            <DistrictsManager />
          </TabsContent>
          
          <TabsContent value="talukas">
            <TalukasManager />
          </TabsContent>
          
          <TabsContent value="tehsils">
            <TehsilsManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// States Manager Component
function StatesManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editState, setEditState] = useState<State | null>(null);
  const { toast } = useToast();
  
  const statesQuery = useQuery<State[], Error>({
    queryKey: ["/api/locations/states"],
  });
  
  const createStateMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiRequest("POST", "/api/locations/states", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "State created",
        description: "The state has been successfully created.",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/states"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating state",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateStateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string } }) => {
      const response = await apiRequest("PATCH", `/api/locations/states/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "State updated",
        description: "The state has been successfully updated.",
      });
      setEditState(null);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/states"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating state",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteStateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/states/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "State deleted",
        description: "The state has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/states"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting state",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this state?")) {
      deleteStateMutation.mutate(id);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>States</CardTitle>
          <CardDescription>Manage states across India</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add State
            </Button>
          </DialogTrigger>
          <DialogContent>
            <StateForm
              onSubmit={(data) => createStateMutation.mutate(data)}
              isPending={createStateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {statesQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : statesQuery.isError ? (
          <div className="py-8 text-center text-red-500">
            Error loading states: {statesQuery.error.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statesQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No states found
                  </TableCell>
                </TableRow>
              ) : (
                statesQuery.data?.map((state) => (
                  <TableRow key={state.id}>
                    <TableCell>{state.id}</TableCell>
                    <TableCell>{state.name}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={editState?.id === state.id} onOpenChange={(open) => !open && setEditState(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditState(state)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <StateForm
                            state={state}
                            onSubmit={(data) => updateStateMutation.mutate({ id: state.id, data })}
                            isPending={updateStateMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(state.id)}
                        disabled={deleteStateMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Districts Manager Component
function DistrictsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDistrict, setEditDistrict] = useState<District | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const statesQuery = useQuery<State[], Error>({
    queryKey: ["/api/locations/states"],
  });
  
  const districtsQuery = useQuery<District[], Error>({
    queryKey: ["/api/locations/districts", selectedStateId],
    queryFn: async () => {
      const url = selectedStateId 
        ? `/api/locations/districts?stateId=${selectedStateId}` 
        : "/api/locations/districts";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      return response.json();
    },
  });
  
  const createDistrictMutation = useMutation({
    mutationFn: async (data: { name: string; stateId: number }) => {
      const response = await apiRequest("POST", "/api/locations/districts", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "District created",
        description: "The district has been successfully created.",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/districts"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating district",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateDistrictMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; stateId: number } }) => {
      const response = await apiRequest("PATCH", `/api/locations/districts/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "District updated",
        description: "The district has been successfully updated.",
      });
      setEditDistrict(null);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/districts"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating district",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteDistrictMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/districts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "District deleted",
        description: "The district has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/districts"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting district",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this district?")) {
      deleteDistrictMutation.mutate(id);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Districts</CardTitle>
          <CardDescription>Manage districts across states</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select 
            value={selectedStateId?.toString() || ""} 
            onValueChange={(value) => setSelectedStateId(value ? parseInt(value) : null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All States</SelectItem>
              {statesQuery.data?.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add District
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DistrictForm
                states={statesQuery.data || []}
                onSubmit={(data) => createDistrictMutation.mutate(data)}
                isPending={createDistrictMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {districtsQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : districtsQuery.isError ? (
          <div className="py-8 text-center text-red-500">
            Error loading districts: {districtsQuery.error.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districtsQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No districts found
                  </TableCell>
                </TableRow>
              ) : (
                districtsQuery.data?.map((district) => (
                  <TableRow key={district.id}>
                    <TableCell>{district.id}</TableCell>
                    <TableCell>{district.name}</TableCell>
                    <TableCell>
                      {statesQuery.data?.find(state => state.id === district.stateId)?.name || district.stateId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog 
                        open={editDistrict?.id === district.id} 
                        onOpenChange={(open) => !open && setEditDistrict(null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditDistrict(district)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DistrictForm
                            district={district}
                            states={statesQuery.data || []}
                            onSubmit={(data) => updateDistrictMutation.mutate({ id: district.id, data })}
                            isPending={updateDistrictMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(district.id)}
                        disabled={deleteDistrictMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Talukas Manager Component
function TalukasManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTaluka, setEditTaluka] = useState<Taluka | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const statesQuery = useQuery<State[], Error>({
    queryKey: ["/api/locations/states"],
  });
  
  const districtsQuery = useQuery<District[], Error>({
    queryKey: ["/api/locations/districts", selectedStateId],
    queryFn: async () => {
      const url = selectedStateId 
        ? `/api/locations/districts?stateId=${selectedStateId}` 
        : "/api/locations/districts";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      return response.json();
    },
  });
  
  const talukasQuery = useQuery<Taluka[], Error>({
    queryKey: ["/api/locations/talukas", selectedDistrictId],
    queryFn: async () => {
      const url = selectedDistrictId 
        ? `/api/locations/talukas?districtId=${selectedDistrictId}` 
        : "/api/locations/talukas";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch talukas");
      }
      return response.json();
    },
  });
  
  const createTalukaMutation = useMutation({
    mutationFn: async (data: { name: string; districtId: number }) => {
      const response = await apiRequest("POST", "/api/locations/talukas", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Taluka created",
        description: "The taluka has been successfully created.",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/talukas"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating taluka",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateTalukaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; districtId: number } }) => {
      const response = await apiRequest("PATCH", `/api/locations/talukas/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Taluka updated",
        description: "The taluka has been successfully updated.",
      });
      setEditTaluka(null);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/talukas"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating taluka",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteTalukaMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/talukas/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Taluka deleted",
        description: "The taluka has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/talukas"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting taluka",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this taluka?")) {
      deleteTalukaMutation.mutate(id);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Talukas</CardTitle>
          <CardDescription>Manage talukas across districts</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select 
            value={selectedStateId?.toString() || ""} 
            onValueChange={(value) => {
              setSelectedStateId(value ? parseInt(value) : null);
              setSelectedDistrictId(null); // Reset district when state changes
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All States</SelectItem>
              {statesQuery.data?.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedDistrictId?.toString() || ""} 
            onValueChange={(value) => setSelectedDistrictId(value ? parseInt(value) : null)}
            disabled={!selectedStateId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Districts</SelectItem>
              {districtsQuery.data?.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Taluka
              </Button>
            </DialogTrigger>
            <DialogContent>
              <TalukaForm
                districts={districtsQuery.data || []}
                onSubmit={(data) => createTalukaMutation.mutate(data)}
                isPending={createTalukaMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {talukasQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : talukasQuery.isError ? (
          <div className="py-8 text-center text-red-500">
            Error loading talukas: {talukasQuery.error.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>District</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {talukasQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No talukas found
                  </TableCell>
                </TableRow>
              ) : (
                talukasQuery.data?.map((taluka) => (
                  <TableRow key={taluka.id}>
                    <TableCell>{taluka.id}</TableCell>
                    <TableCell>{taluka.name}</TableCell>
                    <TableCell>
                      {districtsQuery.data?.find(district => district.id === taluka.districtId)?.name || taluka.districtId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog 
                        open={editTaluka?.id === taluka.id} 
                        onOpenChange={(open) => !open && setEditTaluka(null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditTaluka(taluka)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <TalukaForm
                            taluka={taluka}
                            districts={districtsQuery.data || []}
                            onSubmit={(data) => updateTalukaMutation.mutate({ id: taluka.id, data })}
                            isPending={updateTalukaMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(taluka.id)}
                        disabled={deleteTalukaMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Tehsils Manager Component
function TehsilsManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTehsil, setEditTehsil] = useState<Tehsil | null>(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const statesQuery = useQuery<State[], Error>({
    queryKey: ["/api/locations/states"],
  });
  
  const districtsQuery = useQuery<District[], Error>({
    queryKey: ["/api/locations/districts", selectedStateId],
    queryFn: async () => {
      const url = selectedStateId 
        ? `/api/locations/districts?stateId=${selectedStateId}` 
        : "/api/locations/districts";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      return response.json();
    },
  });
  
  const talukasQuery = useQuery<Taluka[], Error>({
    queryKey: ["/api/locations/talukas", selectedDistrictId],
    queryFn: async () => {
      const url = selectedDistrictId 
        ? `/api/locations/talukas?districtId=${selectedDistrictId}` 
        : "/api/locations/talukas";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch talukas");
      }
      return response.json();
    },
    enabled: !!selectedDistrictId,
  });
  
  const tehsilsQuery = useQuery<Tehsil[], Error>({
    queryKey: ["/api/locations/tehsils", selectedTalukaId],
    queryFn: async () => {
      const url = selectedTalukaId 
        ? `/api/locations/tehsils?talukaId=${selectedTalukaId}` 
        : "/api/locations/tehsils";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch tehsils");
      }
      return response.json();
    },
  });
  
  const createTehsilMutation = useMutation({
    mutationFn: async (data: { name: string; talukaId: number; area: string }) => {
      const response = await apiRequest("POST", "/api/locations/tehsils", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tehsil created",
        description: "The tehsil has been successfully created.",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/tehsils"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating tehsil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateTehsilMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; talukaId: number; area: string } }) => {
      const response = await apiRequest("PATCH", `/api/locations/tehsils/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tehsil updated",
        description: "The tehsil has been successfully updated.",
      });
      setEditTehsil(null);
      queryClient.invalidateQueries({ queryKey: ["/api/locations/tehsils"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating tehsil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteTehsilMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/tehsils/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Tehsil deleted",
        description: "The tehsil has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/locations/tehsils"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting tehsil",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tehsil?")) {
      deleteTehsilMutation.mutate(id);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tehsils</CardTitle>
          <CardDescription>Manage tehsils across talukas</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select 
            value={selectedStateId?.toString() || ""} 
            onValueChange={(value) => {
              setSelectedStateId(value ? parseInt(value) : null);
              setSelectedDistrictId(null); // Reset district when state changes
              setSelectedTalukaId(null); // Reset taluka when state changes
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All States</SelectItem>
              {statesQuery.data?.map((state) => (
                <SelectItem key={state.id} value={state.id.toString()}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedDistrictId?.toString() || ""} 
            onValueChange={(value) => {
              setSelectedDistrictId(value ? parseInt(value) : null);
              setSelectedTalukaId(null); // Reset taluka when district changes
            }}
            disabled={!selectedStateId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Districts</SelectItem>
              {districtsQuery.data?.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedTalukaId?.toString() || ""} 
            onValueChange={(value) => setSelectedTalukaId(value ? parseInt(value) : null)}
            disabled={!selectedDistrictId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by taluka" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Talukas</SelectItem>
              {talukasQuery.data?.map((taluka) => (
                <SelectItem key={taluka.id} value={taluka.id.toString()}>
                  {taluka.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Tehsil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <TehsilForm
                talukas={talukasQuery.data || []}
                onSubmit={(data) => createTehsilMutation.mutate(data)}
                isPending={createTehsilMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tehsilsQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tehsilsQuery.isError ? (
          <div className="py-8 text-center text-red-500">
            Error loading tehsils: {tehsilsQuery.error.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Taluka</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tehsilsQuery.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No tehsils found
                  </TableCell>
                </TableRow>
              ) : (
                tehsilsQuery.data?.map((tehsil) => (
                  <TableRow key={tehsil.id}>
                    <TableCell>{tehsil.id}</TableCell>
                    <TableCell>{tehsil.name}</TableCell>
                    <TableCell>
                      {talukasQuery.data?.find(taluka => taluka.id === tehsil.talukaId)?.name || tehsil.talukaId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog 
                        open={editTehsil?.id === tehsil.id} 
                        onOpenChange={(open) => !open && setEditTehsil(null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditTehsil(tehsil)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <TehsilForm
                            tehsil={tehsil}
                            talukas={talukasQuery.data || []}
                            onSubmit={(data) => updateTehsilMutation.mutate({ id: tehsil.id, data })}
                            isPending={updateTehsilMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(tehsil.id)}
                        disabled={deleteTehsilMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Form Components
function StateForm({ 
  state, 
  onSubmit, 
  isPending 
}: { 
  state?: State; 
  onSubmit: (data: { name: string }) => void; 
  isPending: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
      })
    ),
    defaultValues: {
      name: state?.name || "",
    },
  });
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>{state ? "Edit State" : "Add New State"}</DialogTitle>
        <DialogDescription>
          {state ? "Update the state information below." : "Enter state details below to create a new state."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">State Name</Label>
            <Input
              id="name"
              placeholder="Enter state name"
              {...form.register("name")}
              className={cn(form.formState.errors.name && "border-red-500")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {state ? "Update State" : "Create State"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function DistrictForm({ 
  district, 
  states,
  onSubmit, 
  isPending 
}: { 
  district?: District; 
  states: State[];
  onSubmit: (data: { name: string; stateId: number }) => void; 
  isPending: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        stateId: z.coerce.number().positive("Please select a state"),
      })
    ),
    defaultValues: {
      name: district?.name || "",
      stateId: district?.stateId || "",
    },
  });
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>{district ? "Edit District" : "Add New District"}</DialogTitle>
        <DialogDescription>
          {district ? "Update the district information below." : "Enter district details below to create a new district."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">District Name</Label>
            <Input
              id="name"
              placeholder="Enter district name"
              {...form.register("name")}
              className={cn(form.formState.errors.name && "border-red-500")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stateId">State</Label>
            <Select
              value={form.watch("stateId")?.toString() || ""}
              onValueChange={(value) => form.setValue("stateId", parseInt(value))}
            >
              <SelectTrigger className={cn(form.formState.errors.stateId && "border-red-500")}>
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id.toString()}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.stateId && (
              <p className="text-sm text-red-500">{form.formState.errors.stateId.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {district ? "Update District" : "Create District"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function TalukaForm({ 
  taluka, 
  districts,
  onSubmit, 
  isPending 
}: { 
  taluka?: Taluka; 
  districts: District[];
  onSubmit: (data: { name: string; districtId: number }) => void; 
  isPending: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        districtId: z.coerce.number().positive("Please select a district"),
      })
    ),
    defaultValues: {
      name: taluka?.name || "",
      districtId: taluka?.districtId || "",
    },
  });
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>{taluka ? "Edit Taluka" : "Add New Taluka"}</DialogTitle>
        <DialogDescription>
          {taluka ? "Update the taluka information below." : "Enter taluka details below to create a new taluka."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Taluka Name</Label>
            <Input
              id="name"
              placeholder="Enter taluka name"
              {...form.register("name")}
              className={cn(form.formState.errors.name && "border-red-500")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="districtId">District</Label>
            <Select
              value={form.watch("districtId")?.toString() || ""}
              onValueChange={(value) => form.setValue("districtId", parseInt(value))}
            >
              <SelectTrigger className={cn(form.formState.errors.districtId && "border-red-500")}>
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.districtId && (
              <p className="text-sm text-red-500">{form.formState.errors.districtId.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {taluka ? "Update Taluka" : "Create Taluka"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function TehsilForm({ 
  tehsil, 
  talukas,
  onSubmit, 
  isPending 
}: { 
  tehsil?: Tehsil; 
  talukas: Taluka[];
  onSubmit: (data: { name: string; talukaId: number; area: string }) => void; 
  isPending: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        talukaId: z.coerce.number().positive("Please select a taluka"),
        area: z.string().optional(),
      })
    ),
    defaultValues: {
      name: tehsil?.name || "",
      talukaId: tehsil?.talukaId || "",
      area: tehsil?.area || "",
    },
  });
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>{tehsil ? "Edit Tehsil" : "Add New Tehsil"}</DialogTitle>
        <DialogDescription>
          {tehsil ? "Update the tehsil information below." : "Enter tehsil details below to create a new tehsil."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tehsil Name</Label>
            <Input
              id="name"
              placeholder="Enter tehsil name"
              {...form.register("name")}
              className={cn(form.formState.errors.name && "border-red-500")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="talukaId">Taluka</Label>
            <Select
              value={form.watch("talukaId")?.toString() || ""}
              onValueChange={(value) => form.setValue("talukaId", parseInt(value))}
            >
              <SelectTrigger className={cn(form.formState.errors.talukaId && "border-red-500")}>
                <SelectValue placeholder="Select a taluka" />
              </SelectTrigger>
              <SelectContent>
                {talukas.map((taluka) => (
                  <SelectItem key={taluka.id} value={taluka.id.toString()}>
                    {taluka.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.talukaId && (
              <p className="text-sm text-red-500">{form.formState.errors.talukaId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="area">Area (Location)</Label>
            <Input
              id="area"
              type="text"
              placeholder="Enter area location"
              {...form.register("area")}
              className={cn(form.formState.errors.area && "border-red-500")}
            />
            {form.formState.errors.area && (
              <p className="text-sm text-red-500">{form.formState.errors.area.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tehsil ? "Update Tehsil" : "Create Tehsil"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}