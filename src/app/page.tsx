
import { BookingForm } from "@/components/booking/booking-form";
import Header from "@/components/common/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
            Your Journey, Your Way
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12">
            Instantly estimate bus fares and find the best operators for your
            route. Enter your details below to get started.
          </p>
        </div>
        <BookingForm />
        <div className="text-center mt-12">
            <p className="text-muted-foreground">Are you a bus operator looking to join our network?</p>
            <Button asChild variant="link" className="text-lg">
                <Link href="/signup/operator">Register Your Fleet Today</Link>
            </Button>
        </div>
      </main>
    </div>
  );
}
