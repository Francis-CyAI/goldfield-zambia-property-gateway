
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Globe } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

const CountrySelector = () => {
  const { currentCountry, countries, setCountry, getCountriesByRegion } = useLocalization();
  const [open, setOpen] = useState(false);

  const regions = ['Southern Africa', 'East Africa', 'West Africa', 'North Africa', 'Central Africa'];

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
      <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
        {regions.map((region) => {
          const regionCountries = getCountriesByRegion(region);
          if (regionCountries.length === 0) return null;
          
          return (
            <div key={region}>
              <DropdownMenuLabel className="text-sm font-semibold text-gray-600">
                {region}
              </DropdownMenuLabel>
              {regionCountries.map((country) => (
                <DropdownMenuItem
                  key={country.code}
                  onClick={() => {
                    setCountry(country);
                    setOpen(false);
                  }}
                  className="flex items-center space-x-3 cursor-pointer py-2"
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
              <DropdownMenuSeparator />
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
