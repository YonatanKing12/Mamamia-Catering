import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { faqData } from '@/data/faq-data';
import { useScroll } from '@/hooks/use-scroll';

export const FAQ = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { scrollToSection } = useScroll();

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(prev => prev === faqId ? null : faqId);
  };

  return (
    <section className="py-20 bg-warm-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">שאלות נפוצות</span>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 mt-2">תשובות לכל השאלות שלכם</h2>
          <p className="text-xl text-gray-800 font-medium max-w-3xl mx-auto">
            אספנו עבורכם את השאלות הנפוצות ביותר שאנחנו מקבלים מלקוחותינו, עם תשובות מפורטות ומקצועיות.
          </p>
          <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
        </div>
        
        {/* FAQ Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="חפשו שאלה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pr-12 rounded-xl border-2 border-golden focus:border-dark-golden text-right"
            />
            <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-golden"></i>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 text-right flex justify-between items-center hover:bg-cream transition-colors"
                >
                  <span className="text-lg font-semibold text-dark-brown">{faq.question}</span>
                  <i className={`fas fa-chevron-down text-golden transition-transform duration-300 ${
                    expandedFAQ === faq.id ? 'rotate-180' : ''
                  }`}></i>
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="p-6 pt-0 text-gray-800 font-medium leading-relaxed">
                    <div className="whitespace-pre-line">{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg text-gray-800 font-medium mb-6">לא מצאתם תשובה לשאלה שלכם?</p>
          <Button
            onClick={() => scrollToSection('contact')}
            className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift shadow-lg"
          >
            <i className="fas fa-question-circle ml-2"></i>
            שאלו אותנו ישירות
          </Button>
        </div>
      </div>
    </section>
  );
};
