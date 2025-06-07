
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Zap, Star } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Legal Compliance',
      description: 'PACRA & ZRA registered with full legal documentation support'
    },
    {
      icon: Users,
      title: 'Diaspora Friendly',
      description: 'Special services for Zambians abroad with virtual tours and remote transactions'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Quick property transfers and efficient documentation handling'
    },
    {
      icon: Star,
      title: 'Trusted Partner',
      description: 'Years of experience serving local and international clients'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose ABS Real Estate?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing exceptional service and expertise in the Zambian property market
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
