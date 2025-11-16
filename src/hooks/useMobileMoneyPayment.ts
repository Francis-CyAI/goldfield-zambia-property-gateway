import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/constants/firebase';

type PaymentStatus = 'idle' | 'initiated' | 'pending' | 'success' | 'failed';

export const useMobileMoneyPayment = () => {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [reference, setReference] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const env: any = (import.meta as any).env ?? {};

  const buildCallableUrl = (functionName: string) => {
    if (env.VITE_FUNCTIONS_ORIGIN) {
      const projectId = env.VITE_FIREBASE_PROJECT_ID ?? 'goldfield-8180d';
      const region = env.VITE_FIREBASE_REGION ?? 'africa-south1';
      return `${env.VITE_FUNCTIONS_ORIGIN}/${projectId}/${region}/${functionName}`;
    }

    const protocol = env.VITE_FUNCTIONS_EMULATOR_PROTOCOL ?? 'http';
    const host = env.VITE_FUNCTIONS_EMULATOR_HOST ?? 'localhost';
    const port = env.VITE_FUNCTIONS_EMULATOR_PORT ?? '5001';
    const projectId = env.VITE_FIREBASE_PROJECT_ID ?? 'goldfield-8180d';
    const region = env.VITE_FIREBASE_REGION ?? 'africa-south1';
    return `${protocol}://${host}:${port}/${projectId}/${region}/${functionName}`;
  };

  const callCallable = async (functionName: string, data: any) => {
    // Use Firebase Functions SDK to call callable functions (avoids CORS issues)
    try {
      const fn = httpsCallable(functions as any, functionName) as any;
      const res = await fn(data);
      return res?.data ?? res;
    } catch (err: any) {
      // normalize error
      throw err;
    }
  };

  const initiate = async (opts: { msisdn: string; operator: string; amount: number; bookingId?: string }) => {
    setError(null);
    setIsInitiating(true);
    setStatus('initiated');

    try {
      const payload = {
        bookingId: opts.bookingId ?? `frontend-${Date.now()}`,
        amount: opts.amount,
        msisdn: opts.msisdn,
        operator: opts.operator,
        metadata: { triggeredBy: 'useMobileMoneyPayment' },
      };

      const result: any = await callCallable('initiateBookingMobileMoneyPayment', payload);
      const ref = result?.reference ?? null;
      if (!ref) throw new Error('No payment reference returned');

      setReference(ref);
      setStatus('pending');
      return { result, reference: ref };
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setStatus('failed');
      throw err;
    } finally {
      setIsInitiating(false);
    }
  };

  const check = async (opts: { reference?: string; bookingId?: string }) => {
    setError(null);
    try {
      const result: any = await callCallable('checkBookingMobileMoneyPaymentStatus', opts);
      return result;
    } catch (err: any) {
      setError(err?.message ?? String(err));
      throw err;
    }
  };

  const poll = async (referenceToCheck?: string, maxAttempts = 12, interval = 5000) => {
    const ref = referenceToCheck ?? reference;
    if (!ref) throw new Error('No reference to poll');

    setStatus('pending');
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const result: any = await check({ reference: ref });
        if (result?.success) {
          setStatus('success');
          return result;
        }
      } catch (err) {
        // swallow and retry
      }

      attempts += 1;
      // simple wait
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, interval));
    }

    setStatus('failed');
    setError('Timed out waiting for payment confirmation');
    return null;
  };

  const reset = () => {
    setStatus('idle');
    setReference(null);
    setIsInitiating(false);
    setError(null);
  };

  return {
    status,
    reference,
    isInitiating,
    error,
    initiate,
    check,
    poll,
    reset,
  } as const;
};

export default useMobileMoneyPayment;