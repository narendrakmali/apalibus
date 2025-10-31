import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Users,
  Ticket,
  Map,
  ArrowUpRight,
} from 'lucide-react';
import { DemandChart } from '@/components/admin/demand-chart';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const liveTrackingImage = PlaceHolderImages.find(img => img.id === 'live-tracking-map');

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 z-30">
        <SidebarTrigger />
        <h1 className="font-semibold text-lg md:text-xl">Dashboard</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-8 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹4,52,31,890</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Buses</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78</div>
              <p className="text-xs text-muted-foreground">
                Currently on route
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Booking Demand</CardTitle>
              <CardDescription>
                A visual representation of booking demand over the past months.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <DemandChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Live Bus Tracking</CardTitle>
                <CardDescription>
                  Real-time locations of all active buses.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <a href="#">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              {liveTrackingImage && (
                <div className="relative aspect-[4/3]">
                    <Image
                        src={liveTrackingImage.imageUrl}
                        alt={liveTrackingImage.description}
                        fill
                        className="rounded-md object-cover"
                        data-ai-hint={liveTrackingImage.imageHint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-md"></div>
                     <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-bold text-lg">Bus TR-01-A435</h3>
                        <p className="text-sm">Mumbai to Pune - En Route</p>
                     </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
