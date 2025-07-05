
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book a property?",
      answer: "Simply browse our properties, select your preferred dates, and click 'Book Now'. You'll be guided through a secure payment process using mobile money or card payments."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept mobile money (MTN, Airtel), Visa/Mastercard, and bank transfers. All payments are processed securely through our encrypted payment system."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, cancellation policies vary by property. Most bookings can be cancelled up to 24-48 hours before check-in for a full refund. Check the specific property's cancellation policy before booking."
    },
    {
      question: "Are your properties verified?",
      answer: "Absolutely! All properties undergo thorough verification including legal documentation checks, physical inspections, and host background verification."
    },
    {
      question: "Do you offer services for Zambians abroad?",
      answer: "Yes! We provide special diaspora services including virtual property tours, remote booking assistance, investment consultations, and secure transaction handling."
    },
    {
      question: "How do I list my property?",
      answer: "Property owners can list their properties by creating an account and following our simple listing process. We provide professional photography and marketing support."
    },
    {
      question: "What areas do you cover?",
      answer: "We cover major cities and tourist destinations across Zambia including Lusaka, Ndola, Kitwe, Livingstone, and popular safari destinations."
    },
    {
      question: "Is customer support available 24/7?",
      answer: "Our customer support team is available during business hours (8 AM - 8 PM CAT). For urgent matters, we provide emergency contact options for active bookings."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <p className="text-lg text-gray-600">
            Get answers to common questions about our services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full p-6 justify-between text-left hover:bg-gray-50"
                  onClick={() => toggleItem(index)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openItem === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
                
                {openItem === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Button className="bg-primary hover:bg-primary/90">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
