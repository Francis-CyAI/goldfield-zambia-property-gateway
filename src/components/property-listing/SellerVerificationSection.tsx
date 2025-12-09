import { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/constants/firebase';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FileUp, ShieldCheck, Trash2 } from 'lucide-react';

interface SellerVerificationSectionProps {
  form: UseFormReturn<any>;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_DOC_TYPES = ['image/', 'application/pdf'];

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

const SellerVerificationSection = ({ form }: SellerVerificationSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const ownershipDocs = form.watch('ownershipDocuments') ?? [];

  const canUpload = useMemo(() => !!user, [user]);

  const uploadSingleFile = async (file: File, targetField: 'sellerIdFront' | 'sellerIdBack') => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in before uploading verification files.',
        variant: 'destructive',
      });
      return;
    }

    if (!ACCEPTED_DOC_TYPES.some((type) => file.type.startsWith(type))) {
      toast({
        title: 'Invalid file',
        description: 'Use an image or PDF for identification.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: 'File too large',
        description: 'Maximum size is 10MB per file.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingField(targetField);

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const storagePath = `seller-verification/${user.uid}/${targetField}-${Date.now()}.${ext}`;
      const fileRef = ref(storage, storagePath);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(fileRef);

      const existingUrl = form.getValues(targetField);
      if (existingUrl) {
        const existingPath = extractStoragePath(existingUrl);
        if (existingPath) {
          try {
            await deleteObject(ref(storage, existingPath));
          } catch (deleteErr) {
            console.warn('Failed to delete old verification file', deleteErr);
          }
        }
      }

      form.setValue(targetField, downloadUrl, { shouldDirty: true, shouldTouch: true });
      toast({
        title: 'Upload successful',
        description: `${targetField === 'sellerIdFront' ? 'Front' : 'Back'} of your ID uploaded.`,
      });
    } catch (error) {
      console.error('Verification upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const uploadOwnershipDocs = async (files: FileList) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in before uploading documents.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingField('ownershipDocuments');

    const currentDocs = form.getValues('ownershipDocuments') ?? [];
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!ACCEPTED_DOC_TYPES.some((type) => file.type.startsWith(type))) {
          toast({
            title: 'Invalid file',
            description: 'Only images or PDFs are allowed.',
            variant: 'destructive',
          });
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds the 10MB limit.`,
            variant: 'destructive',
          });
          continue;
        }

        const ext = file.name.split('.').pop() ?? 'pdf';
        const storagePath = `ownership-documents/${user.uid}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const fileRef = ref(storage, storagePath);
        await uploadBytes(fileRef, file, { contentType: file.type });
        const url = await getDownloadURL(fileRef);
        newUrls.push(url);
      }

      if (newUrls.length > 0) {
        const merged = [...currentDocs, ...newUrls];
        form.setValue('ownershipDocuments', merged, { shouldDirty: true, shouldTouch: true });
        toast({
          title: 'Documents uploaded',
          description: `${newUrls.length} file(s) added for ownership verification.`,
        });
      }
    } catch (error) {
      console.error('Ownership docs upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingField(null);
    }
  };

  const removeOwnershipDoc = async (index: number) => {
    const docToRemove = ownershipDocs[index];
    const updated = ownershipDocs.filter((_, idx) => idx !== index);
    form.setValue('ownershipDocuments', updated, { shouldDirty: true, shouldTouch: true });

    try {
      const path = extractStoragePath(docToRemove);
      if (path) {
        await deleteObject(ref(storage, path));
      }
    } catch (error) {
      console.warn('Failed to delete ownership doc from storage', error);
    }

    toast({
      title: 'Removed',
      description: 'The document has been removed from your submission.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Seller verification & proof of ownership
        </CardTitle>
        <CardDescription>
          For properties listed for sale, upload your national ID (front & back) plus at least one ownership document so
          buyers and admins can verify you quickly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="sellerContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller full name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Chanda Mwansa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellerContactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellerContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile number *</FormLabel>
                <FormControl>
                  <Input placeholder="0977 000 000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sellerIdFront"
            render={({ field }) => (
              <FormItem>
            <FormLabel>National ID (Front) {`(required for sale)`}</FormLabel>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    disabled={!canUpload || uploadingField === 'sellerIdFront'}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadSingleFile(file, 'sellerIdFront');
                    }}
                  />
                  {field.value && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={async () => {
                        const path = extractStoragePath(field.value);
                        if (path) {
                          try {
                            await deleteObject(ref(storage, path));
                          } catch (err) {
                            console.warn('Failed to delete ID front', err);
                          }
                        }
                        form.setValue('sellerIdFront', '', { shouldDirty: true, shouldTouch: true });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {field.value && (
                  <p className="text-xs text-muted-foreground truncate">{field.value}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sellerIdBack"
            render={({ field }) => (
              <FormItem>
            <FormLabel>National ID (Back) {`(required for sale)`}</FormLabel>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    disabled={!canUpload || uploadingField === 'sellerIdBack'}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadSingleFile(file, 'sellerIdBack');
                    }}
                  />
                  {field.value && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={async () => {
                        const path = extractStoragePath(field.value);
                        if (path) {
                          try {
                            await deleteObject(ref(storage, path));
                          } catch (err) {
                            console.warn('Failed to delete ID back', err);
                          }
                        }
                        form.setValue('sellerIdBack', '', { shouldDirty: true, shouldTouch: true });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {field.value && (
                  <p className="text-xs text-muted-foreground truncate">{field.value}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ownershipDocuments"
          render={() => (
            <FormItem>
          <FormLabel>Property ownership documents {`(required for sale)`}</FormLabel>
              <div className="border rounded-md p-4 space-y-3 bg-slate-50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Upload title deeds, sales agreements, or proof of ownership (PDF or images).
                  </p>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-primary cursor-pointer">
                    <FileUp className="h-4 w-4" />
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={!canUpload || uploadingField === 'ownershipDocuments'}
                      onChange={(event) => {
                        if (event.target.files) {
                          uploadOwnershipDocs(event.target.files);
                          event.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>

                {ownershipDocs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No documents uploaded yet. At least one document is required.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {ownershipDocs.map((doc: string, index: number) => (
                      <div
                        key={doc}
                        className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        <span className="truncate flex-1 mr-2">{doc}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOwnershipDoc(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default SellerVerificationSection;
