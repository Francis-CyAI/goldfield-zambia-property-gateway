
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Import the new components
import PhotoUploadSection from './property-listing/PhotoUploadSection';
import PropertyInfoSection from './property-listing/PropertyInfoSection';
import AmenitiesSection from './property-listing/AmenitiesSection';
import RequirementsSection from './property-listing/RequirementsSection';
import QualificationCard from './property-listing/QualificationCard';
import ListingStandardsCard from './property-listing/ListingStandardsCard';

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
    form.reset();
  };

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
      <QualificationCard form={form} />

      {/* Property Listing Standards */}
      <ListingStandardsCard />

      {/* Main Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Property Photos */}
          <PhotoUploadSection form={form} />

          {/* Basic Information */}
          <PropertyInfoSection form={form} />

          {/* Amenities and Features */}
          <AmenitiesSection form={form} />

          {/* Essential Requirements */}
          <RequirementsSection form={form} />

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
