
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const socialLinks = [
    { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/260123456789', color: 'text-green-600' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/absrealestate', color: 'text-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/abs-real-estate', color: 'text-blue-700' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/absrealestate', color: 'text-blue-400' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">ABS Real Estate</h3>
                <p className="text-secondary text-sm">Your Trusted Property Partner</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Leading real estate company in Zambia, specializing in residential, commercial, 
              and agricultural properties. Serving local and diaspora clients with integrity and excellence.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} hover:scale-110 transition-transform duration-200`}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Contact Details</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-sm">+260 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-secondary" />
                <span className="text-sm">+260 987 654 321</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="text-sm">info@absrealestate.zm</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-secondary mt-1" />
                <span className="text-sm">
                  123 Independence Avenue<br />
                  Lusaka, Zambia
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Quick Links</h4>
            <div className="space-y-2">
              <a href="/services" className="block text-sm text-gray-300 hover:text-secondary transition-colors">Property Services</a>
              <a href="/about" className="block text-sm text-gray-300 hover:text-secondary transition-colors">About Us</a>
              <a href="/contact" className="block text-sm text-gray-300 hover:text-secondary transition-colors">Contact</a>
              <a href="/login" className="block text-sm text-gray-300 hover:text-secondary transition-colors">Client Portal</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-300">
            © 2024 ABS Real Estate. All rights reserved. | Licensed by PACRA & ZRA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
