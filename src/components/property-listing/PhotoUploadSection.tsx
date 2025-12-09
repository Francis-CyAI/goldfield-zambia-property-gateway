import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/constants/firebase';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

interface PhotoUploadSectionProps {
  form: UseFormReturn<any>;
}

const MAX_IMAGES = 15;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const extractStoragePath = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const pathSegment = url.pathname.split('/o/')[1];
    if (!pathSegment) return null;
    const rawPath = pathSegment.split('?')[0];
    return decodeURIComponent(rawPath);
  } catch {
    return null;
  }
};

const PhotoUploadSection = ({ form }: PhotoUploadSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<string[]>(() => form.getValues('images') ?? []);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    setUploadedImages(form.getValues('images') ?? []);
  }, [form]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    if (uploadedImages.length + files.length > MAX_IMAGES) {
      toast({
        title: 'Too many images',
        description: `You can upload a maximum of ${MAX_IMAGES} photos.`,
        variant: 'destructive',
      });
      return;
    }

    setImageUploading(true);

    try {
      const newImageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: 'Please upload only image files.',
            variant: 'destructive',
          });
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: 'File too large',
            description: `${file.name} is too large. Maximum size is 10MB.`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop() ?? 'jpg';
        const storagePath = `property-images/${user.uid}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, file, {
          contentType: file.type,
        });

        const downloadUrl = await getDownloadURL(storageRef);
        newImageUrls.push(downloadUrl);
      }

      if (newImageUrls.length > 0) {
        const updatedImages = [...uploadedImages, ...newImageUrls];
        setUploadedImages(updatedImages);
        form.setValue('images', updatedImages, { shouldDirty: true, shouldTouch: true });

        toast({
          title: 'Images uploaded successfully',
          description: `${newImageUrls.length} image(s) added. Total: ${updatedImages.length}/${MAX_IMAGES}`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setImageUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = uploadedImages[indexToRemove];

    try {
      const storagePath = extractStoragePath(imageToRemove);
      if (storagePath) {
        const imageRef = ref(storage, storagePath);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error('Error removing file from storage:', error);
    }

    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    form.setValue('images', updatedImages, { shouldDirty: true, shouldTouch: true });

    toast({
      title: 'Image removed',
      description: `Image removed. Total: ${updatedImages.length}/${MAX_IMAGES}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Property Photos
        </CardTitle>
        <CardDescription>
          Upload clear photos of every room (living areas, all bedrooms, kitchen, bathrooms) plus exterior shots. You can
          add up to {MAX_IMAGES} photos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <div className="grid gap-4">
                <label className="block">
                  <span className="sr-only">Choose property photos</span>
                  <div
                    className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="h-10 w-10 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 10MB each — {uploadedImages.length}/{MAX_IMAGES} uploaded
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={imageUploading || !user}
                  />
                </label>

                {uploadedImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={image} className="relative group">
                        <img
                          src={image}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No images uploaded yet. Add high-quality photos to showcase the property.
                  </p>
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

export default PhotoUploadSection;
