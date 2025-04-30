import React from 'react';
import { UseAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

/**
 * Example component demonstrating proper use of the auth context
 * 
 * Note: This component must be used within an AuthProvider
 * which is already set up in the app/layout.tsx file
 */
export function AuthExample() {
  const { user, isAuthenticated, isLoading, error, Login, Logout } = UseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const HandleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await Login({ email, password });
  };

  const HandleLogout = async () => {
    await Logout();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Example</CardTitle>
        <CardDescription>
          {isAuthenticated
            ? `Logged in as ${user?.email}`
            : 'Please log in to continue'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-md">
              <h3 className="font-medium">User Information</h3>
              <p className="text-sm mt-2">ID: {user?.id}</p>
              <p className="text-sm">Email: {user?.email}</p>
              <p className="text-sm">Role: {user?.role}</p>
              {user?.fullName && <p className="text-sm">Name: {user?.fullName}</p>}
            </div>
          </div>
        ) : (
          <form onSubmit={HandleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </form>
        )}
      </CardContent>
      <CardFooter>
        {isAuthenticated ? (
          <Button onClick={HandleLogout} variant="destructive" className="w-full">
            Logout
          </Button>
        ) : (
          <Button type="submit" onClick={HandleLogin} className="w-full">
            Login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default AuthExample; 