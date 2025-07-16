
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Users, Shield, Search, Calendar, MessageSquare } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import FeaturedPropertiesSection from '@/components/FeaturedPropertiesSection';
import PopularDestinations from '@/components/PopularDestinations';
import FeaturesSection from '@/components/FeaturesSection';
import TrustFeatures from '@/components/TrustFeatures';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Two-Sided Marketplace Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Two-Sided Marketplace Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join our peer-to-peer sharing economy platform that connects hosts and guests worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* For Hosts */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-full bg-primary/10 mr-4">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">For Hosts</h3>
                </div>
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  Rent out your homes, rooms, or spaces to travelers and earn extra income. Join thousands of hosts who trust our platform.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-primary mr-2" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-primary mr-2" />
                    <span>Verified guest profiles</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MessageSquare className="h-4 w-4 text-primary mr-2" />
                    <span>24/7 host support</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 text-base transition-all duration-200 hover:scale-105"
                >
                  Become a Host
                </Button>
              </CardContent>
            </Card>

            {/* For Guests */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-full bg-secondary/10 mr-4">
                    <Search className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">For Guests</h3>
                </div>
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  Find unique short-term accommodations worldwide. Book verified properties with confidence and flexibility.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm">
                    <Search className="h-4 w-4 text-secondary mr-2" />
                    <span>Advanced search filters</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-secondary mr-2" />
                    <span>Instant booking available</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-secondary mr-2" />
                    <span>Secure booking guarantee</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-3 text-base transition-all duration-200 hover:scale-105"
                >
                  Start Exploring
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <FeaturedPropertiesSection />
      <PopularDestinations />
      <FeaturesSection />
      <TrustFeatures />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default Index;
