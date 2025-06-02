
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Globe, Heart } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Properties Sold', value: '500+', icon: Award },
    { label: 'Happy Clients', value: '1000+', icon: Users },
    { label: 'Years Experience', value: '10+', icon: Globe },
    { label: 'Diaspora Clients', value: '200+', icon: Heart }
  ];

  const team = [
    {
      name: 'Abraham Banda',
      role: 'CEO & Founder',
      description: 'Leading real estate professional with over 15 years of experience in Zambian property market.',
      speciality: 'Commercial Properties'
    },
    {
      name: 'Sarah Mwanza',
      role: 'Head of Sales',
      description: 'Expert in residential properties with a passion for helping families find their dream homes.',
      speciality: 'Residential Sales'
    },
    {
      name: 'David Phiri',
      role: 'Agricultural Properties Specialist',
      description: 'Specialized in farm and agricultural land transactions across Zambia.',
      speciality: 'Agricultural Land'
    },
    {
      name: 'Grace Tembo',
      role: 'Diaspora Relations Manager',
      description: 'Dedicated to serving Zambians abroad with virtual tours and remote transactions.',
      speciality: 'International Clients'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About ABS Real Estate
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Your trusted partner in Zambian real estate, serving local and international clients 
            with integrity, expertise, and exceptional service since 2014.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-primary text-white px-4 py-2">PACRA Registered</Badge>
            <Badge className="bg-secondary text-white px-4 py-2">ZRA Compliant</Badge>
            <Badge className="bg-primary text-white px-4 py-2">Licensed Realtor</Badge>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To provide exceptional real estate services that connect people with their perfect properties 
                while maintaining the highest standards of integrity, professionalism, and customer satisfaction. 
                We are committed to making property transactions seamless for both local and diaspora clients.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                To become Zambia's leading real estate company, recognized for innovation, excellence, 
                and our unique expertise in serving the diaspora community. We envision a future where 
                every Zambian, whether at home or abroad, can easily invest in their homeland.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-gray-900">Our Story</CardTitle>
            <CardDescription className="text-center text-lg">
              Founded with a vision to transform Zambian real estate
            </CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 mb-4">
                  ABS Real Estate was founded in 2014 by Abraham Banda, a visionary entrepreneur who 
                  recognized the need for a professional, trustworthy real estate company in Zambia. 
                  Starting with a small office in Lusaka, we had a simple mission: to help people 
                  find their perfect properties while maintaining transparency and integrity.
                </p>
                <p className="text-gray-700 mb-4">
                  Over the years, we've grown to become one of Zambia's most trusted real estate companies, 
                  with a special focus on serving the diaspora community. We understand the unique challenges 
                  faced by Zambians living abroad who want to invest back home, and we've developed specialized 
                  services to meet their needs.
                </p>
                <p className="text-gray-700">
                  Today, we're proud to have helped over 1,000 clients find their dream properties, 
                  facilitated hundreds of successful transactions, and built lasting relationships with 
                  families across Zambia and around the world.
                </p>
              </div>
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                <Users className="h-24 w-24 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              Experienced professionals dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-3">{member.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {member.speciality}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Our Core Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-xl font-semibold mb-3">Integrity</h3>
                <p className="opacity-90">
                  We conduct all business with honesty, transparency, and ethical practices
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="opacity-90">
                  We strive for the highest quality in every service we provide
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Innovation</h3>
                <p className="opacity-90">
                  We embrace technology and new approaches to better serve our clients
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
