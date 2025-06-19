
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface QualificationCardProps {
  form: UseFormReturn<any>;
}

const QualificationCard = ({ form }: QualificationCardProps) => {
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
  );
};

export default QualificationCard;
