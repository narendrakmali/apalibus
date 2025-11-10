
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock } from "lucide-react";

export default function RequestStatusPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-display mt-4">Request Submitted!</CardTitle>
          <CardDescription>Thank you for your request. Our team will get back to you shortly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Your request ID is:</p>
          <p className="font-mono text-sm bg-muted p-2 rounded-md">{params.id}</p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground pt-4">
            <Clock className="h-4 w-4" />
            <span>You can now safely close this page. We will contact you via email or phone with a quote.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    