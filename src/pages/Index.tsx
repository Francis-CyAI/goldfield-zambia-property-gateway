
import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturedPropertiesSection from '@/components/FeaturedPropertiesSection';
import ServicesNavigation from '@/components/ServicesNavigation';
import PopularDestinations from '@/components/PopularDestinations';
import FeaturesSection from '@/components/FeaturesSection';
import TrustFeatures from '@/components/TrustFeatures';
import CTASection from '@/components/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ServicesNavigation />
      <FeaturedPropertiesSection />
      <PopularDestinations />
      <FeaturesSection />
      <TrustFeatures />
      <CTASection />
    </div>
  );
};

export default Index;
