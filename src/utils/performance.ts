// Image optimization
export const optimizeImage = (url: string, width: number = 800) => {
  // If using a CDN like Cloudinary or Imgix, implement their URL transformation here
  return url;
};

// Lazy loading utility
export const lazyLoad = (element: HTMLElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  observer.observe(element);
};

// Resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    { rel: 'dns-prefetch', href: 'https://accreda.ca' },
    { rel: 'preload', href: '/fonts/main-font.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.entries(hint).forEach(([key, value]) => {
      link.setAttribute(key, value);
    });
    document.head.appendChild(link);
  });
};

// Cache control
export const setCacheHeaders = (response: Response) => {
  response.headers.set('Cache-Control', 'public, max-age=31536000');
  response.headers.set('ETag', `"${Date.now()}"`);
};

// Performance monitoring
export const trackPerformance = () => {
  if (window.performance) {
    const timing = window.performance.timing;
    const metrics = {
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: timing.responseEnd - timing.navigationStart
    };
    
    // Send metrics to analytics
    console.log('Performance metrics:', metrics);
  }
}; 