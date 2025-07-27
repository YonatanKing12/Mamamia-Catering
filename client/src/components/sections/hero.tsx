import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useScroll } from '@/hooks/use-scroll';

const heroImages = [
  {
    src: "/src/assets/images/hero/hero1.svg",
    alt: "מבחר מנות מזרח תיכוניות מסורתיות"
  },
  {
    src: "/src/assets/images/hero/hero2.svg",
    alt: "שולחן חגיגי מעוצב לאירוע מיוחד"
  },
  {
    src: "/src/assets/images/hero/hero3.svg",
    alt: "שף מקצועי מכין מרכיבים טריים במטבח"
  }
];

const slogans = [
  'טעמים של בית, חוויה של פעם בחיים',
  'כל מנה מוכנה באהבה, מוגשת עם חיוך',
  'מסורת במטבח, מחויבות בשירות',
  'כשר, ביתי, וטעים מהלב'
];

export const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const { scrollToSection } = useScroll();

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);

    const sloganInterval = setInterval(() => {
      setCurrentSlogan(prev => (prev + 1) % slogans.length);
    }, 4000);

    return () => {
      clearInterval(slideInterval);
      clearInterval(sloganInterval);
    };
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background with Dynamic Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 hero-gradient"></div>
      
      <div className="relative z-20 container mx-auto px-4 text-center text-white">
        {/* Kosher Certification Badge */}
        <div className="mb-8 animate-bounce-gentle">
          <div className="inline-block bg-white bg-opacity-20 glass-effect rounded-full p-4">
            <div className="bg-white rounded-full p-3">
              <span className="text-golden font-bold text-lg">כשר בד"ץ</span>
            </div>
          </div>
        </div>
        
        {/* Dynamic Headlines */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow-warm leading-tight">
          <span className="block animate-slide-up">מאמאמיה</span>
          <span className="block text-3xl md:text-4xl lg:text-5xl text-cornsilk animate-slide-up transition-opacity duration-500">
            {slogans[currentSlogan]}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in">
          קייטרינג כשר וביתי שמביא אהבה, מסורת וניחוחות משכרים לכל אירוע. 
          ממוקמים בהרצליה פיתוח ומשרתים את כל אזור המרכז והשרון.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-slide-up">
          <Button
            onClick={() => scrollToSection('contact')}
            className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-xl font-semibold hover-lift shadow-lg"
          >
            <i className="fas fa-utensils ml-2"></i>
            הזמינו אירוע עכשיו
          </Button>
          <Button
            asChild
            variant="outline"
            className="bg-white bg-opacity-20 glass-effect hover:bg-opacity-30 text-white border-2 border-white px-8 py-4 rounded-full text-xl font-semibold hover-lift"
          >
            <a href="tel:052-1234567">
              <i className="fas fa-phone ml-2"></i>
              052-123-4567
            </a>
          </Button>
          <Button
            asChild
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-xl font-semibold hover-lift"
          >
            <a href="https://wa.me/972521234567" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp ml-2"></i>
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 animate-float opacity-20">
        <i className="fas fa-heart text-6xl text-white"></i>
      </div>
      <div className="absolute bottom-20 left-20 animate-float opacity-20" style={{animationDelay: '1s'}}>
        <i className="fas fa-star text-4xl text-white"></i>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
        <button
          onClick={() => scrollToSection('story')}
          className="text-white text-2xl hover:text-golden transition-colors"
        >
          <i className="fas fa-chevron-down"></i>
        </button>
      </div>
    </section>
  );
};
