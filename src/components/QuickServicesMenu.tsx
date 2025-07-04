
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown,
  ShoppingCart, 
  DollarSign, 
  Building, 
  Globe,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickServicesMenu = () => {
  const services = [
    {
      id: 'buy',
      title: 'Buy Property',
      icon: ShoppingCart,
      description: 'Find your perfect property',
      href: '/services#buy'
    },
    {
      id: 'sell',
      title: 'Sell Property',
      icon: DollarSign,
      description: 'Get the best value',
      href: '/services#sell'
    },
    {
      id: 'rent',
      title: 'List for Rent',
      icon: Building,
      description: 'Maximize rental income',
      href: '/services#rent'
    },
    {
      id: 'diaspora',
      title: 'Diaspora Services',
      icon: Globe,
      description: 'Services for Zambians abroad',
      href: '/services#diaspora'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-1">
          <span>Services</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white border shadow-lg" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Our Services</span>
          <Badge variant="secondary" className="text-xs">Popular</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {services.map((service) => (
          <DropdownMenuItem key={service.id} asChild className="p-0">
            <Link 
              to={service.href} 
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <service.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{service.title}</div>
                <div className="text-xs text-gray-500">{service.description}</div>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="p-0">
          <Link 
            to="/contact" 
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
          >
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Contact an Agent</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickServicesMenu;
