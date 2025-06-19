import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Home, MapPin, Users, Bed, Bath, Star, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const propertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  propertyType: z.string().min(1, 'Please select a property type'),
  location: z.string().min(1, 'Please select a location in Lusaka'),
  pricePerNight: z.number().min(50, 'Minimum price is K50 per night'),
  maxGuests: z.number().min(1).max(20, 'Maximum 20 guests allowed'),
  bedrooms: z.number().min(1, 'At least 1 bedroom required'),
  bathrooms: z.number().min(1, 'At least 1 bathroom required'),
  amenities: z.array(z.string()).min(3, 'At least 3 amenities required'),
  images: z.array(z.string())
    .min(10, 'Minimum 10 photos required for property listing')
    .max(15, 'Maximum 15 photos allowed for property listing'),
  hasElectricity: z.boolean().refine(val => val === true, 'Reliable electricity is required'),
  hasWater: z.boolean().refine(val => val === true, 'Running water is required'),
  hasInternet: z.boolean(),
  isSecure: z.boolean().refine(val => val === true, 'Security measures are required'),
  hasValidLicense: z.boolean().refine(val => val === true, 'Valid business license required'),
  agreesToTerms: z.boolean().refine(val => val === true, 'You must agree to our terms'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const PropertyListingForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      propertyType: '',
      location: '',
      pricePerNight: 100,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
      images: [],
      hasElectricity: false,
      hasWater: false,
      hasInternet: false,
      isSecure: false,
      hasValidLicense: false,
      agreesToTerms: false,
    },
  });

  const lusakaAreas = [
    'Obama (Central)',
    'Kabulonga',
    'Avondale',
    'Rhodes Park',
    'Longacres',
    'Chelston',
    'Woodlands',
    'Kalundu',
    'Kamwala',
    'City Centre',
    'Roma',
    'Kabwata',
    'Mtendere',
    'Garden',
    'Libala',
  ];

  const propertyTypes = [
    'Apartment',
    'House',
    'Townhouse',
    'Guest House',
    'Lodge',
    'Studio',
    'Duplex',
    'Flat',
  ];

  const availableAmenities = [
    'Wi-Fi Internet',
    'Air Conditioning',
    'Swimming Pool',
    'Gym/Fitness Center',
    'Parking',
    'Security Guard',
    'Generator/Backup Power',
    'Garden/Outdoor Space',
    'Kitchen/Kitchenette',
    'Laundry Facilities',
    'TV/Entertainment',
    'Hot Water',
    'Housekeeping',
    'Pet Friendly',
    'Wheelchair Accessible',
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

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
        
        // Create a temporary URL for display (in a real app, you'd upload to a server)
        const imageUrl = URL.createObjectURL(file);
        newImageUrls.push(imageUrl);
      }

      const updatedImages = [...uploadedImages, ...newImageUrls];
      setUploadedImages(updatedImages);
      form.setValue('images', updatedImages);
      
      toast({
        title: 'Images uploaded successfully',
        description: `${files.length} image(s) added. Total: ${updatedImages.length}/15`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    form.setValue('images', updatedImages);
    
    toast({
      title: 'Image removed',
      description: `Image removed. Total: ${updatedImages.length}/15`,
    });
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    console.log('Property listing data:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Property Listed Successfully!',
      description: 'Your property has been submitted for review. You will be notified within 24 hours.',
    });
    
    setIsSubmitting(false);
    setUploadedImages([]);
    form.reset();
  };

  const qualificationScore = () => {
    const values = form.getValues();
    let score = 0;
    
    if (values.hasElectricity) score += 20;
    if (values.hasWater) score += 20;
    if (values.isSecure) score += 15;
    if (values.hasValidLicense) score += 25;
    if (values.amenities.length >= 5) score += 10;
    if (values.pricePerNight >= 100) score += 10;
    
    return score;
  };

  const getQualificationStatus = () => {
    const score = qualificationScore();
    if (score >= 80) return { status: 'excellent', color: 'green', text: 'Excellent - Premium Listing' };
    if (score >= 60) return { status: 'good', color: 'blue', text: 'Good - Standard Listing' };
    return { status: 'needs-improvement', color: 'orange', text: 'Needs Improvement' };
  };

  const qualification = getQualificationStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold luxury-text-gradient mb-2">
          List Your Property in Lusaka
        </h1>
        <p className="text-gray-600">
          Join Zambia's premier accommodation platform in Obama, Lusaka
        </p>
      </div>

      {/* Qualification Status */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Listing Qualification Status
          </CardTitle>
          <CardDescription>
            Meet our standards to ensure quality accommodation for guests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge 
              className={`px-4 py-2 text-sm font-medium ${
                qualification.color === 'green' ? 'bg-green-100 text-green-800' :
                qualification.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}
            >
              {qualification.text}
            </Badge>
            <span className="text-lg font-bold">{qualificationScore()}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                qualification.color === 'green' ? 'bg-green-500' :
                qualification.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'
              }`}
              style={{ width: `${qualificationScore()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Listing Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Property Listing Standards for Lusaka, Obama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All properties must meet these minimum requirements to be listed on our platform.
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">✓ Essential Requirements</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Reliable electricity supply</li>
                <li>• Running water (24/7 preferred)</li>
                <li>• Basic security measures</li>
                <li>• Valid business/tourism license</li>
                <li>• Minimum 10-15 high-quality photos</li>
                <li>• Minimum 3 essential amenities</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">⭐ Premium Features</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Backup power (generator/solar)</li>
                <li>• High-speed internet</li>
                <li>• 24/7 security</li>
                <li>• Swimming pool/gym</li>
                <li>• Premium location in Obama</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Property Photos */}
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

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Beautiful 2BR Apartment in Obama, Lusaka" {...field} />
                    </FormControl>
                    <FormDescription>
                      Create an attractive title that highlights your property's best features
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your property, its features, nearby attractions, and what makes it special..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location in Lusaka *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select area in Lusaka" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lusakaAreas.map((area) => (
                            <SelectItem key={area} value={area.toLowerCase()}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="pricePerNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Night (ZMW) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={50}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Max Guests *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          max={20}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        Bedrooms *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        Bathrooms *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities and Features */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities & Features</CardTitle>
              <CardDescription>
                Select all amenities available at your property (minimum 3 required)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {availableAmenities.map((amenity) => (
                        <FormField
                          key={amenity}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={amenity}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(amenity)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, amenity])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== amenity
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {amenity}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Essential Requirements */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Essential Requirements</CardTitle>
              <CardDescription>
                All items below are mandatory for property listing approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hasElectricity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Reliable Electricity Supply *
                      </FormLabel>
                      <FormDescription>
                        Property has consistent electrical power (backup power preferred)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasWater"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Running Water Supply *
                      </FormLabel>
                      <FormDescription>
                        Property has reliable water supply (preferably 24/7)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSecure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Security Measures *
                      </FormLabel>
                      <FormDescription>
                        Property has adequate security (locked gates, security guard, or secure building)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasValidLicense"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Valid Business License *
                      </FormLabel>
                      <FormDescription>
                        Property has valid tourism/business license from Zambian authorities
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasInternet"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Internet Access (Recommended)
                      </FormLabel>
                      <FormDescription>
                        Property offers Wi-Fi or internet access for guests
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Terms and Agreement */}
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="agreesToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the Terms & Conditions *
                      </FormLabel>
                      <FormDescription>
                        I confirm that all information provided is accurate and I agree to maintain 
                        the quality standards required for listings in Lusaka, Obama.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button 
              type="submit" 
              size="lg" 
              className="luxury-gradient text-white px-8 py-3 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting for Review...' : 'Submit Property for Review'}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Your property will be reviewed within 24 hours
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PropertyListingForm;
