
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCreateProperty } from '@/hooks/useProperties';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Import the new components
import PhotoUploadSection from './property-listing/PhotoUploadSection';
import PropertyInfoSection from './property-listing/PropertyInfoSection';
import AmenitiesSection from './property-listing/AmenitiesSection';
import RequirementsSection from './property-listing/RequirementsSection';
import QualificationCard from './property-listing/QualificationCard';
import ListingStandardsCard from './property-listing/ListingStandardsCard';
import SellerVerificationSection from './property-listing/SellerVerificationSection';
import SalePricingNotice from './property-listing/SalePricingNotice';

const PLATFORM_FEE_PERCENT = Number(import.meta.env.VITE_PLATFORM_FEE_PERCENT ?? 10);
const BUYER_MARKUP_PERCENT = 5;

const propertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  propertyType: z.string().min(1, 'Please select a property type'),
  location: z.string().min(1, 'Please select a location in Lusaka'),
  listingType: z.enum(['rental', 'sale']),
  pricePerNight: z.number().nullable().optional(),
  salePrice: z.number().nullable().optional(),
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
  sellerContactName: z.string().min(2, 'Please provide the primary seller name'),
  sellerContactEmail: z.string().email('Enter a valid email for buyer and admin contact'),
  sellerContactPhone: z.string().min(9, 'Enter a valid phone number'),
  sellerIdFront: z.string().optional(),
  sellerIdBack: z.string().optional(),
  ownershipDocuments: z.array(z.string()).optional(),
  agreesToTerms: z.boolean().refine(val => val === true, 'You must agree to our terms'),
}).superRefine((data, ctx) => {
  if (data.listingType === 'rental') {
    if (!data.pricePerNight || data.pricePerNight < 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pricePerNight'],
        message: 'Please enter a nightly rate of at least K50.',
      });
    }
  }

  if (data.listingType === 'sale') {
    if (!data.salePrice || data.salePrice < 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salePrice'],
        message: 'Sale price should be at least K10,000.',
      });
    }
    if (!data.sellerIdFront) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sellerIdFront'],
        message: 'Upload the front of your national ID for sale listings.',
      });
    }
    if (!data.sellerIdBack) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sellerIdBack'],
        message: 'Upload the back of your national ID for sale listings.',
      });
    }
    if (!data.ownershipDocuments || data.ownershipDocuments.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ownershipDocuments'],
        message: 'Upload at least one ownership document for sale listings.',
      });
    }
  }
});

type PropertyFormData = z.infer<typeof propertySchema>;

const PropertyListingForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProperty = useCreateProperty();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      propertyType: '',
      location: '',
      listingType: 'sale',
      pricePerNight: 100,
      salePrice: 250000,
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
      sellerContactEmail: '',
      sellerContactName: '',
      sellerContactPhone: '',
      sellerIdFront: '',
      sellerIdBack: '',
      ownershipDocuments: [],
      agreesToTerms: false,
    },
  });

  const listingType = form.watch('listingType');
  const salePriceValue = form.watch('salePrice') ?? 0;

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to list a property.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    console.log('Submitting property listing data:', data);

    try {
      const isSaleListing = data.listingType === 'sale';
      const salePriceValue = isSaleListing ? data.salePrice ?? 0 : null;

      await createProperty.mutateAsync({
        title: data.title,
        description: data.description,
        property_type: data.propertyType,
        location: data.location,
        listing_type: data.listingType,
        sale_status: isSaleListing ? 'available' : undefined,
        sale_price: isSaleListing ? salePriceValue : null,
        price_per_night: isSaleListing ? null : data.pricePerNight,
        max_guests: data.maxGuests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        amenities: data.amenities,
        images: data.images,
        buyer_markup_percent: isSaleListing ? BUYER_MARKUP_PERCENT : null,
        platform_fee_percent: isSaleListing ? PLATFORM_FEE_PERCENT : null,
        seller_contact_email: data.sellerContactEmail,
        seller_contact_name: data.sellerContactName,
        seller_contact_phone: data.sellerContactPhone,
        seller_id_front_url: data.sellerIdFront,
        seller_id_back_url: data.sellerIdBack,
        ownership_documents: data.ownershipDocuments,
        is_active: false,
        approval_status: 'pending',
      });

      // Redirect to property owner dashboard after successful listing
      navigate('/property-owner-dashboard');
    } catch (error) {
      console.error('Property listing error:', error);
      toast({
        title: 'Listing Failed',
        description: 'There was an error listing your property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to list a property on our platform.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg">
              Sign In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-4 text-sm">
        <p>
          Listings are reviewed by our team before they go live. Once submitted, your property will remain
          <span className="font-semibold"> pending approval</span> until an admin verifies the details.
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

          {/* Sale pricing transparency */}
          {listingType === 'sale' && (
            <SalePricingNotice
              salePrice={typeof salePriceValue === 'number' ? salePriceValue : 0}
              platformFeePercent={PLATFORM_FEE_PERCENT}
              buyerMarkupPercent={BUYER_MARKUP_PERCENT}
            />
          )}

          {/* Amenities and Features */}
          <AmenitiesSection form={form} />

          {/* Essential Requirements */}
          <RequirementsSection form={form} />

          {/* Seller verification & ownership docs */}
          <SellerVerificationSection form={form} />

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
              disabled={createProperty.isPending}
            >
              {createProperty.isPending ? 'Submitting for Review...' : 'Submit Property for Review'}
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
