import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure global platform parameters and rules.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage fare rules, API keys, and other system-level settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-20">
            <p>System settings interface coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    