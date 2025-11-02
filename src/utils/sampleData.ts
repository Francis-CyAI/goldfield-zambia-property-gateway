import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/constants/firebase';

export const createSampleUser = async (email: string, password: string, role: string) => {
  try {
    const createUserFn = httpsCallable(functions, 'createSampleUser');
    const result = await createUserFn({ email, password, role });
    return result.data as unknown;
  } catch (error) {
    console.error('Error in createSampleUser:', error);
    return null;
  }
};

export const populateSampleData = async () => {
  try {
    const populateFn = httpsCallable(functions, 'populateSampleData');
    await populateFn({});
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
};
