
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Bell, Search, User, Building, Home, Users, Globe, DollarSign } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AuthButton from './AuthButton';
import CountrySelector from './CountrySelector';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLocalization();
  const { user } = useAuth();
  const { data: notifications = [] } = useNotifications(user?.uid);
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardMenuItems = [
    {
      title: 'User Dashboard',
      description: 'Manage your bookings and preferences',
      href: '/user-dashboard',
      icon: User,
    },
    {
      title: 'Property Owner',
      description: 'Manage your property listings',
      href: '/property-owner-dashboard',
      icon: Building,
    },
    {
      title: 'Real Estate Services',
      description: 'Sales, rentals, and diaspora services',
      href: '/real-estate-services',
      icon: Home,
    },
  ];

  const servicesMenuItems = [
    {
      title: 'Buy Properties',
      description: 'Find and purchase your dream property',
      href: '/properties/sale',
      icon: Home,
    },
    {
      title: 'Rent Properties',
      description: 'Short and long-term rental properties',
      href: '/properties/rent',
      icon: Building,
    },
    {
      title: 'Diaspora Services',
      description: 'Special services for Zambians abroad',
      href: '/services#diaspora',
      icon: Globe,
    },
    {
      title: 'Property Management',
      description: 'Professional property management services',
      href: '/services#management',
      icon: Users,
    },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-200',
        isScrolled ? 'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60' : 'bg-white'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">ABS Properties</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link to="/home">{t('home')}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {servicesMenuItems.map((item) => (
                      <li key={item.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center space-x-2">
                              <item.icon className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">{item.title}</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link to="/properties">{t('properties')}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link to="/about">{t('about')}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link to="/contact">{t('contact')}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link to="/assistant">AI Concierge</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                  <Link to="/suggestions">Feedback</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {user && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Dashboard</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                      {dashboardMenuItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center space-x-2">
                                <item.icon className="h-4 w-4" />
                                <div className="text-sm font-medium leading-none">{item.title}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <CountrySelector />
          {user && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/notifications" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          <AuthButton showName={false} />

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link to="/home" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  {t('home')}
                </Link>
                <Link to="/services" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  Services
                </Link>
                <Link to="/properties" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  {t('properties')}
                </Link>
                <Link to="/about" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  {t('about')}
                </Link>
                <Link to="/contact" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  {t('contact')}
                </Link>
                <Link to="/assistant" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  AI Concierge
                </Link>
                <Link to="/suggestions" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                  Feedback
                </Link>
                {user && (
                  <>
                    <div className="border-t pt-4">
                      <p className="px-2 text-sm font-medium text-gray-500 mb-2">Dashboards</p>
                      <Link to="/user-dashboard" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                        User Dashboard
                      </Link>
                      <Link to="/property-owner-dashboard" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                        Property Owner
                      </Link>
                      <Link to="/real-estate-services" className="block px-2 py-1 text-lg font-medium hover:text-primary">
                        Real Estate Services
                      </Link>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
