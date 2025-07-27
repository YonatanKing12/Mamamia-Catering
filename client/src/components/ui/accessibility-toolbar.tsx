import { useState, useEffect } from 'react';
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

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  // Prevent body scroll when toolbar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Accessibility Button - Always visible */}
      <button
        onClick={handleOpen}
        className="accessibility-exempt fixed bottom-6 right-6 z-[99999] bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 border-2 border-white"
        aria-label="פתח תפריט נגישות"
        title="נגישות"
        data-accessibility-exempt="true"
        style={{ filter: 'none !important' }}
      >
        <i className="fas fa-universal-access text-2xl accessibility-exempt"></i>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-[9998] transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Accessibility Toolbar */}
      <div 
        className={`accessibility-toolbar accessibility-exempt fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-white to-cream shadow-2xl z-[9997] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
        data-accessibility-exempt="true"
        style={{ filter: 'none !important' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-golden/20 bg-white">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center">
              <i className="fas fa-universal-access text-white text-sm"></i>
            </div>
            <h3 id="accessibility-title" className="text-xl font-bold text-dark-brown">
              תפריט נגישות
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-golden"
            aria-label="סגור תפריט נגישות"
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-full">
          <p className="text-sm text-gray-600 mb-6">
            התאם את האתר לצרכי הנגישות שלך
          </p>
          
          {/* Font Size Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-dark-brown border-b border-golden/20 pb-2">
              גודל טקסט
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={increaseFontSize}
                className="flex items-center justify-center p-3 bg-cream hover:bg-golden hover:text-white rounded-lg transition-all duration-200 text-sm font-medium border border-golden/20 hover:border-golden"
              >
                <i className="fas fa-plus text-xs ml-2"></i>
                הגדל טקסט
              </button>
              
              <button
                onClick={decreaseFontSize}
                className="flex items-center justify-center p-3 bg-cream hover:bg-golden hover:text-white rounded-lg transition-all duration-200 text-sm font-medium border border-golden/20 hover:border-golden"
              >
                <i className="fas fa-minus text-xs ml-2"></i>
                הקטן טקסט
              </button>
            </div>
            <div className="text-center text-xs text-gray-500">
              גודל נוכחי: {fontSize}%
            </div>
          </div>

          {/* Visual Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-dark-brown border-b border-golden/20 pb-2">
              הגדרות תצוגה
            </h4>
            
            <button
              onClick={toggleHighContrast}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 border ${
                highContrast 
                  ? 'bg-golden text-white border-golden shadow-md' 
                  : 'bg-white hover:bg-cream border-golden/20 hover:border-golden text-dark-brown'
              }`}
            >
              <span className="font-medium">ניגודיות גבוהה</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                highContrast ? 'border-white bg-white' : 'border-golden'
              }`}>
                {highContrast && <i className="fas fa-check text-golden text-xs"></i>}
              </div>
            </button>
            
            <button
              onClick={toggleInvertColors}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 border ${
                invertColors 
                  ? 'bg-golden text-white border-golden shadow-md' 
                  : 'bg-white hover:bg-cream border-golden/20 hover:border-golden text-dark-brown'
              }`}
            >
              <span className="font-medium">הפיכת צבעים</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                invertColors ? 'border-white bg-white' : 'border-golden'
              }`}>
                {invertColors && <i className="fas fa-check text-golden text-xs"></i>}
              </div>
            </button>
            
            <button
              onClick={toggleUnderlineLinks}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 border ${
                underlineLinks 
                  ? 'bg-golden text-white border-golden shadow-md' 
                  : 'bg-white hover:bg-cream border-golden/20 hover:border-golden text-dark-brown'
              }`}
            >
              <span className="font-medium">קו תחתון לקישורים</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                underlineLinks ? 'border-white bg-white' : 'border-golden'
              }`}>
                {underlineLinks && <i className="fas fa-check text-golden text-xs"></i>}
              </div>
            </button>
          </div>
          
          {/* Reset Button */}
          <button
            onClick={() => {
              resetAccessibility();
              // Optional: close the toolbar after reset
              // handleClose();
            }}
            className="w-full p-4 bg-wine-red hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <i className="fas fa-undo ml-2"></i>
            איפוס כל ההגדרות
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-golden/10 rounded-lg border border-golden/20">
            <p className="text-xs text-gray-600 leading-relaxed">
              תפריט הנגישות מאפשר התאמה אישית של האתר לצרכים שלך. 
              השינויים יישמרו במהלך הגלישה באתר.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
