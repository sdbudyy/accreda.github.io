import React from 'react';
import SEO from '../components/SEO';

const blogPosts = [
  {
    id: 1,
    title: "How to Prepare for Your CSAW Application: A Complete Guide",
    description: "Learn the essential steps and best practices for preparing a successful CSAW application, including portfolio organization and skill documentation.",
    date: "2024-03-20",
    readTime: "8 min read",
    slug: "how-to-prepare-csaw-application",
    category: "Career Development"
  },
  {
    id: 2,
    title: "Essential Engineering Skills for Professional Growth",
    description: "Discover the most in-demand engineering skills and how to develop them for career advancement.",
    date: "2024-03-18",
    readTime: "6 min read",
    slug: "essential-engineering-skills",
    category: "Skills Development"
  },
  {
    id: 3,
    title: "Building an Effective Engineering Portfolio",
    description: "Learn how to create a compelling engineering portfolio that showcases your skills and experience.",
    date: "2024-03-15",
    readTime: "7 min read",
    slug: "building-engineering-portfolio",
    category: "Portfolio Management"
  }
];

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO 
        title="Engineering Career Development Blog | Accreda"
        description="Expert insights on engineering career development, CSAW applications, and professional portfolio management. Stay updated with the latest engineering career trends."
        keywords="engineering blog, CSAW application guide, engineering career development, professional portfolio tips, engineering skills"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Engineering Career Development Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert insights and guides to help you advance your engineering career
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                    {post.title}
                  </a>
                </h2>
                <p className="text-gray-600 mb-4">
                  {post.description}
                </p>
                <a 
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                >
                  Read more
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-blue-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated with Engineering Career Insights
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest tips on engineering career development, CSAW applications, and professional growth.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blog; 