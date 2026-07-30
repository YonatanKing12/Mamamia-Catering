import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useScroll } from '@/hooks/use-scroll';
import { Link, useLocation } from 'wouter';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolledDown, scrollToSection } = useScroll();
  const [location] = useLocation();

  const navigation = [
    { href: "hero", label: "בית", isSection: true },
    { href: "story", label: "הסיפור", isSection: true },
    { href: "events", label: "אירועים", isSection: true },
    { href: "menu", label: "תפריט", isSection: true },
    { href: "gallery", label: "גלריה", isSection: true },
    { href: "/blog", label: "בלוג", isSection: false },
  ];

  return (
    <>
      <header className={`fixed top-0 w-full z-30 transition-all duration-300 ${
        isScrolledDown ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-2xl font-bold text-golden">
              <span className="text-shadow-warm">מאמאמיה</span>
              <span className="text-sm text-saddle-brown block">טעמים של בית</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-8 space-x-reverse">
            {navigation.map((item) => (
              item.isSection ? (
                <button
                  key={item.href}
                  onClick={() => {
                    if (location !== '/') {
                      window.location.href = '/#' + item.href;
                    } else {
                      scrollToSection(item.href);
                    }
                  }}
                  className="text-dark-brown hover:text-golden transition-colors font-medium"
                >
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} href={item.href}>
                  <span className="text-dark-brown hover:text-golden transition-colors font-medium cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              )
            ))}
            <Button
              onClick={() => {
                if (location !== '/') {
                  window.location.href = '/#contact';
                } else {
                  scrollToSection('contact');
                }
              }}
              className="bg-golden text-white px-6 py-2 rounded-full hover:bg-dark-golden hover-lift font-semibold"
            >
              <i className="fas fa-phone ml-2"></i>
              הזמינו עכשיו
            </Button>
          </div>
          
          <Button
            onClick={() => setIsMobileMenuOpen(true)}
            variant="ghost"
            className="lg:hidden text-dark-brown text-2xl p-0"
          >
            <i className="fas fa-bars"></i>
          </Button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="bg-white h-full w-80 shadow-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-dark-brown">תפריט ניווט</h2>
            <Button
              onClick={() => setIsMobileMenuOpen(false)}
              variant="ghost"
              className="text-gray-500 text-2xl p-0"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
          <nav className="space-y-4">
            {navigation.map((item) => (
              item.isSection ? (
                <button
                  key={item.href}
                  onClick={() => {
                    if (location !== '/') {
                      window.location.href = '/#' + item.href;
                    } else {
                      scrollToSection(item.href);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-3 text-dark-brown hover:text-golden transition-colors font-medium w-full text-right"
                >
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} href={item.href}>
                  <span 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-dark-brown hover:text-golden transition-colors font-medium w-full text-right cursor-pointer"
                  >
                    {item.label}
                  </span>
                </Link>
              )
            ))}
            <Button
              onClick={() => {
                if (location !== '/') {
                  window.location.href = '/#contact';
                } else {
                  scrollToSection('contact');
                }
                setIsMobileMenuOpen(false);
              }}
              className="block bg-golden text-white px-6 py-3 rounded-full hover:bg-dark-golden font-semibold text-center mt-6 w-full"
            >
              <i className="fas fa-phone ml-2"></i>
              הזמינו עכשיו
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};
