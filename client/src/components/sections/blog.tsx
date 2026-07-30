import { Button } from '@/components/ui/button';
import { blogData } from '@/data/blog-data';
import { Link } from 'wouter';

export const Blog = () => {
  return (
    <section id="blog" className="py-20 bg-gradient-to-br from-cream to-cornsilk relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">הבלוג שלנו</span>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 mt-2">טיפים, מתכונים וסיפורי הצלחה</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            חלקו איתנו את החוויות, התובנות והמתכונים הסודיים שלנו למען האירוع המושלם שלכם.
          </p>
          <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogData.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover-lift">
              <img 
                src={post.image} 
                alt={post.alt} 
                className="w-full h-48 object-cover"
              />
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
                <h3 className="text-xl font-bold text-dark-brown mb-3">{post.title}</h3>
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
        
        <div className="text-center mt-12">
          <Link href="/blog">
            <Button className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift shadow-lg">
              <i className="fas fa-blog ml-2"></i>
              לכל הפוסטים בבלוג
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
