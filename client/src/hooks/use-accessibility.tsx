import { useState, useEffect } from 'react';

export const useAccessibility = () => {
  // Initialize from localStorage if available
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-font-size');
      return saved ? parseInt(saved) : 100;
    }
    return 100;
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility-high-contrast') === 'true';
    }
    return false;
  });
  
  const [invertColors, setInvertColors] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility-invert-colors') === 'true';
    }
    return false;
  });
  
  const [underlineLinks, setUnderlineLinks] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessibility-underline-links') === 'true';
    }
    return false;
  });

  // Font size effect
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('accessibility-font-size', fontSize.toString());
  }, [fontSize]);

  // High contrast effect
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
      // Add high contrast CSS variables
      root.style.setProperty('--background', 'hsl(0, 0%, 0%)');
      root.style.setProperty('--foreground', 'hsl(0, 0%, 100%)');
      root.style.setProperty('--muted', 'hsl(0, 0%, 10%)');
      root.style.setProperty('--border', 'hsl(0, 0%, 100%)');
    } else {
      root.classList.remove('high-contrast');
      // Reset to original colors
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--border');
    }
    localStorage.setItem('accessibility-high-contrast', highContrast.toString());
  }, [highContrast]);

  // Invert colors effect
  useEffect(() => {
    const body = document.body;
    if (invertColors) {
      body.style.filter = 'invert(1) hue-rotate(180deg)';
      body.style.background = 'invert(1) hue-rotate(180deg)';
    } else {
      body.style.filter = 'none';
      body.style.background = '';
    }
    localStorage.setItem('accessibility-invert-colors', invertColors.toString());
  }, [invertColors]);

  // Underline links effect
  useEffect(() => {
    const root = document.documentElement;
    if (underlineLinks) {
      // Add CSS custom property for underlined links
      const style = document.createElement('style');
      style.id = 'accessibility-underline-links';
      style.textContent = `
        a, button, [role="button"] {
          text-decoration: underline !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      // Remove the style element
      const existingStyle = document.getElementById('accessibility-underline-links');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
    localStorage.setItem('accessibility-underline-links', underlineLinks.toString());
  }, [underlineLinks]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 10, 200));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 10, 80));
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const toggleInvertColors = () => {
    setInvertColors(prev => !prev);
  };

  const toggleUnderlineLinks = () => {
    setUnderlineLinks(prev => !prev);
  };

  const resetAccessibility = () => {
    setFontSize(100);
    setHighContrast(false);
    setInvertColors(false);
    setUnderlineLinks(false);
    
    // Clear localStorage
    localStorage.removeItem('accessibility-font-size');
    localStorage.removeItem('accessibility-high-contrast');
    localStorage.removeItem('accessibility-invert-colors');
    localStorage.removeItem('accessibility-underline-links');
    
    // Reset DOM immediately
    document.documentElement.style.fontSize = '100%';
    document.documentElement.classList.remove('high-contrast');
    document.body.style.filter = 'none';
    document.body.style.background = '';
    
    const existingStyle = document.getElementById('accessibility-underline-links');
    if (existingStyle) {
      existingStyle.remove();
    }
  };

  return {
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
  };
};
