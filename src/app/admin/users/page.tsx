import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View, edit, or remove user accounts.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all registered users will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-20">
            <p>User management interface coming soon.</p>
            <p className="text-sm">
              (You will be able to manage user roles and data from here)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    