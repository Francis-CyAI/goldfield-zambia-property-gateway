
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
  Home,
  Search,
  Building,
  ShoppingCart,
  DollarSign,
  Globe,
  Users,
  Phone,
  FileText,
  HelpCircle,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EnhancedNavigation = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Properties Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Properties</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px] lg:w-[500px]">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/properties" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Search className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Browse Properties</div>
                    <div className="text-sm text-gray-500">Find your perfect property</div>
                  </div>
                </Link>
                
                <Link to="/properties?type=rental" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Building className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Rentals</div>
                    <div className="text-sm text-gray-500">Short & long-term stays</div>
                  </div>
                </Link>
                
                <Link to="/properties?type=sale" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShoppingCart className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">For Sale</div>
                    <div className="text-sm text-gray-500">Buy your dream property</div>
                  </div>
                </Link>
                
                <Link to="/list-property" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <DollarSign className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">List Property</div>
                    <div className="text-sm text-gray-500">Earn from your property</div>
                  </div>
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Services Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px] lg:w-[500px]">
              <div className="grid grid-cols-1 gap-4">
                <Link to="/services#diaspora" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Globe className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Diaspora Services</div>
                    <div className="text-sm text-gray-500">Special services for Zambians abroad</div>
                  </div>
                </Link>
                
                <Link to="/services#property-management" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Building className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Property Management</div>
                    <div className="text-sm text-gray-500">Full-service property management</div>
                  </div>
                </Link>
                
                <Link to="/services#legal" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Legal Services</div>
                    <div className="text-sm text-gray-500">PACRA & ZRA documentation</div>
                  </div>
                </Link>
                
                <Link to="/services#consultation" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <div className="font-medium">Investment Consultation</div>
                    <div className="text-sm text-gray-500">Expert property investment advice</div>
                  </div>
                </Link>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Company Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[300px]">
              <Link to="/about" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium">About Us</div>
                  <div className="text-sm text-gray-500">Our story and mission</div>
                </div>
              </Link>
              
              <Link to="/testimonials" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Star className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium">Testimonials</div>
                  <div className="text-sm text-gray-500">What clients say</div>
                </div>
              </Link>
              
              <Link to="/partners" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Building className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium">Partners</div>
                  <div className="text-sm text-gray-500">Join our network</div>
                </div>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Support Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Support</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[300px]">
              <Link to="/contact" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium">Contact Us</div>
                  <div className="text-sm text-gray-500">Get in touch</div>
                </div>
              </Link>
              
              <Link to="/faq" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <HelpCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium">FAQ</div>
                  <div className="text-sm text-gray-500">Common questions</div>
                </div>
              </Link>
              
              <Link to="/help" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium">Help Center</div>
                  <div className="text-sm text-gray-500">Guides and support</div>
                </div>
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default EnhancedNavigation;
