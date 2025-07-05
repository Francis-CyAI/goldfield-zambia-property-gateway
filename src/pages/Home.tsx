
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import FeaturedPropertiesSection from '@/components/FeaturedPropertiesSection';
import PopularDestinations from '@/components/PopularDestinations';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import PricingSection from '@/components/PricingSection';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <FeaturedPropertiesSection />
      <PopularDestinations />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
};

export default Home;
