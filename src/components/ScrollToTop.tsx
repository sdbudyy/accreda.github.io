import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollPosition = useRef(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const currentPosition = window.pageYOffset;
      
      // Update last position when scrolling down
      if (currentPosition > lastScrollPosition.current) {
        lastScrollPosition.current = currentPosition;
      }

      // Show button when scrolled down more than 300px
      if (currentPosition > 300) {
        setIsVisible(true);
        setIsAtTop(false);
      } else if (currentPosition === 0) {
        // Keep button visible but in "scroll to last position" mode
        setIsVisible(true);
        setIsAtTop(true);
      } else {
        setIsVisible(false);
        setIsAtTop(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToLastPosition = () => {
    window.scrollTo({
      top: lastScrollPosition.current,
      behavior: 'smooth',
    });
  };

  return (
    <div 
      className={`fixed bottom-20 md:bottom-6 right-6 transition-all duration-300 z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        onClick={isAtTop ? scrollToLastPosition : scrollToTop}
        className={`p-3 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isAtTop ? 'bg-slate-600 hover:bg-slate-700' : 'bg-teal-600 hover:bg-teal-700'
        }`}
        aria-label={isAtTop ? "Scroll to last position" : "Scroll to top"}
      >
        {isAtTop ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
      </button>
    </div>
  );
};

export default ScrollToTop; 