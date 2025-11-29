'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function MsrtcAdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    if (username === 'msrtc-admin' && password === 'P@ssw0rd') {
      // In a real app, you would use a secure session management system.
      // For this prototype, we'll use sessionStorage.
      sessionStorage.setItem('msrtc-admin-auth', 'true');
      router.push('/msrtc-admin');
    } else {
      setError('Invalid username or password.');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800/10">
      <Card className="w-full max-w-md shadow-xl border-red-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display text-red-800">MSRTC Admin Login</CardTitle>
          <CardDescription>Maharashtra State Road Transport Corporation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="msrtc-admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} disabled={isLoading} className="w-full bg-red-700 hover:bg-red-800 text-white">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}