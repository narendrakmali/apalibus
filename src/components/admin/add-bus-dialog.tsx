'use client';

import { useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Hash, Bus, Users, Armchair, Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const busSchema = z.object({
  registrationNumber: z.string().min(3, 'Registration number is required.'),
  busType: z.enum(['AC', 'Non-AC']),
  seatingCapacity: z.enum(['15', '30', '40', '50']),
  coachType: z.enum(['General', 'Pushback', 'Relaxing', 'Sleeper']),
});

type BusFormData = z.infer<typeof busSchema>;

interface AddBusDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddBusDialog({ isOpen, onOpenChange }: AddBusDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusFormData>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      registrationNumber: '',
      busType: 'AC',
      seatingCapacity: '40',
      coachType: 'Relaxing',
    },
  });

  const onSubmit: SubmitHandler<BusFormData> = async (data) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to add a bus.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      // Fetch operator name from bus_operators collection
      const operatorDocRef = doc(firestore, 'bus_operators', user.uid);
      const operatorSnap = await getDoc(operatorDocRef);

      if (!operatorSnap.exists()) {
        throw new Error("Could not find your operator profile.");
      }
      const operatorName = operatorSnap.data()?.name;

      const busesCollection = collection(firestore, 'buses');
      await addDoc(busesCollection, {
        ...data,
        operatorId: user.uid,
        operatorName: operatorName, // denormalized for easier display
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Bus Added',
        description: `Bus ${data.registrationNumber} has been added to your fleet.`,
      });
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding bus:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSubmitting) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Bus</DialogTitle>
          <DialogDescription>
            Enter the details for the new bus to add it to your fleet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="registrationNumber">Registration No.</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="registrationNumber"
                  {...register('registrationNumber')}
                  placeholder="MH-01-AB-1234"
                  className="pl-10"
                />
              </div>
              {errors.registrationNumber && (
                <p className="text-sm text-destructive">
                  {errors.registrationNumber.message}
                </p>
              )}
            </div>
            <Controller
              control={control}
              name="busType"
              render={({ field: controllerField }) => (
                <div className="space-y-2">
                  <Label>Bus Type</Label>
                  <div className="relative">
                    <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      onValueChange={controllerField.onChange}
                      defaultValue={controllerField.value}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            />
            <Controller
              control={control}
              name="seatingCapacity"
              render={({ field: controllerField }) => (
                <div className="space-y-2">
                  <Label>Seating Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      onValueChange={controllerField.onChange}
                      defaultValue={controllerField.value}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Seater</SelectItem>
                        <SelectItem value="30">30 Seater</SelectItem>
                        <SelectItem value="40">40 Seater</SelectItem>
                        <SelectItem value="50">50 Seater</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            />
             <Controller
                control={control}
                name="coachType"
                render={({ field: controllerField }) => (
                <div className="space-y-2 lg:col-start-1">
                    <Label>Coach Type</Label>
                    <div className="relative">
                        <Armchair className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
                            <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Select coach" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Pushback">Pushback</SelectItem>
                                <SelectItem value="Relaxing">Relaxing</SelectItem>
                                <SelectItem value="Sleeper">Sleeper</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Bus...
                </>
              ) : (
                'Add Bus'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
