
import HeroSection from '../components/HeroSection';
import PopularDestinations from '../components/PopularDestinations';
import FeaturedPropertiesSection from '../components/FeaturedPropertiesSection';
import TrustFeatures from '../components/TrustFeatures';
import FeaturesSection from '../components/FeaturesSection';
import CTASection from '../components/CTASection';

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PopularDestinations />
      <FeaturedPropertiesSection />
      <TrustFeatures />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default Home;
