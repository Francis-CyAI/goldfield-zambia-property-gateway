import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCreatePurchaseRequest } from '@/hooks/usePurchaseRequests';
import { storage } from '@/lib/constants/firebase';
import type { Property } from '@/lib/models';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, Wallet } from 'lucide-react';

interface PurchaseRequestDialogProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

const purchaseSchema = z.object({
  buyerName: z.string().min(2, 'Enter your full name'),
  buyerEmail: z.string().email('Enter a valid email'),
  buyerPhone: z.string().min(9, 'Enter a reachable phone number'),
  buyerNotes: z.string().optional(),
  idFrontUrl: z.string().min(1, 'Upload the front of your ID'),
  idBackUrl: z.string().min(1, 'Upload the back of your ID'),
});

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const extractStoragePath = (fileUrl: string): string | null => {
  try {
    const url = new URL(fileUrl);
    const pathSegment = url.pathname.split('/o/')[1];
    if (!pathSegment) return null;
    const rawPath = pathSegment.split('?')[0];
    return decodeURIComponent(rawPath);
  } catch {
    return null;
  }
};

const PurchaseRequestDialog = ({ property, open, onOpenChange, onSubmitted }: PurchaseRequestDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createPurchaseRequest = useCreatePurchaseRequest();
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const buyerMarkupPercent = property.buyer_markup_percent ?? 5;
  const salePrice = property.sale_price ?? 0;
  const buyerMarkup = salePrice * (buyerMarkupPercent / 100);
  const buyerTotal = salePrice + buyerMarkup;

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      buyerName: user?.displayName || '',
      buyerEmail: user?.email || '',
      buyerPhone: '',
      buyerNotes: '',
      idFrontUrl: '',
      idBackUrl: '',
    },
  });

  const uploadIdFile = async (file: File, fieldName: 'idFrontUrl' | 'idBackUrl') => {
    if (!user) {
      toast({
        title: 'Please sign in first',
        description: 'You must be logged in to upload identification.',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Use a clear image of your ID (front or back).',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: 'File too large',
        description: 'Please upload a file under 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingField(fieldName);

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `purchase-ids/${user.uid}/${fieldName}-${Date.now()}.${ext}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);

      const existing = form.getValues(fieldName);
      if (existing) {
        const existingPath = extractStoragePath(existing);
        if (existingPath) {
          try {
            await deleteObject(ref(storage, existingPath));
          } catch (err) {
            console.warn('Failed to delete old ID image', err);
          }
        }
      }

      form.setValue(fieldName, url, { shouldDirty: true, shouldTouch: true });
    } catch (error) {
      console.error('ID upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload your ID. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof purchaseSchema>) => {
    if (!user) {
      toast({
        title: 'Please sign in first',
        description: 'Sign in to submit your purchase request.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPurchaseRequest.mutateAsync({
        property,
        buyerName: values.buyerName,
        buyerEmail: values.buyerEmail,
        buyerPhone: values.buyerPhone,
        buyerNotes: values.buyerNotes,
        buyerIdFrontUrl: values.idFrontUrl,
        buyerIdBackUrl: values.idBackUrl,
      });
      onSubmitted?.();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Purchase request submission failed:', error);
    }
  };

  const formattedTotal = `ZMW ${buyerTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buy this property</DialogTitle>
          <DialogDescription>
            Submit your contact details and national ID. The admin will reach out to complete the purchase offline. No
            online payment is collected here.
          </DialogDescription>
        </DialogHeader>

        {!user && (
          <Alert variant="destructive">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>Please sign in to submit your purchase request and upload ID images.</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Buyer total (includes {buyerMarkupPercent}% markup for platform handling)
            </p>
            <p className="text-xl font-semibold">{formattedTotal}</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            No online payment
          </Badge>
        </div>

        <Separator />

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="buyerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number *</FormLabel>
                    <FormControl>
                      <Input placeholder="0977 000 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buyerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes for the admin (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Share any timing, viewing, or financing details" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="idFrontUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID (Front) *</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={!user || uploadingField === 'idFrontUrl'}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) uploadIdFile(file, 'idFrontUrl');
                        }}
                      />
                    </FormControl>
                    {field.value && <p className="text-xs text-muted-foreground truncate">{field.value}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idBackUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID (Back) *</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={!user || uploadingField === 'idBackUrl'}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) uploadIdFile(file, 'idBackUrl');
                        }}
                      />
                    </FormControl>
                    {field.value && <p className="text-xs text-muted-foreground truncate">{field.value}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={createPurchaseRequest.isPending || !user}
                className="w-full md:w-auto"
              >
                {createPurchaseRequest.isPending ? 'Submitting...' : 'Submit request (no payment)'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <div className="text-xs text-muted-foreground">
          By submitting, you agree that the admin will contact you to continue the purchase off the platform.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseRequestDialog;
