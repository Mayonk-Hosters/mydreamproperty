import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface PropertyTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyTypeCreated?: (name: string) => void;
}

export function PropertyTypeDialog({ open, onOpenChange, onPropertyTypeCreated }: PropertyTypeDialogProps) {
  const { toast } = useToast();
  const [newPropertyTypeName, setNewPropertyTypeName] = useState('');
  const [newPropertyTypeActive, setNewPropertyTypeActive] = useState(true);

  // Add a new property type
  const createPropertyTypeMutation = useMutation({
    mutationFn: async (propertyType: { name: string; active: boolean }) => {
      const response = await apiRequest('POST', '/api/property-types', propertyType);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Property type created",
        description: `Property type "${newPropertyTypeName}" has been created successfully.`,
      });
      if (onPropertyTypeCreated) {
        onPropertyTypeCreated(data.name);
      }
      setNewPropertyTypeName('');
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/property-types'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create property type",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleCreatePropertyType = () => {
    if (!newPropertyTypeName.trim()) {
      toast({
        title: "Error",
        description: "Property type name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    createPropertyTypeMutation.mutate({
      name: newPropertyTypeName.trim(),
      active: newPropertyTypeActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Property Type</DialogTitle>
          <DialogDescription>
            Create a new property type for listings. Click Save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={newPropertyTypeName}
              onChange={(e) => setNewPropertyTypeName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Apartment, Villa, Plot"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="active" className="text-right text-sm font-medium">
              Active
            </label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="active"
                checked={newPropertyTypeActive}
                onCheckedChange={setNewPropertyTypeActive}
              />
              <label htmlFor="active" className="text-sm text-muted-foreground">
                {newPropertyTypeActive ? 'Active' : 'Inactive'}
              </label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePropertyType}
            disabled={!newPropertyTypeName.trim() || createPropertyTypeMutation.isPending}
          >
            {createPropertyTypeMutation.isPending ? 'Creating...' : 'Create Property Type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}