import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { galleryData, galleryCategories } from '@/data/gallery-data';

export const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredGallery = galleryData.filter(item => 
    activeFilter === 'all' || item.category === activeFilter
  );

  return (
    <section id="gallery" className="py-20 bg-dark-brown text-white relative overflow-hidden">
      <div className="absolute inset-0 wave-shape bg-gradient-to-br from-saddle-brown to-dark-brown opacity-80"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">הגלריה שלנו</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 mt-2">רגעים מתוקים מהאירועים שלנו</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            כל תמונה מספרת סיפור של שמחה, טעם ורגעים בלתי נשכחים שיצרנו עם הלקוחות שלנו.
          </p>
          <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
        </div>
        
        {/* Gallery Filters */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-3">
            {galleryCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeFilter === category.id
                    ? 'bg-golden hover:bg-dark-golden text-white'
                    : 'bg-transparent border-2 border-golden text-golden hover:bg-golden hover:text-white'
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div key={item.id} className="relative group overflow-hidden rounded-2xl hover-lift">
              <img 
                src={item.src} 
                alt={item.alt} 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift shadow-lg">
            <i className="fas fa-images ml-2"></i>
            עוד תמונות בגלריה המלאה
          </Button>
        </div>
      </div>
    </section>
  );
};
