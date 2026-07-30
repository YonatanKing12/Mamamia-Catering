import { db } from './db';
import { blogPosts, testimonials, galleryItems } from '@shared/schema';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // Seed blog posts
  const blogPostsData = [
    {
      title: 'טיפים לתכנון תפריט חתונה מושלם',
      slug: 'wedding-menu-tips',
      excerpt: 'כיצד לבחור תפריט שיתאים לכל האורחים ויביא לכם המון מחמאות',
      content: 'תכנון תפריט לחתונה הוא אחד השלבים החשובים ביותר בארגון האירוע. הנה המדריך המלא שלנו...',
      imageUrl: '/images/wedding-table.jpg',
      category: 'חתונות',
      tags: ['חתונות', 'תפריט', 'טיפים'],
    },
    {
      title: 'המדריך המלא לאירועי בר מצווה',
      slug: 'bar-mitzvah-guide',
      excerpt: 'כל מה שצריך לדעת על ארגון אירוע בר מצווה בלתי נשכח',
      content: 'אירוע בר מצווה הוא רגע מיוחד במחזור החיים היהודי. הנה איך להפוך אותו לבלתי נשכח...',
      imageUrl: '/images/bar-mitzvah.jpg',
      category: 'בר מצווה',
      tags: ['בר מצווה', 'אירועים', 'משפחה'],
    },
    {
      title: 'קייטרינג כשר: מה חשוב לדעת',
      slug: 'kosher-catering-guide',
      excerpt: 'המדריך המקיף לכשרות בקייטרינג והדרישות השונות',
      content: 'כשרות בקייטרינג היא נושא מורכב ורגיש. הנה כל מה שצריך לדעת...',
      imageUrl: '/images/kosher-kitchen.jpg',
      category: 'כשרות',
      tags: ['כשרות', 'הלכה', 'מטבח'],
    }
  ];

  await db.insert(blogPosts).values(blogPostsData);

  // Seed testimonials
  const testimonialsData = [
    {
      name: 'שרה כהן',
      eventType: 'חתונה',
      rating: 5,
      content: 'הקייטרינג של מאמאמיה הפך את החתונה שלנו לבלתי נשכחת! האוכל היה מדהים והשירות מעולה.',
      imageUrl: '/images/sarah-cohen.jpg',
      eventDate: '2023-12-15',
      featured: true,
    },
    {
      name: 'דוד לוי',
      eventType: 'בר מצווה',
      rating: 5,
      content: 'ארגון מושלם! כל האורחים התלהבו מהאוכל והשירות. ממליץ בחום!',
      imageUrl: '/images/david-levi.jpg',
      eventDate: '2023-11-20',
      featured: true,
    },
    {
      name: 'מרים גולדשטיין',
      eventType: 'אירוע עסקי',
      rating: 5,
      content: 'קייטרינג ברמה גבוהה מאוד! הצוות מקצועי ואדיב, והאוכל טעים ומגוון.',
      imageUrl: '/images/miriam-gold.jpg',
      eventDate: '2023-10-05',
      featured: false,
    }
  ];

  await db.insert(testimonials).values(testimonialsData);

  // Seed gallery items
  const galleryData = [
    {
      title: 'חתונה מפוארת בירושלים',
      description: 'אירוע חתונה מרהיב עם 200 אורחים',
      imageUrl: '/images/gallery/wedding-1.jpg',
      category: 'חתונות',
      eventType: 'חתונה',
      featured: true,
    },
    {
      title: 'בר מצווה בגן אירועים',
      description: 'חגיגת בר מצווה משפחתית וחמה',
      imageUrl: '/images/gallery/bar-mitzvah-1.jpg',
      category: 'בר מצווה',
      eventType: 'בר מצווה',
      featured: true,
    },
    {
      title: 'כנס עסקי בתל אביב',
      description: 'קייטרינג מקצועי לכנס חברתי',
      imageUrl: '/images/gallery/corporate-1.jpg',
      category: 'אירועי עסקים',
      eventType: 'אירוע עסקי',
      featured: false,
    },
    {
      title: 'ארוחת שבת משפחתית',
      description: 'ארוחה ביתית ומסורתית',
      imageUrl: '/images/gallery/shabbat-1.jpg',
      category: 'אירועי משפחה',
      eventType: 'חגיגה משפחתית',
      featured: true,
    }
  ];

  await db.insert(galleryItems).values(galleryData);

  console.log('✅ Database seeded successfully!');
}

// Run if called directly
seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  });

export { seedDatabase };