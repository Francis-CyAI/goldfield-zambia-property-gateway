
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

interface AmenitiesSectionProps {
  form: UseFormReturn<any>;
}

const AmenitiesSection = ({ form }: AmenitiesSectionProps) => {
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

  return (
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
  );
};

export default AmenitiesSection;
