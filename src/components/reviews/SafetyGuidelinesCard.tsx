
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  Star, 
  Eye,
  UserCheck,
  Clock
} from 'lucide-react';

const SafetyGuidelinesCard = () => {
  const guidelines = [
    {
      icon: Shield,
      title: 'Maintain High Safety Standards',
      description: 'Ensure all safety equipment (smoke detectors, fire extinguishers) are functional and easily accessible.',
      level: 'critical'
    },
    {
      icon: CheckCircle,
      title: 'Accurate Property Descriptions',
      description: 'Provide honest, detailed descriptions and recent photos to set proper expectations.',
      level: 'important'
    },
    {
      icon: MessageSquare,
      title: 'Respond Professionally',
      description: 'Address negative reviews constructively and offer solutions when appropriate.',
      level: 'recommended'
    },
    {
      icon: UserCheck,
      title: 'Guest Verification',
      description: 'Use the platform\'s verification tools to ensure guest identity and reduce risks.',
      level: 'recommended'
    },
    {
      icon: Clock,
      title: 'Timely Communication',
      description: 'Respond to inquiries and issues promptly to maintain good guest relationships.',
      level: 'important'
    },
    {
      icon: Eye,
      title: 'Regular Property Inspections',
      description: 'Conduct thorough cleaning and maintenance between stays to ensure quality.',
      level: 'critical'
    }
  ];

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'recommended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIconColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600';
      case 'important':
        return 'text-orange-600';
      case 'recommended':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Host Safety Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guidelines.map((guideline, index) => {
              const IconComponent = guideline.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${getIconColor(guideline.level)}`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{guideline.title}</h4>
                      <Badge className={getBadgeColor(guideline.level)}>
                        {guideline.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{guideline.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Review Response Best Practices:</strong> When responding to negative reviews, 
          acknowledge the guest's concerns, apologize for any inconvenience, explain any 
          improvements made, and invite them to stay again. Never be defensive or argumentative.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Review Quality Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-800">Do's</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Thank guests for their feedback</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Address specific concerns mentioned</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Highlight improvements made</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Keep responses professional and brief</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-800">Don'ts</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Get defensive or argumentative</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Share private information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Make personal attacks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Write overly long responses</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetyGuidelinesCard;
