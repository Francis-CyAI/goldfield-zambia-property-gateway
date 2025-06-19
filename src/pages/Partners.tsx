
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Leaf, Phone, Mail, Globe, MapPin, Star } from 'lucide-react';

const Partners = () => {
  const partners = [
    {
      id: 1,
      name: "AppleTech Business Solutions",
      description: "Leading technology solutions provider offering innovative business software, web development, and digital transformation services across Zambia.",
      logo: "/api/placeholder/150/150",
      category: "Technology Solutions",
      location: "Lusaka, Zambia",
      established: "2018",
      rating: 4.8,
      contact: {
        phone: "+260 977 123 456",
        email: "info@appletechzm.com",
        website: "www.appletechzambia.com"
      },
      services: [
        {
          name: "Web Development",
          description: "Custom websites and web applications for businesses of all sizes",
          price: "From K5,000"
        },
        {
          name: "Business Software Solutions",
          description: "ERP, CRM, and custom business management systems",
          price: "From K15,000"
        },
        {
          name: "Digital Marketing",
          description: "SEO, social media management, and online advertising campaigns",
          price: "From K2,500/month"
        },
        {
          name: "IT Consulting",
          description: "Technology strategy and digital transformation consulting",
          price: "K500/hour"
        }
      ],
      featured: true
    },
    {
      id: 2,
      name: "Goldfield Zambia Farm",
      description: "Premium agricultural producer specializing in sustainable farming practices, organic produce, and agricultural consulting services throughout Zambia.",
      logo: "/api/placeholder/150/150",
      category: "Agriculture & Farming",
      location: "Mumbwa District, Zambia",
      established: "2015",
      rating: 4.9,
      contact: {
        phone: "+260 966 789 012",
        email: "contact@goldfieldzmfarm.com",
        website: "www.goldfieldzambiafarm.com"
      },
      services: [
        {
          name: "Organic Produce Supply",
          description: "Fresh organic vegetables, fruits, and grains delivered to your location",
          price: "Market rates + delivery"
        },
        {
          name: "Agricultural Consulting",
          description: "Expert advice on crop selection, soil management, and farming techniques",
          price: "K300/consultation"
        },
        {
          name: "Farm Equipment Rental",
          description: "Modern farming equipment and machinery rental services",
          price: "From K200/day"
        },
        {
          name: "Training Programs",
          description: "Sustainable farming workshops and agricultural training courses",
          price: "K150/person"
        }
      ],
      featured: true
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Trusted Partners
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover quality services and products from our verified business partners. 
            From technology solutions to agricultural services, find what you need from trusted providers.
          </p>
        </div>

        {/* Partner Cards */}
        <div className="space-y-12">
          {partners.map((partner) => (
            <Card key={partner.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Partner Info */}
                <div className="lg:col-span-1 p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                      {partner.category === 'Technology Solutions' ? (
                        <Building2 className="h-12 w-12 text-primary" />
                      ) : (
                        <Leaf className="h-12 w-12 text-green-600" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{partner.name}</h2>
                    <Badge className="mb-3">{partner.category}</Badge>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{partner.rating}</span>
                      <span className="text-gray-600">/5.0</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 text-center">{partner.description}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{partner.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>Est. {partner.established}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{partner.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{partner.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>{partner.contact.website}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="lg:col-span-2 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Services & Products</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {partner.services.map((service, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-primary">{service.price}</span>
                            <Button size="sm" variant="outline">
                              Learn More
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button size="lg" className="flex-1 min-w-[200px]">
                      Contact {partner.name}
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1 min-w-[200px]">
                      View Portfolio
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Partnership Benefits */}
        <Card className="mt-16 bg-gradient-to-r from-primary to-secondary text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Become Our Partner
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join our network of trusted service providers and reach more customers 
              across Zambia through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
                Partner Application
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Partners;
