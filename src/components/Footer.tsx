
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter, MessageCircle, Crown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CountrySelector from './CountrySelector';
import { useLocalization } from '@/contexts/LocalizationContext';

const Footer = () => {
  const { t, currentCountry } = useLocalization();
  
  const socialLinks = [
    { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/260972333053', color: 'text-green-500 hover:text-green-400' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/absrealestate', color: 'text-blue-500 hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/abs-real-estate', color: 'text-blue-600 hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/absrealestate', color: 'text-blue-400 hover:text-blue-300' },
  ];

  const globalLinks = [
    { 
      title: t('become_host'), 
      href: '/list-property', 
      description: 'Earn money by hosting travelers',
      internal: true 
    },
    { 
      title: `${currentCountry.name} ${t('travel_guide')}`, 
      href: `/${currentCountry.code.toLowerCase()}-travel-guide`, 
      description: `Discover the best of ${currentCountry.name}`,
      internal: true 
    },
    { 
      title: t('help_center'), 
      href: '/help', 
      description: '24/7 customer support',
      internal: true 
    },
    { 
      title: t('partner_with_us'), 
      href: '/partners', 
      description: 'Business partnership opportunities',
      internal: true 
    },
  ];

  const quickLinks = [
    { title: 'Property Services', href: '/services' },
    { title: 'About Us', href: '/about' },
    { title: 'Contact', href: '/contact' },
    { title: 'Client Portal', href: '/dashboard' },
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-4">
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
              Leading real estate and business solutions company across Africa, specializing in residential, commercial, 
              and agricultural properties. Serving local and diaspora clients with integrity, excellence, and luxury service.
            </p>
            <div className="flex space-x-4 mb-6">
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
            
            {/* Country Selector */}
            <div className="border-t border-luxury-gold/30 pt-4">
              <p className="text-sm text-gray-400 mb-2">Region & Currency</p>
              <CountrySelector />
            </div>
          </div>

          {/* Global Links */}
          <div className="col-span-1 md:col-span-4">
            <h4 className="text-xl font-semibold mb-6 text-luxury-gold font-playfair">Global Services</h4>
            <div className="space-y-4">
              {globalLinks.map((link) => (
                <div key={link.title} className="group">
                  {link.internal ? (
                    <Link 
                      to={link.href} 
                      className="flex items-start space-x-2 text-gray-300 hover:text-luxury-gold transition-colors duration-300"
                    >
                      <div className="flex-1">
                        <div className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                          {link.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {link.description}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  ) : (
                    <a 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start space-x-2 text-gray-300 hover:text-luxury-gold transition-colors duration-300"
                    >
                      <div className="flex-1">
                        <div className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                          {link.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {link.description}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xl font-semibold mb-6 text-luxury-gold font-playfair">Contact Details</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300 text-sm">{currentCountry.phoneCode} 972 333 053</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300 text-sm">WhatsApp Available</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300 text-xs">appletechbusinesssolutions@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 luxury-gradient rounded-lg flex items-center justify-center mt-1">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-300 text-sm">
                  123 Independence Avenue<br />
                  Lusaka, {currentCountry.name}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xl font-semibold mb-6 text-luxury-gold font-playfair">Quick Links</h4>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link 
                  key={link.title}
                  to={link.href} 
                  className="block text-gray-300 hover:text-luxury-gold transition-colors duration-300 hover:translate-x-1 transform text-sm"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-luxury-gold/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-300 text-center md:text-left text-sm">
              © 2024 ABS Business Solutions. {t('all_rights_reserved')} | {t('licensed_by')}
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-luxury-gold font-medium text-sm">{t('luxury_excellence_trust')}</span>
              <div className="text-xs text-gray-400">
                Serving: {countries.map(c => c.flag).join(' ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
