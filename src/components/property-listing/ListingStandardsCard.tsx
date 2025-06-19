
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ListingStandardsCard = () => {
  return (
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
  );
};

export default ListingStandardsCard;
