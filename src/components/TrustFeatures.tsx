
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Clock, Users, CheckCircle, Heart, Phone } from 'lucide-react';

const TrustFeatures = () => {
  const features = [
    {
      icon: Shield,
      title: 'Verified Hosts',
      description: 'Every host is personally verified with ID and property checks',
      stat: '98% Verified',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      statColor: 'text-green-700'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Professional photos and detailed property descriptions',
      stat: '4.8★ Average',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      statColor: 'text-blue-700'
    },
    {
      icon: Clock,
      title: 'Instant Booking',
      description: 'Book instantly without waiting for host approval',
      stat: '2 Min Booking',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      statColor: 'text-orange-700'
    },
    {
      icon: Phone,
      title: '24/7 Support',
      description: 'Local customer support team available round the clock',
      stat: 'Always Available',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      statColor: 'text-purple-700'
    }
  ];

  const trustStats = [
    { label: 'Active Properties', value: '500+', description: 'Across all major cities' },
    { label: 'Happy Guests', value: '10,000+', description: 'And counting' },
    { label: 'Host Response Rate', value: '95%', description: 'Within 1 hour' },
    { label: 'Booking Success', value: '99.2%', description: 'Confirmed bookings' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Trusted by Thousands
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to creating a safe, reliable platform where both guests and hosts feel confident
          </p>
        </div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.color} hover:shadow-lg transition-all duration-300 border-2`}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                <Badge className={`${feature.statColor} bg-white border-0 font-bold`}>
                  {feature.stat}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Track Record</h3>
            <p className="text-gray-600">Numbers that speak for our commitment to excellence</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Host Verification Process */}
        <div className="mt-16 bg-white rounded-2xl border-2 border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-green-500" />
              <h3 className="text-2xl font-bold text-gray-900">Host Verification Process</h3>
            </div>
            <p className="text-gray-600">How we ensure every host meets our standards</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Identity Verification</h4>
              <p className="text-sm text-gray-600">Government ID and background checks</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Property Inspection</h4>
              <p className="text-sm text-gray-600">On-site visits and quality assessments</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ongoing Monitoring</h4>
              <p className="text-sm text-gray-600">Regular reviews and guest feedback</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustFeatures;
