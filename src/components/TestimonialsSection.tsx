
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Mwamba",
      location: "Lusaka",
      rating: 5,
      comment: "ABS Real Estate made buying my first home so easy! Their team guided me through every step and ensured all legal documents were properly handled.",
      type: "Property Buyer"
    },
    {
      name: "James Phiri",
      location: "London, UK",
      rating: 5,
      comment: "As a Zambian living abroad, their diaspora services were invaluable. I was able to purchase investment property remotely with complete confidence.",
      type: "Diaspora Client"
    },
    {
      name: "Mary Banda",
      location: "Ndola",
      rating: 5,
      comment: "Listed my rental property with them and had tenants within 2 weeks! Their professional approach and marketing really made the difference.",
      type: "Property Owner"
    },
    {
      name: "David Mulenga",
      location: "Kitwe",
      rating: 5,
      comment: "Excellent service! They helped me sell my property quickly and at a great price. Very professional and reliable team.",
      type: "Property Seller"
    },
    {
      name: "Grace Tembo",
      location: "Livingstone",
      rating: 5,
      comment: "Found the perfect vacation rental for my family through their platform. The booking process was smooth and the property exceeded expectations.",
      type: "Guest"
    },
    {
      name: "Peter Zulu",
      location: "Cape Town, SA",
      rating: 5,
      comment: "Their virtual tours and remote consultation services helped me invest in Zambian real estate from South Africa. Highly recommended!",
      type: "International Investor"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from satisfied clients across Zambia and beyond
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-primary opacity-20" />
                </div>
                
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {testimonial.type}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-gray-700 font-medium">4.9/5 average rating</span>
            <span className="text-gray-500">• 500+ happy clients</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
