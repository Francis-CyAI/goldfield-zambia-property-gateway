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
  Video,
  Crown,
  Star
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
      description: "Thank you for contacting ABS Business Solutions. We'll get back to you within 24 hours.",
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
      title: 'Phone Number',
      details: ['+260 972 333 053'],
      action: 'Call Now',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: ['+260 972 333 053'],
      action: 'Chat on WhatsApp',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['appletechbusinesssolutions@gmail.com'],
      action: 'Send Email',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      details: ['123 Independence Avenue', 'Lusaka, Zambia'],
      action: 'Get Directions',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const socialLinks = [
    { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/260972333053', color: 'text-green-500 hover:text-green-400' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/absrealestate', color: 'text-blue-500 hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/abs-real-estate', color: 'text-blue-600 hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/absrealestate', color: 'text-blue-400 hover:text-blue-300' },
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
    <div className="min-h-screen py-12 bg-gradient-to-b from-luxury-cream to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Crown className="h-10 w-10 text-luxury-gold" />
            <h1 className="text-5xl md:text-6xl font-bold text-luxury-charcoal font-playfair">
              Contact Us
            </h1>
            <Crown className="h-10 w-10 text-luxury-gold" />
          </div>
          <div className="w-32 h-1 luxury-gradient mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-luxury-charcoal/80 max-w-4xl mx-auto leading-relaxed">
            Experience luxury service like never before. Connect with our expert team for personalized 
            property solutions that exceed expectations, whether you're in Zambia or anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="lg:order-1 border-2 border-luxury-gold/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-luxury-gold/10 to-luxury-gold-dark/10 border-b border-luxury-gold/20">
              <CardTitle className="text-3xl font-playfair text-luxury-charcoal flex items-center space-x-2">
                <Star className="h-6 w-6 text-luxury-gold" />
                <span>Send Us a Message</span>
              </CardTitle>
              <CardDescription className="text-luxury-charcoal/70 text-lg">
                Experience our premium service - we respond within 4 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-luxury-charcoal mb-3">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      className="border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold/20 h-12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-luxury-charcoal mb-3">
                      Phone Number *
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+260 xxx xxx xxx"
                      className="border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold/20 h-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-luxury-charcoal mb-3">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold/20 h-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-luxury-charcoal mb-3">
                      Service Needed
                    </label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                      <SelectTrigger className="border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold/20 h-12">
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
                    <label className="block text-sm font-semibold text-luxury-charcoal mb-3">
                      Property Type
                    </label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger className="border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold/20 h-12">
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
                  <label className="block text-sm font-semibold text-luxury-charcoal mb-3">
                    Preferred Location
                  </label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger className="border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold/20 h-12">
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
                  <label className="block text-sm font-semibold text-luxury-charcoal mb-3">
                    Message *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your luxury property needs, budget range, timeline, or any specific requirements..."
                    rows={4}
                    className="border-luxury-gold/30 focus:border-luxury-gold focus:ring-luxury-gold/20"
                    required
                  />
                </div>

                <Button type="submit" className="w-full luxury-gradient text-white hover:shadow-xl transition-all duration-300 h-12 text-lg font-semibold">
                  <Send className="h-5 w-5 mr-2" />
                  Send Premium Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="lg:order-2 space-y-6">
            {/* Contact Details */}
            <div className="grid grid-cols-1 gap-6">
              {contactInfo.map((contact, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 border-luxury-gold/20 hover:border-luxury-gold/50 group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-14 h-14 bg-gradient-to-r ${contact.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <contact.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-luxury-charcoal mb-3 font-playfair">
                          {contact.title}
                        </h3>
                        {contact.details.map((detail, idx) => (
                          <p key={idx} className="text-luxury-charcoal/70 font-medium mb-1">
                            {detail}
                          </p>
                        ))}
                        <Button variant="outline" size="sm" className="mt-4 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300">
                          {contact.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Business Hours */}
            <Card className="border-2 border-luxury-gold/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 luxury-gradient rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-luxury-charcoal mb-3 font-playfair">
                      Business Hours
                    </h3>
                    <div className="space-y-2 text-luxury-charcoal/70 font-medium">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                      <p className="text-luxury-gold font-semibold mt-3 flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>Premium support available 24/7</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="luxury-gradient text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 font-playfair flex items-center space-x-2">
                  <Crown className="h-6 w-6" />
                  <span>Luxury Services</span>
                </h3>
                <div className="space-y-4">
                  <Button variant="secondary" className="w-full bg-white text-luxury-charcoal hover:bg-gray-100 font-semibold h-12">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Premium Property Viewing
                  </Button>
                  <Button variant="secondary" className="w-full bg-white text-luxury-charcoal hover:bg-gray-100 font-semibold h-12">
                    <Video className="h-5 w-5 mr-2" />
                    Book VIP Virtual Consultation
                  </Button>
                  <Button variant="secondary" className="w-full bg-white text-luxury-charcoal hover:bg-gray-100 font-semibold h-12">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    WhatsApp Premium Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="border-2 border-luxury-gold/20 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-luxury-charcoal mb-4 font-playfair">
                  Connect With Us
                </h3>
                <div className="flex space-x-4 mb-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${social.color} hover:scale-110 transition-all duration-300 p-3 rounded-xl hover:bg-gray-100`}
                    >
                      <social.icon className="h-8 w-8" />
                    </a>
                  ))}
                </div>
                <p className="text-luxury-charcoal/70 text-sm">
                  Follow us for exclusive luxury property listings and premium market insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="mt-16 border-2 border-luxury-gold/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-luxury-gold/10 to-luxury-gold-dark/10 border-b border-luxury-gold/20">
            <CardTitle className="text-3xl text-center font-playfair text-luxury-charcoal flex items-center justify-center space-x-2">
              <MapPin className="h-8 w-8 text-luxury-gold" />
              <span>Visit Our Luxury Office</span>
            </CardTitle>
            <CardDescription className="text-center text-lg text-luxury-charcoal/70">
              Located in the prestigious heart of Lusaka, designed for your comfort and convenience
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-gradient-to-br from-luxury-cream to-luxury-gold/20 rounded-xl h-64 flex items-center justify-center border-2 border-luxury-gold/30">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-luxury-gold mx-auto mb-4" />
                <p className="text-luxury-charcoal font-semibold text-lg">Premium Interactive Map Coming Soon</p>
                <p className="text-luxury-charcoal/70 mt-2">123 Independence Avenue, Lusaka, Zambia</p>
                <Button className="mt-4 luxury-gradient text-white font-semibold">
                  Get Directions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
