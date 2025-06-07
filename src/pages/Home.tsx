
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import FeaturedPropertiesSection from '../components/FeaturedPropertiesSection';
import CTASection from '../components/CTASection';

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <FeaturedPropertiesSection />
      <CTASection />
    </div>
  );
};

export default Home;
