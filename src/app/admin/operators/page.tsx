
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
import { PlusCircle, Trash2, Loader2, Building, Mail, Phone, MapPin, Bus, Armchair, Hash, Users } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


const busSchema = z.object({
    registrationNumber: z.string().min(3, "Registration number is required."),
    busType: z.enum(["AC", "Non-AC"]),
    seatingCapacity: z.enum(["15", "30", "40", "50"]),
    coachType: z.enum(["General", "Pushback", "Relaxing", "Sleeper"]),
});

const operatorSchema = z.object({
  name: z.string().min(3, "Operator name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "A valid phone number is required."),
  address: z.string().min(5, "Address is required."),
  buses: z.array(busSchema).min(1, "At least one bus must be added."),
});

type OperatorFormData = z.infer<typeof operatorSchema>;

export default function OperatorRegistrationPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      buses: [
        { registrationNumber: '', busType: 'AC', seatingCapacity: '40', coachType: 'Relaxing' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'buses',
  });

  const onSubmit: SubmitHandler<OperatorFormData> = async (data) => {
    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to register an operator.",
        });
        return;
    }
    setIsSubmitting(true);

    try {
        const batch = writeBatch(firestore);

        // 1. Create the bus operator document
        const operatorCollection = collection(firestore, 'bus_operators');
        const operatorDocRef = doc(operatorCollection); // Create a ref with a new ID

        batch.set(operatorDocRef, {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // 2. Create documents for each bus, linking them to the operator
        const busesCollection = collection(firestore, 'buses');
        for (const bus of data.buses) {
             const busDocRef = doc(busesCollection); // Create a ref with a new ID
             batch.set(busDocRef, {
                ...bus,
                operatorId: operatorDocRef.id,
                operatorName: data.name, // denormalized for easier display
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
        
        await batch.commit();

        toast({
            title: "Operator Registered",
            description: `${data.name} and their buses have been added to the system.`,
        });
        router.push('/admin/dashboard'); // or to a list of operators page
    } catch (error: any) {
        console.error("Error registering operator:", error);
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6">
      <header>
          <h1 className="text-2xl font-bold tracking-tight">Operator Registration</h1>
          <p className="text-muted-foreground">Add a new bus operator and their fleet to the system.</p>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Operator Details</CardTitle>
            <CardDescription>Enter the primary information for the bus operator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Operator Name</Label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="name" {...register('name')} placeholder="e.g. Traverse Travels" className="pl-10" />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" {...register('email')} placeholder="contact@traverse.com" className="pl-10" />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" type="tel" {...register('phone')} placeholder="9876543210" className="pl-10" />
                    </div>
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="address" {...register('address')} placeholder="123, Main Street, City" className="pl-10" />
                    </div>
                    {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bus Fleet</CardTitle>
            <CardDescription>Add the details for each bus owned by the operator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                <h4 className="font-semibold">Bus {index + 1}</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor={`buses.${index}.registrationNumber`}>Registration No.</Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...register(`buses.${index}.registrationNumber`)} placeholder="MH-01-AB-1234" className="pl-10"/>
                        </div>
                        {errors.buses?.[index]?.registrationNumber && <p className="text-sm text-destructive">{errors.buses[index].registrationNumber.message}</p>}
                    </div>
                   <Controller
                      control={control}
                      name={`buses.${index}.busType`}
                      render={({ field: controllerField }) => (
                         <div className="space-y-2">
                            <Label>Bus Type</Label>
                             <div className="relative">
                                <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
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
                      name={`buses.${index}.seatingCapacity`}
                      render={({ field: controllerField }) => (
                         <div className="space-y-2">
                            <Label>Seating Capacity</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Select onValueChange={controllerField.onChange} defaultValue={controllerField.value}>
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
                      name={`buses.${index}.coachType`}
                      render={({ field: controllerField }) => (
                        <div className="space-y-2">
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
                 {fields.length > 1 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Bus</span>
                    </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ registrationNumber: '', busType: 'AC', seatingCapacity: '40', coachType: 'Relaxing' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Bus
            </Button>
             {errors.buses && <p className="text-sm text-destructive">{errors.buses.message}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
             {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Operator'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
