import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

export const generateSitemap = async () => {
  try {
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/settings', changefreq: 'weekly', priority: 0.8 },
      { url: '/dashboard', changefreq: 'daily', priority: 0.9 },
      { url: '/skills', changefreq: 'weekly', priority: 0.8 },
      { url: '/saos', changefreq: 'weekly', priority: 0.8 },
      { url: '/supervisors', changefreq: 'weekly', priority: 0.7 },
      { url: '/about', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.5 },
    ];

    const stream = new SitemapStream({ hostname: 'https://accreda.com' });
    const data = await streamToPromise(Readable.from(links).pipe(stream));
    return data.toString();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return '';
  }
}; 