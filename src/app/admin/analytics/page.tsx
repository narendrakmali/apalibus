import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Booking Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Insights into platform-wide revenue and booking trends.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>
            Charts and key metrics about the platform's performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-20">
            <p>Analytics dashboard coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    