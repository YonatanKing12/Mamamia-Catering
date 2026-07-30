import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { blogData } from '@/data/blog-data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { BackToTop } from '@/components/ui/back-to-top';

export default function BlogPost() {
  const params = useParams();
  const post = blogData.find(p => p.id === params.id);

  if (!post) {
    return (
      <div className="min-h-screen bg-warm-white">
        <AccessibilityToolbar />
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-dark-brown mb-4">הפוסט לא נמצא</h1>
          <p className="text-gray-600 mb-8">מצטערים, הפוסט שחיפשתם לא קיים.</p>
          <Link href="/">
            <Button className="bg-golden hover:bg-dark-golden text-white">
              חזרה לעמוד הבית
            </Button>
          </Link>
        </div>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <AccessibilityToolbar />
      <Header />
      
      <article className="container mx-auto px-4 py-20">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-golden">עמוד הבית</Link>
            </li>
            <li><i className="fas fa-chevron-left mx-2"></i></li>
            <li>
              <Link href="/#blog" className="hover:text-golden">בלוג</Link>
            </li>
            <li><i className="fas fa-chevron-left mx-2"></i></li>
            <li className="text-dark-brown">{post.title}</li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              post.category === 'טיפים מקצועיים' ? 'bg-golden text-white' :
              post.category === 'מתכונים' ? 'bg-wine-red text-white' :
              'bg-green-600 text-white'
            }`}>
              {post.category}
            </span>
            <span className="text-gray-500 mr-4">{post.date}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            {post.excerpt}
          </p>
        </header>

        {/* Featured Image */}
        <div className="mb-12">
          <img 
            src={post.image} 
            alt={post.alt}
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none text-right" dir="rtl">
          {post.category === 'טיפים מקצועיים' && post.id === '1' && (
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-xl font-medium text-dark-brown">
                בחירת התפריט המושלם לאירוע היא אמנות המשלבת טעם, אסתטיקה ותקציב. 
                אחרי 25 שנות ניסיון בקייטרינג כשר ביתי, אנחנו חושפים בפניכם את הסודות המקצועיים שלנו.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">1. הכירו את האורחים שלכם</h2>
              <p>
                לפני שתתחילו לתכנן את התפריט, חשוב להבין את קהל היעד. האם מדובר באירוע עסקי פורמלי או במסיבת יום הולדת משפחתית? 
                האם יש אורחים עם הגבלות תזונתיות מיוחדות? הבנת הקהל תעזור לכם לבחור את הסגנון והמנות המתאימות.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">2. התאימו את התפריט לאירוע</h2>
              <p>
                כל אירוע דורש גישה שונה. ברית מילה תדרוש מנות קלות ונוחות לאכילה, בעוד חתונה יכולה להרשות לעצמה תפריט מורכב וחגיגי יותר. 
                אנחנו במאמאמיה מתמחים ביצירת תפריטים המותאמים בדיוק לאופי האירוע שלכם.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">3. שקלו את העונה והמיקום</h2>
              <p>
                תפריט קיץ שונה מתפריט חורף. באירועי קיץ נעדיף סלטים קלים ומרעננים, בעוד באירועי חורף נוסיף מנות חמות ומפנקות. 
                גם המיקום משפיע - אירוע בחוץ דורש מנות שיחזיקו מעמד בחום, ואירוע באולם מאפשר גמישות רבה יותר.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">4. איזנו בין טעמים וטקסטורות</h2>
              <p>
                תפריט מוצלח כולל מגוון טעמים וטקסטורות. נשלב מנות פריכות עם רכות, מתוקות עם מלוחות, חמות עם קרות. 
                המטרה היא ליצור חוויה קולינרית מרובת שכבות שתספק את כל האורחים.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">5. תכננו את התקציב בחוכמה</h2>
              <p>
                תקציב הוא שיקול מרכזי, אבל לא צריך לוותר על איכות. במאמאמיה אנחנו מאמינים שגם בתקציב מוגבל אפשר ליצור חוויה קולינרית מדהימה. 
                הסוד הוא בבחירת מרכיבים איכותיים ובהכנה מקצועית שמעלה את הטעם של כל מנה.
              </p>
              
              <div className="bg-cream p-6 rounded-lg mt-8">
                <h3 className="text-xl font-bold text-dark-brown mb-3">הטיפ הזהב שלנו</h3>
                <p className="text-gray-700">
                  זכרו - האוכל הוא לא רק מזון, הוא חלק מהחוויה והזיכרון של האירוע. השקיעו בקייטרינג איכותי שיהפוך את האירוע שלכם 
                  לבלתי נשכח עבור כל המשתתפים.
                </p>
              </div>
            </div>
          )}

          {post.category === 'מתכונים' && post.id === '2' && (
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-xl font-medium text-dark-brown">
                האסאדו המושלם של מאמאמיה הוא אחד המנות הכי מבוקשות שלנו. 
                אחרי שנים של פיתוח וחידוד, אנחנו מוכנים לחלוק איתכם את המתכון הסודי.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">רכיבים למנת אסאדו ל-8 סועדים:</h2>
              <ul className="list-disc list-inside space-y-2 mr-6">
                <li>3 ק"ג אסאדו איכותי (עדיף עם עצם)</li>
                <li>4 בצלים גדולים</li>
                <li>1 כוס יין אדום יבש</li>
                <li>3 כפות רוטב עגבניות מרוכז</li>
                <li>2 כפות דבש</li>
                <li>1 כף פלפל שחור גס</li>
                <li>2 כפיות מלח ים גס</li>
                <li>4 שיני שום כתושות</li>
                <li>עלי דפנה</li>
                <li>רוזמרין טרי</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">אופן ההכנה:</h2>
              <ol className="list-decimal list-inside space-y-3 mr-6">
                <li>מתבלים את האסאדו במלח ופלפל ומניחים בצד ל-30 דקות</li>
                <li>מחממים תנור ל-160 מעלות</li>
                <li>מטגנים את האסאדו בסיר כבד מכל הצדדים עד לקבלת צבע זהוב</li>
                <li>מוציאים את הבשר ומטגנים את הבצלים עד לריכוך</li>
                <li>מוסיפים שום, רוטב עגבניות ויין ומבשלים דקה</li>
                <li>מחזירים את הבשר לסיר, מוסיפים דבש ועשבי תיבול</li>
                <li>מכסים ומכניסים לתנור למשך 3-4 שעות</li>
                <li>בודקים מדי שעה ומוסיפים מים חמים לפי הצורך</li>
              </ol>
              
              <div className="bg-wine-red/10 p-6 rounded-lg mt-8 border border-wine-red/20">
                <h3 className="text-xl font-bold text-wine-red mb-3">הסוד המקצועי</h3>
                <p className="text-gray-700">
                  הסוד של האסאדו המושלם הוא בבישול איטי ובסבלנות. אל תמהרו את התהליך - תנו לבשר להתבשל לאט 
                  ולספוג את כל הטעמים. התוצאה תהיה בשר שנמס בפה ובשרותי רוטב עשיר ומלא טעם.
                </p>
              </div>
            </div>
          )}

          {post.category === 'סיפורי לקוחות' && post.id === '3' && (
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-xl font-medium text-dark-brown">
                רחל ודוד חלמו על חתונה בסגנון הביתי המסורתי, והם פנו אלינו כדי להפוך את החלום למציאות. 
                הנה הסיפור המלא על איך יצרנו עבורם חגיגה בלתי נשכחת.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">האתגר</h2>
              <p>
                רחל ודוד רצו חתונה אינטימית ל-120 אורח, עם תחושה של ארוחת שבת משפחתית גדולה. 
                הם חיפשו אוכל ביתי איכותי שיזכיר לאורחים את הטעמים של פעם, אבל ברמה מקצועית.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">הפתרון שלנו</h2>
              <p>
                עיצבנו תפריט מיוחד שכלל את המנות הכי אהובות במטבח הישראלי: קובה במרק כתום עשיר, 
                סביח טרי עם ביצה רכה, גפילטע פיש של סבתא, ועוד שפע של מטעמים שהזכירו לכולם את הילדות.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">היום הגדול</h2>
              <p>
                ביום החתונה הגענו מוקדם להכין הכל טרי באתר. המטבח שלנו עבד כמו שעון, והאורחים התחילו 
                להתלהב מהריחות המדהימים שהגיעו מהמטבח. כל מנה הוגשה בדיוק ברגע הנכון, חמה וטעימה.
              </p>
              
              <h2 className="text-2xl font-bold text-dark-brown mt-8 mb-4">ההצלחה</h2>
              <p>
                התוצאה עברה את כל הציפיות. האורחים לא הפסיקו לשבח את האוכל, ורחל ודוד קיבלו מחמאות 
                חודשים אחרי החתונה. הכי יפה היה לראות את הסבים והסבתות מתרגשים מהטעמים המוכרים.
              </p>
              
              <div className="bg-green-50 p-6 rounded-lg mt-8 border border-green-200">
                <h3 className="text-xl font-bold text-green-700 mb-3">מה אמרה רחל</h3>
                <blockquote className="text-gray-700 italic text-lg">
                  "מאמאמיה לא רק הכינו לנו אוכל מדהים, הם יצרו חוויה שתישאר איתנו לכל החיים. 
                  כל פרט היה מושלם, והטעם פשוט לא נתפס. תודה שעזרתם לנו להפוך את החתונה שלנו לחלום שהתגשם!"
                </blockquote>
                <cite className="block mt-3 font-semibold">רחל כהן, כלה מרוצה</cite>
              </div>
            </div>
          )}
        </div>

        {/* Related Posts */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-dark-brown mb-8">פוסטים נוספים שעשויים לעניין אתכם</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {blogData.filter(p => p.id !== post.id).slice(0, 2).map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={relatedPost.image} 
                    alt={relatedPost.alt}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <span className="text-sm text-golden font-semibold">{relatedPost.category}</span>
                    <h4 className="font-bold text-dark-brown mt-1 mb-2">{relatedPost.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-golden/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-dark-brown mb-4">מעוניינים בקייטרינג איכותי לאירוע שלכם?</h3>
          <p className="text-gray-600 mb-6">נשמח לתכנן עבורכם תפריט מותאם אישית שיהפוך את האירוע שלכם לבלתי נשכח</p>
          <Link href="/#contact">
            <Button className="bg-golden hover:bg-dark-golden text-white px-8 py-3 rounded-full">
              <i className="fas fa-phone ml-2"></i>
              צרו קשר עכשיו
            </Button>
          </Link>
        </div>
      </article>
      
      <Footer />
      <BackToTop />
    </div>
  );
}