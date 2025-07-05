
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SupportedCountry = 'ZM' | 'TZ' | 'KE' | 'ZA' | 'BW' | 'MW' | 'MZ' | 'AO' | 'ZW' | 'CD' | 'NA' | 'UG' | 'RW' | 'BI' | 'ET' | 'GH' | 'NG' | 'EG' | 'MA' | 'TN';
export type SupportedLanguage = 'en' | 'sw' | 'af' | 'fr' | 'pt' | 'ar';
export type SupportedCurrency = 'ZMW' | 'TZS' | 'KES' | 'ZAR' | 'BWP' | 'MWK' | 'MZN' | 'AOA' | 'ZWL' | 'CDF' | 'NAD' | 'UGX' | 'RWF' | 'BIF' | 'ETB' | 'GHS' | 'NGN' | 'EGP' | 'MAD' | 'TND' | 'USD';

interface CountryConfig {
  code: SupportedCountry;
  name: string;
  language: SupportedLanguage;
  currency: SupportedCurrency;
  flag: string;
  phoneCode: string;
  region: string;
}

interface LocalizationContextType {
  currentCountry: CountryConfig;
  countries: CountryConfig[];
  setCountry: (country: CountryConfig) => void;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
  getCountriesByRegion: (region: string) => CountryConfig[];
}

const countries: CountryConfig[] = [
  // Southern Africa
  {
    code: 'ZM',
    name: 'Zambia',
    language: 'en',
    currency: 'ZMW',
    flag: '🇿🇲',
    phoneCode: '+260',
    region: 'Southern Africa'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    language: 'en',
    currency: 'ZAR',
    flag: '🇿🇦',
    phoneCode: '+27',
    region: 'Southern Africa'
  },
  {
    code: 'BW',
    name: 'Botswana',
    language: 'en',
    currency: 'BWP',
    flag: '🇧🇼',
    phoneCode: '+267',
    region: 'Southern Africa'
  },
  {
    code: 'MW',
    name: 'Malawi',
    language: 'en',
    currency: 'MWK',
    flag: '🇲🇼',
    phoneCode: '+265',
    region: 'Southern Africa'
  },
  {
    code: 'MZ',
    name: 'Mozambique',
    language: 'pt',
    currency: 'MZN',
    flag: '🇲🇿',
    phoneCode: '+258',
    region: 'Southern Africa'
  },
  {
    code: 'AO',
    name: 'Angola',
    language: 'pt',
    currency: 'AOA',
    flag: '🇦🇴',
    phoneCode: '+244',
    region: 'Southern Africa'
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    language: 'en',
    currency: 'ZWL',
    flag: '🇿🇼',
    phoneCode: '+263',
    region: 'Southern Africa'
  },
  {
    code: 'NA',
    name: 'Namibia',
    language: 'en',
    currency: 'NAD',
    flag: '🇳🇦',
    phoneCode: '+264',
    region: 'Southern Africa'
  },
  // East Africa
  {
    code: 'TZ',
    name: 'Tanzania',
    language: 'sw',
    currency: 'TZS',
    flag: '🇹🇿',
    phoneCode: '+255',
    region: 'East Africa'
  },
  {
    code: 'KE',
    name: 'Kenya',
    language: 'en',
    currency: 'KES',
    flag: '🇰🇪',
    phoneCode: '+254',
    region: 'East Africa'
  },
  {
    code: 'UG',
    name: 'Uganda',
    language: 'en',
    currency: 'UGX',
    flag: '🇺🇬',
    phoneCode: '+256',
    region: 'East Africa'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    language: 'en',
    currency: 'RWF',
    flag: '🇷🇼',
    phoneCode: '+250',
    region: 'East Africa'
  },
  {
    code: 'BI',
    name: 'Burundi',
    language: 'fr',
    currency: 'BIF',
    flag: '🇧🇮',
    phoneCode: '+257',
    region: 'East Africa'
  },
  {
    code: 'ET',
    name: 'Ethiopia',
    language: 'en',
    currency: 'ETB',
    flag: '🇪🇹',
    phoneCode: '+251',
    region: 'East Africa'
  },
  // Central Africa
  {
    code: 'CD',
    name: 'Democratic Republic of Congo',
    language: 'fr',
    currency: 'CDF',
    flag: '🇨🇩',
    phoneCode: '+243',
    region: 'Central Africa'
  },
  // West Africa
  {
    code: 'GH',
    name: 'Ghana',
    language: 'en',
    currency: 'GHS',
    flag: '🇬🇭',
    phoneCode: '+233',
    region: 'West Africa'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    language: 'en',
    currency: 'NGN',
    flag: '🇳🇬',
    phoneCode: '+234',
    region: 'West Africa'
  },
  // North Africa
  {
    code: 'EG',
    name: 'Egypt',
    language: 'ar',
    currency: 'EGP',
    flag: '🇪🇬',
    phoneCode: '+20',
    region: 'North Africa'
  },
  {
    code: 'MA',
    name: 'Morocco',
    language: 'ar',
    currency: 'MAD',
    flag: '🇲🇦',
    phoneCode: '+212',
    region: 'North Africa'
  },
  {
    code: 'TN',
    name: 'Tunisia',
    language: 'ar',
    currency: 'TND',
    flag: '🇹🇳',
    phoneCode: '+216',
    region: 'North Africa'
  }
];

