
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SupportedCountry = 'ZM' | 'TZ' | 'KE' | 'ZA';
export type SupportedLanguage = 'en' | 'sw' | 'af';
export type SupportedCurrency = 'ZMW' | 'TZS' | 'KES' | 'ZAR' | 'USD';

interface CountryConfig {
  code: SupportedCountry;
  name: string;
  language: SupportedLanguage;
  currency: SupportedCurrency;
  flag: string;
  phoneCode: string;
}

interface LocalizationContextType {
  currentCountry: CountryConfig;
  countries: CountryConfig[];
  setCountry: (country: CountryConfig) => void;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const countries: CountryConfig[] = [
  {
    code: 'ZM',
    name: 'Zambia',
    language: 'en',
    currency: 'ZMW',
    flag: '🇿🇲',
    phoneCode: '+260'
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    language: 'sw',
    currency: 'TZS',
    flag: '🇹🇿',
    phoneCode: '+255'
  },
  {
    code: 'KE',
    name: 'Kenya',
    language: 'en',
    currency: 'KES',
    flag: '🇰🇪',
    phoneCode: '+254'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    language: 'en',
    currency: 'ZAR',
    flag: '🇿🇦',
    phoneCode: '+27'
  }
];

// Basic translations for key phrases
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'become_host': 'Become a Host',
    'travel_guide': 'Travel Guide',
    'help_center': 'Help Center',
    'partner_with_us': 'Partner with Us',
    'book_now': 'Book Now',
    'per_night': 'per night',
    'guests': 'guests',
    'bedrooms': 'bedrooms',
    'bathrooms': 'bathrooms',
    'luxury_excellence_trust': 'Luxury • Excellence • Trust',
    'all_rights_reserved': 'All rights reserved',
    'licensed_by': 'Licensed by PACRA & ZRA'
  },
  sw: {
    'become_host': 'Kuwa Mwenyeji',
    'travel_guide': 'Mwongozo wa Kusafiri',
    'help_center': 'Kituo cha Msaada',
    'partner_with_us': 'Shirikiana Nasi',
    'book_now': 'Hifadhi Sasa',
    'per_night': 'kwa usiku',
    'guests': 'wageni',
    'bedrooms': 'vyumba vya kulala',
    'bathrooms': 'vyumba vya kuoga',
    'luxury_excellence_trust': 'Anasa • Ubora • Uaminifu',
    'all_rights_reserved': 'Haki zote zimehifadhiwa',
    'licensed_by': 'Imeruhusiwa na PACRA & ZRA'
  },
  af: {
    'become_host': 'Word \'n Gasheer',
    'travel_guide': 'Reisgids',
    'help_center': 'Hulpsentrum',
    'partner_with_us': 'Vennoot met Ons',
    'book_now': 'Bespreek Nou',
    'per_night': 'per nag',
    'guests': 'gaste',
    'bedrooms': 'slaapkamers',
    'bathrooms': 'badkamers',
    'luxury_excellence_trust': 'Luukse • Uitnemendheid • Vertroue',
    'all_rights_reserved': 'Alle regte voorbehou',
    'licensed_by': 'Gelisensieer deur PACRA & ZRA'
  }
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentCountry, setCurrentCountry] = useState<CountryConfig>(countries[0]); // Default to Zambia

  const setCountry = (country: CountryConfig) => {
    setCurrentCountry(country);
  };

  const formatCurrency = (amount: number): string => {
    const currencySymbols = {
      ZMW: 'ZMW',
      TZS: 'TZS',
      KES: 'KES',
      ZAR: 'R',
      USD: '$'
    };

    return `${currencySymbols[currentCountry.currency]} ${amount.toLocaleString()}`;
  };

  const t = (key: string): string => {
    return translations[currentCountry.language]?.[key] || key;
  };

  return (
    <LocalizationContext.Provider value={{
      currentCountry,
      countries,
      setCountry,
      formatCurrency,
      t
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
