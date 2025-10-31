"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(), // Email is not editable through this form for security
  phone: z.string().min(10, "Please enter a valid phone number."),
});

type FormValues = z.infer<typeof formSchema>;

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userProfile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

export function EditProfileDialog({ isOpen, onOpenChange, userProfile, onProfileUpdate }: EditProfileDialogProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
      });
    }
  }, [userProfile, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not authenticated" });
      return;
    }

    try {
      // Update Firebase Auth display name
      if (auth.currentUser && auth.currentUser.displayName !== data.name) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }

      // Update Firestore document
      const userDocRef = doc(firestore, "users", user.uid);
      const updatedData = {
        ...userProfile,
        name: data.name,
        phone: data.phone,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(userDocRef, updatedData, { merge: true });

      onProfileUpdate(updatedData);
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} disabled />
            <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
