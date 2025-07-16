import { supabase } from '@/integrations/supabase/client';

export const createSampleUser = async (email: string, password: string, role: string) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: role === 'host' ? 'John' : 'Jane',
          last_name: role === 'host' ? 'Host' : 'Guest',
          role: role,
        },
      },
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return null;
    }

    return authData.user;
  } catch (error) {
    console.error('Error in createSampleUser:', error);
    return null;
  }
};

export const populateSampleData = async () => {
  try {
    // This function can be called to populate sample data
    // For now, we'll just log that it was called
    console.log('Sample data population would happen here');
    
    // You can create sample users like this:
    // await createSampleUser('host@example.com', 'password123', 'host');
    // await createSampleUser('guest@example.com', 'password123', 'guest');
    
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
};