// Enhanced translations for multiple languages
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
  },
  fr: {
    'become_host': 'Devenir Hôte',
    'travel_guide': 'Guide de Voyage',
    'help_center': 'Centre d\'Aide',
    'partner_with_us': 'Partenaire avec Nous',
    'book_now': 'Réserver Maintenant',
    'per_night': 'par nuit',
    'guests': 'invités',
    'bedrooms': 'chambres',
    'bathrooms': 'salles de bain',
    'luxury_excellence_trust': 'Luxe • Excellence • Confiance',
    'all_rights_reserved': 'Tous droits réservés',
    'licensed_by': 'Licencié par PACRA & ZRA'
  },
  pt: {
    'become_host': 'Torne-se Anfitrião',
    'travel_guide': 'Guia de Viagem',
    'help_center': 'Centro de Ajuda',
    'partner_with_us': 'Parceiro Conosco',
    'book_now': 'Reserve Agora',
    'per_night': 'por noite',
    'guests': 'hóspedes',
    'bedrooms': 'quartos',
    'bathrooms': 'banheiros',
    'luxury_excellence_trust': 'Luxo • Excelência • Confiança',
    'all_rights_reserved': 'Todos os direitos reservados',
    'licensed_by': 'Licenciado por PACRA & ZRA'
  },
  ar: {
    'become_host': 'كن مضيفًا',
    'travel_guide': 'دليل السفر',
    'help_center': 'مركز المساعدة',
    'partner_with_us': 'شارك معنا',
    'book_now': 'احجز الآن',
    'per_night': 'في الليلة',
    'guests': 'ضيوف',
    'bedrooms': 'غرف نوم',
    'bathrooms': 'حمامات',
    'luxury_excellence_trust': 'الفخامة • التميز • الثقة',
    'all_rights_reserved': 'جميع الحقوق محفوظة',
    'licensed_by': 'مرخص من PACRA & ZRA'
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
      ZMW: 'ZMW', TZS: 'TZS', KES: 'KES', ZAR: 'R', BWP: 'P', MWK: 'MK',
      MZN: 'MT', AOA: 'Kz', ZWL: 'Z$', CDF: 'FC', NAD: 'N$', UGX: 'USh',
      RWF: 'RF', BIF: 'FBu', ETB: 'Br', GHS: '₵', NGN: '₦', EGP: 'E£',
      MAD: 'DH', TND: 'DT', USD: '$'
    };

    return `${currencySymbols[currentCountry.currency]} ${amount.toLocaleString()}`;
  };

  const t = (key: string): string => {
    return translations[currentCountry.language]?.[key] || key;
  };

  const getCountriesByRegion = (region: string): CountryConfig[] => {
    return countries.filter(country => country.region === region);
  };

  return (
    <LocalizationContext.Provider value={{
      currentCountry,
      countries,
      setCountry,
      formatCurrency,
      t,
      getCountriesByRegion
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
