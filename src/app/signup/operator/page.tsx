
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus, Mail, Lock, User, Phone, Building, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const formSchema = z.object({
  userName: z.string().min(2, "Your name must be at least 2 characters"),
  operatorName: z.string().min(2, "Operator name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number."),
  address: z.string().min(5, "Address is required."),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatorSignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: data.userName });

      // 2. Save user profile to /users collection
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        name: data.userName,
        email: data.email,
        phone: data.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3. Save operator profile to /bus_operators collection
      const operatorDocRef = doc(firestore, "bus_operators", user.uid);
      await setDoc(operatorDocRef, {
        name: data.operatorName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Operator Account Created",
        description: "You have been successfully signed up. You can now manage your fleet.",
      });
      router.push("/admin/dashboard"); // Redirect to an operator-specific dashboard
    } catch (error: any) {
      console.error("Operator sign up failed:", error);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary py-12">
      <Card className="mx-auto max-w-md w-full shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Bus className="h-8 w-8 text-primary" />
            <span className="font-headline font-bold text-2xl">Traverse</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Operator Sign Up</CardTitle>
          <CardDescription>
            Create an account to manage your bus fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="userName" placeholder="John Doe" {...register("userName")} className="pl-10" />
              </div>
              {errors.userName && <p className="text-sm text-destructive">{errors.userName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="operatorName">Operator/Company Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="operatorName" placeholder="e.g. Traverse Travels" {...register("operatorName")} className="pl-10" />
              </div>
              {errors.operatorName && <p className="text-sm text-destructive">{errors.operatorName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="m@example.com" {...register("email")} className="pl-10" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="e.g. 9876543210" {...register("phone")} className="pl-10" />
              </div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="address">Company Address</Label>
                    <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="address" {...register('address')} placeholder="123, Main Street, City" className="pl-10" />
                </div>
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" {...register("password")} className="pl-10" />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Operator Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    