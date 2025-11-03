
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus, Mail, Lock } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const authBgImage = PlaceHolderImages.find(img => img.id === 'auth-background');


function LoginForm() {
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
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Authentication service not available.",
      });
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Check for user role and redirect accordingly
      const roleDocRef = doc(firestore, 'roles', user.uid);
      const roleDocSnap = await getDoc(roleDocRef);

      if (roleDocSnap.exists()) {
        const userRole = roleDocSnap.data().role;
        if (userRole === 'admin' || userRole === 'super-admin' || userRole === 'fleet-operator') {
          router.push('/admin/dashboard');
          return;
        }
      }
      
      router.push("/dashboard");
      
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
            className="pl-10"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="#"
            className="ml-auto inline-block text-sm underline"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            {...register("password")}
            className="pl-10"
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
      <Button variant="outline" className="w-full" disabled>
        Login with Google
      </Button>
    </form>
  );
}


export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary relative">
        {authBgImage && (
            <Image
                src={authBgImage.imageUrl}
                alt={authBgImage.description}
                fill
                className="object-cover -z-10"
                data-ai-hint={authBgImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-black/60 -z-10" />

      <Card className="mx-auto max-w-sm w-full shadow-2xl bg-background/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Bus className="h-8 w-8 text-primary" />
            <span className="font-headline font-bold text-2xl">Traverse</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Select your role and enter your credentials to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="operator">Operator</TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="pt-4">
               <LoginForm />
               <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline">
                    Sign up
                  </Link>
                </div>
            </TabsContent>
            <TabsContent value="operator" className="pt-4">
              <LoginForm />
               <div className="mt-4 text-center text-sm">
                  Are you an operator?{" "}
                  <Link href="/signup/operator" className="underline">
                    Sign up your fleet
                  </Link>
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
