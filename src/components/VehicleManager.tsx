
import React, { useState } from 'react';
import { useVehicles } from '@/hooks/use-vehicles';
import VehicleCard from './VehicleCard';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const VehicleManager: React.FC = () => {
  const { vehicles, selectVehicle, addVehicle, loading } = useVehicles();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    nickname: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSelectVehicle = (id: string) => {
    selectVehicle(id);
    navigate('/');
  };
  
  const handleAddVehicle = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditVehicle = (id: string) => {
    // In a real app, this would navigate to an edit form
    console.log('Edit vehicle clicked', id);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || '' : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVehicle.make || !newVehicle.model || !newVehicle.year) {
      toast({
        title: "Error",
        description: "Make, model, and year are required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addVehicle({
        make: newVehicle.make,
        model: newVehicle.model,
        year: Number(newVehicle.year),
        vin: newVehicle.vin,
        nickname: newVehicle.nickname,
        image_url: '/placeholder.svg'
      });
      
      setIsAddDialogOpen(false);
      setNewVehicle({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        nickname: ''
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Vehicles</h2>
        <button
          onClick={handleAddVehicle}
          className="p-2 rounded-full bg-carfix-50 text-carfix-600 hover:bg-carfix-100 transition-colors"
          aria-label="Add vehicle"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid gap-4 grid-cols-1">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onSelect={() => handleSelectVehicle(vehicle.id)}
            onEdit={() => handleEditVehicle(vehicle.id)}
          />
        ))}
        
        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No vehicles added yet</p>
            <button
              onClick={handleAddVehicle}
              className="mt-4 px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </div>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nickname" className="text-right">
                  Nickname
                </Label>
                <Input
                  id="nickname"
                  name="nickname"
                  value={newVehicle.nickname}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="My Car (optional)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="make" className="text-right">
                  Make *
                </Label>
                <Input
                  id="make"
                  name="make"
                  value={newVehicle.make}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Toyota"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model *
                </Label>
                <Input
                  id="model"
                  name="model"
                  value={newVehicle.model}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Camry"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  Year *
                </Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="2023"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vin" className="text-right">
                  VIN
                </Label>
                <Input
                  id="vin"
                  name="vin"
                  value={newVehicle.vin}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="1HGCM82633A123456 (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Vehicle'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleManager;
