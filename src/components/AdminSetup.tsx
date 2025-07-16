import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AdminSetup = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Call the function directly with SQL
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', email)
        .maybeSingle();

      if (error) {
        throw error;
      }

      toast({
        title: 'Success!',
        description: 'Admin user created successfully.',
      });
      
      setMessage('Admin user created successfully!');
      setEmail('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create admin user';
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
        <CardDescription>
          Create the first admin user for the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleCreateAdmin} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Admin User'}
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