
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  DollarSign, 
  Building, 
  Globe, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesNavigation = () => {
  const services = [
    {
      id: 'buy',
      title: 'Buy Property',
      icon: ShoppingCart,
      description: 'Find your perfect property',
      features: ['Company-owned properties', 'Agent assistance', 'Legal verification'],
      color: 'bg-green-100 text-green-800',
      badge: 'Popular'
    },
    {
      id: 'sell',
      title: 'Sell Property',
      icon: DollarSign,
      description: 'Get the best value for your property',
      features: ['Free valuation', 'Professional marketing', 'Legal support'],
      color: 'bg-blue-100 text-blue-800',
      badge: 'Featured'
    },
    {
      id: 'rent',
      title: 'List for Rent',
      icon: Building,
      description: 'Maximize your rental income',
      features: ['Tenant screening', 'Property management', 'Rent collection'],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'diaspora',
      title: 'Diaspora Services',
      icon: Globe,
      description: 'Services for Zambians abroad',
      features: ['Virtual tours', 'Remote transactions', 'Investment consultation'],
      color: 'bg-orange-100 text-orange-800',
      badge: 'Special'
    }
  ];

  return (
    <div className="w-full bg-gradient-to-r from-primary/5 to-secondary/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive real estate solutions tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {services.map((service) => (
            <Card key={service.id} className="relative hover:shadow-lg transition-all duration-300 group">
              {service.badge && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className={service.color}>
                    {service.badge}
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                
                <ul className="space-y-1 mb-4">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 text-primary mr-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="group-hover:bg-primary group-hover:text-white transition-colors"
                  asChild
                >
                  <Link to="/services">
                    Learn More
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
            <Link to="/services">
              View All Services
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesNavigation;
