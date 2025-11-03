import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-inter">
              Book Your Journey with Sakpal Travels
            </h1>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
              Reliable, Safe, and Comfortable Bus Journeys to Your Favorite Destinations.
            </p>
            <div className="w-full max-w-4xl p-6 mx-auto mt-8 bg-card rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-center text-primary-foreground mb-6">Find Your Bus</h2>
              {/* Placeholder for the search form */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
                <div className="text-left">
                  <label htmlFor="from" className="block text-sm font-medium text-primary-foreground/80">From</label>
                  <input type="text" id="from" placeholder="Origin" className="mt-1 block w-full bg-input border-border rounded-md p-2" />
                </div>
                <div className="text-left">
                  <label htmlFor="to" className="block text-sm font-medium text-primary-foreground/80">To</label>
                  <input type="text" id="to" placeholder="Destination" className="mt-1 block w-full bg-input border-border rounded-md p-2" />
                </div>
                <div className="text-left">
                  <label htmlFor="date" className="block text-sm font-medium text-primary-foreground/80">Date</label>
                  <input type="date" id="date" className="mt-1 block w-full bg-input border-border rounded-md p-2" />
                </div>
                <Button className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">Search Buses</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-8 font-inter">Featured Routes</h2>
           {/* Placeholder for featured routes */}
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
        <div className="container px-4 md:px-6">
           <h2 className="text-3xl font-bold text-center mb-8 font-inter">Why Choose Us?</h2>
           {/* Placeholder for service highlights */}
        </div>
      </section>
    </div>
  );
}
