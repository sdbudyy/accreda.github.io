export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Accreda',
  url: 'https://accreda.ca',
  logo: 'https://accreda.ca/logo.png',
  description: 'Professional engineering portfolio management platform',
  sameAs: [
    'https://linkedin.com/company/accreda',
    'https://twitter.com/accreda',
    'https://facebook.com/accreda'
  ]
});

export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Accreda',
  url: 'https://accreda.ca',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://accreda.ca/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
});

export const generateBlogPostSchema = (post: {
  title: string;
  description: string;
  date: string;
  author: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  datePublished: post.date,
  author: {
    '@type': 'Person',
    name: post.author
  },
  publisher: {
    '@type': 'Organization',
    name: 'Accreda',
    logo: {
      '@type': 'ImageObject',
      url: 'https://accreda.ca/logo.png'
    }
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': post.url
  }
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const generateFAQSchema = (questions: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(q => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer
    }
  }))
}); 