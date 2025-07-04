
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Globe } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

const CountrySelector = () => {
  const { currentCountry, countries, setCountry } = useLocalization();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:bg-white/10 space-x-2">
          <Globe className="h-4 w-4" />
          <span>{currentCountry.flag}</span>
          <span className="hidden sm:inline">{currentCountry.name}</span>
          <span className="text-xs opacity-75">({currentCountry.currency})</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => {
              setCountry(country);
              setOpen(false);
            }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <span className="text-lg">{country.flag}</span>
            <div className="flex-1">
              <div className="font-medium">{country.name}</div>
              <div className="text-sm text-gray-500">
                {country.currency} • {country.phoneCode}
              </div>
            </div>
            {currentCountry.code === country.code && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
