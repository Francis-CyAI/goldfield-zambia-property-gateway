
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoUploadSectionProps {
  form: UseFormReturn<any>;
}

const PhotoUploadSection = ({ form }: PhotoUploadSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    if (uploadedImages.length + files.length > 15) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 15 photos.',
        variant: 'destructive',
      });
      return;
    }

    setImageUploading(true);

    try {
      const newImageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: 'Please upload only image files.',
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} is too large. Maximum size is 10MB.`,
            variant: 'destructive',
          });
          continue;
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        console.log('Uploading file:', fileName);

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: 'destructive',
          });
          continue;
        }

        // Get public URL
        const { data: publicData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        if (publicData?.publicUrl) {
          newImageUrls.push(publicData.publicUrl);
        }
      }

      if (newImageUrls.length > 0) {
        const updatedImages = [...uploadedImages, ...newImageUrls];
        setUploadedImages(updatedImages);
        form.setValue('images', updatedImages);
        
        toast({
          title: 'Images uploaded successfully',
          description: `${newImageUrls.length} image(s) added. Total: ${updatedImages.length}/15`,
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
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = uploadedImages[indexToRemove];
    
    try {
      // Extract filename from URL to delete from storage
      const url = new URL(imageToRemove);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-2).join('/'); // Get user_id/filename

      console.log('Deleting file:', fileName);

      // Delete from Supabase storage
      const { error } = await supabase.storage
        .from('property-images')
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
      }
    } catch (error) {
      console.error('Error removing file from storage:', error);
    }

    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    form.setValue('images', updatedImages);
    
    toast({
      title: 'Image removed',
      description: `Image removed. Total: ${updatedImages.length}/15`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Property Photos (Required: 10-15 photos)
        </CardTitle>
        <CardDescription>
          Upload high-quality photos that showcase your property. Minimum 10 photos required, maximum 15 allowed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <div className="space-y-4">
                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="image-upload" 
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                      uploadedImages.length >= 15 ? 'opacity-50 cursor-not-allowed' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> property photos
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG (MAX. 10MB each)
                      </p>
                      <p className="text-xs text-primary mt-1">
                        {uploadedImages.length}/15 photos uploaded
                      </p>
                    </div>
                    <input 
                      id="image-upload" 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadedImages.length >= 15 || imageUploading}
                    />
                  </label>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={uploadedImages.length >= 10 ? 'text-green-600' : 'text-orange-600'}>
                      Photos: {uploadedImages.length}/15
                    </span>
                    <span className={uploadedImages.length >= 10 ? 'text-green-600' : 'text-orange-600'}>
                      {uploadedImages.length >= 10 ? '✓ Minimum met' : `Need ${10 - uploadedImages.length} more`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        uploadedImages.length >= 10 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min((uploadedImages.length / 15) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {imageUploading && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
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

export default PhotoUploadSection;
