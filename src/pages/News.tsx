
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, TrendingUp, Home, Globe } from 'lucide-react';

const News = () => {
  const newsArticles = [
    {
      id: 1,
      title: 'Zambian Real Estate Market Shows Strong Growth in 2024',
      excerpt: 'The Zambian property market continues to attract both local and international investors, with residential properties leading the surge.',
      category: 'Market Trends',
      author: 'ABS Research Team',
      date: '2024-01-15',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'New Agricultural Land Investment Opportunities in Mumbwa',
      excerpt: 'Discover the potential of investing in fertile agricultural land in Mumbwa district, with government support for farming initiatives.',
      category: 'Investment',
      author: 'David Phiri',
      date: '2024-01-10',
      readTime: '3 min read',
      featured: false
    },
    {
      id: 3,
      title: 'Complete Guide: Buying Property in Zambia from Abroad',
      excerpt: 'Essential steps and requirements for diaspora community members looking to invest in Zambian real estate remotely.',
      category: 'Diaspora Guide',
      author: 'Grace Tembo',
      date: '2024-01-08',
      readTime: '8 min read',
      featured: true
    },
    {
      id: 4,
      title: 'Lusaka CBD Office Space Demand Reaches New Heights',
      excerpt: 'Commercial real estate in Lusaka central business district sees unprecedented demand as businesses expand operations.',
      category: 'Commercial',
      author: 'Sarah Mwanza',
      date: '2024-01-05',
      readTime: '4 min read',
      featured: false
    },
    {
      id: 5,
      title: 'Understanding Property Legal Requirements in Zambia',
      excerpt: 'Navigate the legal landscape of property ownership, title deeds, and compliance requirements in Zambian real estate.',
      category: 'Legal Guide',
      author: 'ABS Legal Team',
      date: '2024-01-03',
      readTime: '6 min read',
      featured: false
    },
    {
      id: 6,
      title: 'Technology Transforming Real Estate in Zambia',
      excerpt: 'How virtual tours, digital documentation, and online transactions are revolutionizing property investments.',
      category: 'Technology',
      author: 'Abraham Banda',
      date: '2024-01-01',
      readTime: '5 min read',
      featured: false
    }
  ];

  const categories = ['All', 'Market Trends', 'Investment', 'Diaspora Guide', 'Commercial', 'Legal Guide', 'Technology'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Market Trends': return TrendingUp;
      case 'Investment': return Home;
      case 'Diaspora Guide': return Globe;
      case 'Commercial': return Home;
      case 'Legal Guide': return Home;
      case 'Technology': return Home;
      default: return Home;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Market Trends': return 'bg-blue-100 text-blue-800';
      case 'Investment': return 'bg-green-100 text-green-800';
      case 'Diaspora Guide': return 'bg-purple-100 text-purple-800';
      case 'Commercial': return 'bg-orange-100 text-orange-800';
      case 'Legal Guide': return 'bg-red-100 text-red-800';
      case 'Technology': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const featuredArticles = newsArticles.filter(article => article.featured);
  const regularArticles = newsArticles.filter(article => !article.featured);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real Estate News & Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest trends, opportunities, and expert advice 
            in the Zambian real estate market.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredArticles.map((article) => {
                const CategoryIcon = getCategoryIcon(article.category);
                return (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(article.category)}>
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {article.category}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500 space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl hover:text-primary cursor-pointer transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => {
              const CategoryIcon = getCategoryIcon(article.category);
              return (
                <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(article.category)} variant="secondary">
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {article.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg hover:text-primary cursor-pointer transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{article.author}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <Card className="mt-16 bg-gradient-to-r from-primary to-secondary text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Stay Updated with ABS Real Estate
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Subscribe to our newsletter for the latest market insights, investment opportunities, 
              and property news delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500"
              />
              <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              No spam, unsubscribe at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default News;
