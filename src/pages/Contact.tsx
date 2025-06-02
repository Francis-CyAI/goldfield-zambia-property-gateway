
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Facebook, 
  Linkedin, 
  Twitter,
  Send,
  Calendar,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    propertyType: '',
    location: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent Successfully!",
      description: "Thank you for contacting us. We'll get back to you within 24 hours.",
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: '',
      propertyType: '',
      location: '',
      message: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: ['+260 123 456 789', '+260 987 654 321'],
      action: 'Call Now'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: ['+260 123 456 789'],
      action: 'Chat on WhatsApp'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@absrealestate.zm', 'sales@absrealestate.zm'],
      action: 'Send Email'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      details: ['123 Independence Avenue', 'Lusaka, Zambia'],
      action: 'Get Directions'
    }
  ];

  const socialLinks = [
    { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/260123456789', color: 'text-green-600' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/absrealestate', color: 'text-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/abs-real-estate', color: 'text-blue-700' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/absrealestate', color: 'text-blue-400' },
  ];

  const services = [
    'Buy a Property',
    'Sell Your Property', 
    'List for Rent',
    'Property Valuation',
    'Diaspora Services',
    'Investment Consultation',
    'Legal Documentation',
    'Property Management'
  ];

  const propertyTypes = [
    'Residential House',
    'Farm/Agricultural Land',
    'Commercial Plot',
    'Office Space',
    'Warehouse',
    'Boarding House',
    'Furnished Apartment',
    'Shop/Retail Space'
  ];

  const locations = [
    'Lusaka',
    'Ndola', 
    'Kitwe',
    'Livingstone',
    'Kabwe',
    'Mumbwa',
    'Kafue',
    'Chongwe',
    'Other'
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your property journey? Get in touch with our expert team. 
            We're here to help whether you're in Zambia or anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="lg:order-1">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+260 xxx xxx xxx"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Needed
                    </label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Location
                  </label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your property needs, budget range, timeline, or any specific requirements..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="lg:order-2 space-y-6">
            {/* Contact Details */}
            <div className="grid grid-cols-1 gap-4">
              {contactInfo.map((contact, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                        <contact.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {contact.title}
                        </h3>
                        {contact.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600">
                            {detail}
                          </p>
                        ))}
                        <Button variant="outline" size="sm" className="mt-3">
                          {contact.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Business Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Business Hours
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                      <p className="text-sm text-primary font-medium mt-2">
                        Emergency contacts available 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule a Property Viewing
                  </Button>
                  <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
                    <Video className="h-4 w-4 mr-2" />
                    Book Virtual Consultation
                  </Button>
                  <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Us Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${social.color} hover:scale-110 transition-transform duration-200`}
                    >
                      <social.icon className="h-8 w-8" />
                    </a>
                  ))}
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  Stay connected for the latest property listings and market updates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Visit Our Office</CardTitle>
            <CardDescription className="text-center">
              We're located in the heart of Lusaka, easily accessible from anywhere in the city
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive Map Coming Soon</p>
                <p className="text-sm text-gray-500">123 Independence Avenue, Lusaka, Zambia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
