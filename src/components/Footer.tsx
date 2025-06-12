
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter, MessageCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const socialLinks = [
    { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/260972333053', color: 'text-green-500 hover:text-green-400' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/absrealestate', color: 'text-blue-500 hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/abs-real-estate', color: 'text-blue-600 hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/absrealestate', color: 'text-blue-400 hover:text-blue-300' },
  ];

  return (
    <footer className="bg-luxury-charcoal text-white relative overflow-hidden">
      {/* Luxury background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(251, 191, 36, 0.3) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 luxury-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold luxury-text-gradient font-playfair">ABS Business Solutions</h3>
                <p className="text-luxury-gold text-sm font-medium">Your Trusted Property Partner</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Leading real estate and business solutions company in Zambia, specializing in residential, commercial, 
              and agricultural properties. Serving local and diaspora clients with integrity, excellence, and luxury service.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} hover:scale-110 transition-all duration-300 p-2 rounded-lg hover:bg-white/10`}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-luxury-gold font-playfair">Contact Details</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">+260 972 333 053</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">WhatsApp Available</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300 text-sm">appletechbusinesssolutions@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center mt-1">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300">
                  123 Independence Avenue<br />
                  Lusaka, Zambia
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-luxury-gold font-playfair">Quick Links</h4>
            <div className="space-y-3">
              <a href="/services" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-300 hover:translate-x-1 transform">Property Services</a>
              <a href="/about" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-300 hover:translate-x-1 transform">About Us</a>
              <a href="/contact" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-300 hover:translate-x-1 transform">Contact</a>
              <a href="/login" className="block text-gray-300 hover:text-luxury-gold transition-colors duration-300 hover:translate-x-1 transform">Client Portal</a>
            </div>
          </div>
        </div>

        <div className="border-t border-luxury-gold/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-center md:text-left">
              © 2024 ABS Business Solutions. All rights reserved. | Licensed by PACRA & ZRA
            </p>
            <div className="mt-4 md:mt-0">
              <span className="text-luxury-gold font-medium">Luxury • Excellence • Trust</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
