import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { menuData } from '@/data/menu-data';
import { useScroll } from '@/hooks/use-scroll';

export const Menu = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { scrollToSection } = useScroll();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  return (
    <section id="menu" className="py-20 bg-gradient-to-br from-warm-white to-cream relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">הטעמים שלנו</span>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 mt-2">תפריט מאמאמיה - כל מנה עם סיפור</h2>
          <p className="text-xl text-gray-800 font-medium max-w-3xl mx-auto">
            מבחר מנות עיקריות ותוספות שכל אחת מהן מכינה בעצמה מעשרות של מתכונים מסורתיים ומוכחים.
          </p>
          <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
        </div>
        
        {/* Menu Categories */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {menuData.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full p-6 text-right bg-gradient-to-r ${category.color} text-white hover:opacity-90 transition-all duration-300 flex justify-between items-center`}
                >
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-lg opacity-90">{category.description}</p>
                  </div>
                  <i className={`${category.icon} text-3xl`}></i>
                </button>
                
                <div className={`bg-white transition-all duration-300 ${
                  expandedCategory === category.id ? 'menu-item-expanded' : 'menu-item-collapsed'
                }`}>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {category.items.map((item, index) => (
                        <div key={index} className="border-b border-gray-200 last:border-b-0 pb-3 mb-3 last:mb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-dark-brown mb-1">{item.name}</h4>
                              <p className="text-gray-700 text-sm font-medium">{item.description}</p>
                            </div>
                            {item.price && (
                              <span className="text-golden font-semibold text-lg mr-4">₪{item.price}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg text-gray-800 font-medium mb-6">רוצים תפריט מותאם אישית? אנחנו כאן בשבילכם!</p>
          <Button
            onClick={() => scrollToSection('contact')}
            className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift shadow-lg"
          >
            <i className="fas fa-utensils ml-2"></i>
            בואו נתכנן יחד את התפריט המושלם
          </Button>
        </div>
      </div>
    </section>
  );
};
