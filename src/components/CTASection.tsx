
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="bg-gradient-to-r from-secondary to-primary text-white py-16">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Start Your Property Journey?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Whether you're buying, selling, or renting, we're here to help every step of the way
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
              Get Started Today
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Client Portal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
