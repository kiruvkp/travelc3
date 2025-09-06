import React from 'react';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

interface BlogPageProps {
  onBack: () => void;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

export default function BlogPage({ onBack }: BlogPageProps) {
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'How AI is Revolutionizing Travel Planning',
      excerpt: 'Discover how artificial intelligence is transforming the way we plan and experience travel, making it more personalized and efficient than ever before.',
      content: `Artificial Intelligence is fundamentally changing how we approach travel planning. Gone are the days of spending hours researching destinations, comparing prices, and trying to piece together the perfect itinerary.

With AI-powered travel planning, you can now get personalized recommendations based on your unique preferences, travel style, and budget. Our AI analyzes millions of data points including weather patterns, local events, crowd levels, and user reviews to suggest the perfect activities for your trip.

The technology goes beyond simple recommendations. AI can optimize your entire itinerary, considering factors like travel time between locations, opening hours, and even your energy levels throughout the day. This means you spend less time planning and more time enjoying your adventure.

What makes AI travel planning truly powerful is its ability to learn from your feedback. The more you use it, the better it becomes at understanding your preferences and suggesting experiences you'll love.

The future of travel planning is here, and it's more intelligent, personalized, and efficient than ever before.`,
      author: 'Sarah Chen',
      date: '2024-12-15',
      readTime: '5 min read',
      category: 'Technology',
      image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      tags: ['AI', 'Technology', 'Travel Planning']
    },
    {
      id: '2',
      title: '10 Hidden Gems You Must Visit in 2025',
      excerpt: 'Explore off-the-beaten-path destinations that offer incredible experiences without the crowds. From secluded beaches to mountain villages.',
      content: `While popular destinations have their charm, there's something magical about discovering places that haven't been overrun by tourists. Here are 10 hidden gems that should be on every traveler's radar for 2025.

1. **Faroe Islands** - Dramatic landscapes and Nordic culture in the North Atlantic
2. **Raja Ampat, Indonesia** - Pristine marine biodiversity and untouched coral reefs
3. **Svaneti, Georgia** - Medieval towers and stunning mountain scenery
4. **Socotra Island, Yemen** - Alien-like landscapes and endemic species
5. **Lofoten Islands, Norway** - Arctic beauty and traditional fishing villages

Each of these destinations offers unique experiences that you simply can't find anywhere else. The key to visiting hidden gems is respectful tourism - traveling in a way that preserves these special places for future generations.

Planning a trip to these remote locations requires extra preparation, but the rewards are immeasurable. You'll return home with stories that few others can tell and memories that will last a lifetime.`,
      author: 'Emma Thompson',
      date: '2024-12-10',
      readTime: '8 min read',
      category: 'Destinations',
      image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      tags: ['Destinations', 'Hidden Gems', 'Adventure']
    },
    {
      id: '3',
      title: 'The Ultimate Guide to Budget Travel',
      excerpt: 'Learn proven strategies to travel more while spending less. From finding deals to maximizing your travel budget without sacrificing experiences.',
      content: `Traveling on a budget doesn't mean compromising on experiences. With the right strategies and mindset, you can explore the world without breaking the bank.

**Planning and Booking**
- Book flights 6-8 weeks in advance for domestic trips, 2-3 months for international
- Use flexible date searches to find the cheapest options
- Consider alternative airports and connecting flights
- Travel during shoulder seasons for better prices and fewer crowds

**Accommodation Hacks**
- Mix different types of accommodation (hostels, guesthouses, hotels)
- Consider house-sitting or home exchanges
- Book directly with hotels for potential upgrades
- Use loyalty programs and credit card points

**Food and Dining**
- Eat where locals eat for authentic and affordable meals
- Shop at local markets and cook some meals yourself
- Take advantage of hotel breakfast when included
- Try street food for delicious and budget-friendly options

**Transportation**
- Use public transportation instead of taxis
- Walk or bike when possible to explore and save money
- Consider rail passes for multi-city trips
- Book ground transportation in advance

**Activities and Experiences**
- Look for free walking tours and city activities
- Visit museums on free or discounted days
- Explore nature and outdoor activities
- Connect with locals for insider recommendations

Remember, the best travel experiences often come from unexpected moments and genuine connections, not expensive tourist attractions.`,
      author: 'Marcus Rodriguez',
      date: '2024-12-05',
      readTime: '12 min read',
      category: 'Tips & Guides',
      image: 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      tags: ['Budget Travel', 'Tips', 'Money Saving']
    },
    {
      id: '4',
      title: 'Collaborative Travel Planning: Tips for Group Trips',
      excerpt: 'Planning a trip with friends or family? Learn how to coordinate preferences, manage budgets, and ensure everyone has an amazing time.',
      content: `Group travel can create the most memorable experiences, but it also comes with unique challenges. Here's how to plan successful group trips that everyone will love.

**Setting Expectations Early**
- Discuss budget ranges openly and honestly
- Agree on the trip's purpose and vibe
- Set ground rules for decision-making
- Create a shared communication channel

**Managing Different Preferences**
- Survey everyone's must-do activities
- Plan a mix of group and individual time
- Rotate who chooses daily activities
- Have backup plans for different interests

**Budget and Expense Management**
- Use expense-splitting apps to track shared costs
- Decide on payment methods before the trip
- Plan for different spending comfort levels
- Keep receipts and settle up regularly

**Logistics and Coordination**
- Assign different people to research different aspects
- Create shared documents for important information
- Plan transportation that works for the group size
- Book accommodations that facilitate group bonding

**During the Trip**
- Stay flexible and open to changes
- Communicate openly about any issues
- Respect different energy levels and preferences
- Focus on creating shared memories

The key to successful group travel is communication, flexibility, and remembering that the goal is for everyone to have a great time together.`,
      author: 'David Kim',
      date: '2024-11-28',
      readTime: '7 min read',
      category: 'Group Travel',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
      tags: ['Group Travel', 'Collaboration', 'Planning']
    },
  ];

  const categories = ['All', 'Technology', 'Destinations', 'Tips & Guides', 'Group Travel'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setSelectedPost(null)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Blog</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Travel insights and tips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Article */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            
            <div className="p-8 md:p-12">
              <div className="flex items-center space-x-4 mb-6">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {selectedPost.category}
                </span>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(selectedPost.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {selectedPost.readTime}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedPost.title}
              </h1>

              <div className="flex items-center mb-8">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">By {selectedPost.author}</span>
              </div>

              <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                {selectedPost.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Blog</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Travel insights and tips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Blog</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Travel insights and tips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Travel Insights & Tips
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Expert advice, destination guides, and travel stories to inspire your next adventure.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 group"
            >
              <div className="relative h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 text-gray-800 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Stay Updated with Travel Tips
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Get the latest travel insights, destination guides, and planning tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}