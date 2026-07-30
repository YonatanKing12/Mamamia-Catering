import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { blogData } from '@/data/blog-data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { BackToTop } from '@/components/ui/back-to-top';

const categories = [
  { id: 'all', name: 'הכל' },
  { id: 'טיפים מקצועיים', name: 'טיפים מקצועיים' },
  { id: 'מתכונים', name: 'מתכונים' },
  { id: 'סיפורי לקוחות', name: 'סיפורי לקוחות' }
];

export default function BlogList() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredPosts = blogData.filter(post => 
    activeCategory === 'all' || post.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-warm-white">
      <AccessibilityToolbar />
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">הבלוג שלנו</span>
          <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 mt-2">
            טיפים, מתכונים וסיפורי הצלחה
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            חלקו איתנו את החוויות, התובנות והמתכונים הסודיים שלנו למען האירוע המושלם שלכם.
          </p>
          <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-golden hover:bg-dark-golden text-white'
                    : 'bg-transparent border-2 border-golden text-golden hover:bg-golden hover:text-white'
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover-lift">
              <Link href={`/blog/${post.id}`}>
                <img 
                  src={post.image} 
                  alt={post.alt} 
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    post.category === 'טיפים מקצועיים' ? 'bg-golden text-white' :
                    post.category === 'מתכונים' ? 'bg-wine-red text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm mr-3">{post.date}</span>
                </div>
                <Link href={`/blog/${post.id}`}>
                  <h3 className="text-xl font-bold text-dark-brown mb-3 hover:text-golden transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.id}`}>
                  <Button
                    variant="link"
                    className="text-golden hover:text-dark-golden font-semibold p-0"
                  >
                    קראו עוד <i className="fas fa-arrow-left mr-1"></i>
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-golden to-dark-golden rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">הישארו מעודכנים!</h3>
          <p className="mb-6">הירשמו לניוזלטר שלנו וקבלו טיפים, מתכונים והצעות מיוחדות</p>
          <div className="flex max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="הכניסו את האימייל שלכם"
              className="flex-1 px-4 py-3 rounded-r-lg text-gray-800 focus:outline-none"
            />
            <Button className="bg-dark-brown hover:bg-black text-white px-6 py-3 rounded-l-lg">
              הרשמה
            </Button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="outline" className="border-golden text-golden hover:bg-golden hover:text-white">
              <i className="fas fa-home ml-2"></i>
              חזרה לעמוד הבית
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
      <BackToTop />
    </div>
  );
}