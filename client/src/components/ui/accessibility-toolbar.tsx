import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/hooks/use-accessibility';

export const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    fontSize,
    highContrast,
    invertColors,
    underlineLinks,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleInvertColors,
    toggleUnderlineLinks,
    resetAccessibility
  } = useAccessibility();

  return (
    <>
      {/* Accessibility Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 left-4 z-50 bg-golden text-white p-3 rounded-full shadow-lg hover:bg-dark-golden hover-lift"
        aria-label="פתח תפריט נגישות"
      >
        <i className="fas fa-universal-access text-xl"></i>
      </Button>

      {/* Accessibility Toolbar */}
      <div className={`accessibility-toolbar fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-40 p-6 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-dark-brown">נגישות</h3>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            className="text-gray-500 hover:text-dark-brown text-2xl p-0"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={increaseFontSize}
            className="w-full p-3 bg-cream hover:bg-golden hover:text-white rounded-lg transition-colors"
          >
            הגדל טקסט
          </Button>
          
          <Button
            onClick={decreaseFontSize}
            className="w-full p-3 bg-cream hover:bg-golden hover:text-white rounded-lg transition-colors"
          >
            הקטן טקסט
          </Button>
          
          <Button
            onClick={toggleHighContrast}
            className={`w-full p-3 rounded-lg transition-colors ${
              highContrast 
                ? 'bg-golden text-white' 
                : 'bg-cream hover:bg-golden hover:text-white'
            }`}
          >
            ניגודיות גבוהה
          </Button>
          
          <Button
            onClick={toggleInvertColors}
            className={`w-full p-3 rounded-lg transition-colors ${
              invertColors 
                ? 'bg-golden text-white' 
                : 'bg-cream hover:bg-golden hover:text-white'
            }`}
          >
            הפיכת צבעים
          </Button>
          
          <Button
            onClick={toggleUnderlineLinks}
            className={`w-full p-3 rounded-lg transition-colors ${
              underlineLinks 
                ? 'bg-golden text-white' 
                : 'bg-cream hover:bg-golden hover:text-white'
            }`}
          >
            קו תחתון לקישורים
          </Button>
          
          <Button
            onClick={resetAccessibility}
            className="w-full p-3 bg-wine-red text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            איפוס הגדרות
          </Button>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
