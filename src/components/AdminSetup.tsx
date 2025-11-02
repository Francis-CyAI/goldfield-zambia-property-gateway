import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { limit, serverTimestamp, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { listDocuments, setDocument, logAdminActivity } from '@/lib/utils/firebase';

export const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateAdmin = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const profileResult = await listDocuments('profiles', [
        where('email', '==', email.trim().toLowerCase()),
        limit(1),
      ]);
      if (profileResult.error) throw profileResult.error;
      const profile = profileResult.data?.[0];

      if (!profile) {
        throw new Error('No user found with that email address.');
      }

      await setDocument(
        'adminUsers',
        profile.id,
        {
          user_id: profile.id,
          admin_type: 'super_admin',
          is_active: true,
          permissions: ['manage_users', 'manage_properties', 'view_reports'],
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
      );

      await logAdminActivity({
        actorId: user?.uid ?? 'system',
        actorEmail: user?.email ?? undefined,
        action: 'Granted super admin access',
        entityType: 'profile',
        entityId: profile.id,
        metadata: { email: profile.email },
      });

      toast({
        title: 'Admin created',
        description: `${email} now has super admin access.`,
      });
      setMessage('Admin user created successfully!');
      setEmail('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create admin user.';
      setMessage(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Setup</CardTitle>
        <CardDescription>Create the first admin user for the platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <Button onClick={handleCreateAdmin} disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Grant Admin Access'}
        </Button>

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
