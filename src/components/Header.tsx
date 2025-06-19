
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Info, Briefcase, Building, Newspaper, Phone, LogIn, Crown, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AuthButton from './AuthButton';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About Us', href: '/about', icon: Info },
    { name: 'Services', href: '/services', icon: Briefcase },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Contact Us', href: '/contact', icon: Phone },
  ];

  // Add dashboard and subscription links for authenticated users
  const authenticatedNavigation = user 
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, 
        { name: 'Subscription', href: '/subscription', icon: Crown },
        ...navigation
      ]
    : navigation;

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-white shadow-xl sticky top-0 z-50 border-b border-luxury-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-14 h-14 luxury-gradient rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold luxury-text-gradient font-playfair">ABS</h1>
              <p className="text-sm text-luxury-charcoal font-medium">Obama, Lusaka</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {authenticatedNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'text-luxury-gold bg-luxury-cream border border-luxury-gold/30 shadow-md'
                    : 'text-luxury-charcoal hover:text-luxury-gold hover:bg-luxury-cream/50 hover:shadow-sm'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Contact Info & Auth Button */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-luxury-charcoal font-medium">+260 972 333 053</p>
              <p className="text-xs text-luxury-charcoal/70">Obama, Lusaka, Zambia</p>
            </div>
            <AuthButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-luxury-gold/20 mt-4 pt-4">
            <div className="flex flex-col space-y-3">
              {authenticatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-luxury-gold bg-luxury-cream border border-luxury-gold/30'
                      : 'text-luxury-charcoal hover:text-luxury-gold hover:bg-luxury-cream/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="border-t border-luxury-gold/20 pt-3 mt-3">
                <div className="text-center mb-3">
                  <p className="text-sm text-luxury-charcoal font-medium">+260 972 333 053</p>
                  <p className="text-xs text-luxury-charcoal/70">Obama, Lusaka, Zambia</p>
                </div>
                <div className="px-4">
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
