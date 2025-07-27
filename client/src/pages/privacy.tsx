import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { BackToTop } from '@/components/ui/back-to-top';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-warm-white text-dark-brown">
      <AccessibilityToolbar />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-4">מדיניות פרטיות</h1>
            <p className="text-xl text-gray-600">איך אנחנו שומרים על הפרטיות שלכם במאמאמיה</p>
            <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">הקדמה</h2>
              <p className="text-gray-700 leading-relaxed">
                מאמאמיה ("החברה", "אנחנו", "שלנו") מחויבת להגנה על הפרטיות של לקוחותיה ומבקרי האתר. 
                מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלכם.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">איזה מידע אנחנו אוספים</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-saddle-brown mb-2">מידע שאתם מספקים לנו:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>שם מלא</li>
                    <li>מספר טלפון</li>
                    <li>כתובת אימייל</li>
                    <li>פרטי האירוע (סוג, תאריך, מספר אורחים)</li>
                    <li>העדפות תזונתיות ואלרגיות</li>
                    <li>תקציב משוער</li>
                    <li>פרטים נוספים על האירוע</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-saddle-brown mb-2">מידע שנאסף אוטומטית:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>כתובת IP</li>
                    <li>סוג דפדפן ומערכת הפעלה</li>
                    <li>דפים שביקרתם באתר</li>
                    <li>זמן הביקור ומשך השהייה</li>
                    <li>מקור ההפניה (איך הגעתם לאתר)</li>
                  </ul>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">איך אנחנו משתמשים במידע</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• יצירת קשר איתכם בנוגע לפנייתכם</li>
                <li>• הכנת הצעת מחיר מותאמת לאירוע שלכם</li>
                <li>• תיאום האירוע ומתן השירות</li>
                <li>• שיפור השירותים שלנו</li>
                <li>• שליחת עדכונים על השירותים שלנו (רק אם הסכמתם)</li>
                <li>• עמידה בחובות החוקיות שלנו</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">שיתוף מידע עם צדדים שלישיים</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                אנחנו לא מוכרים, משכירים או מעבירים את המידע האישי שלכם לצדדים שלישיים, 
                למעט במקרים הבאים:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>ספקי שירות הנדרשים לביצוע האירוע (קייטרינג, מלצרים, הובלה)</li>
                <li>ספקי שירותים טכניים (אירוח אתר, מערכות CRM)</li>
                <li>כאשר נדרש על פי חוק</li>
                <li>בהסכמתכם המפורשת</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">אבטחת המידע</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלכם:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>הצפנת נתונים בהעברה ובאחסון</li>
                <li>גישה מוגבלת למידע רק לעובדים המורשים</li>
                <li>עדכונים שוטפים של מערכות האבטחה</li>
                <li>גיבוי קבוע של המידע</li>
                <li>פיקוח ובקרה מתמשכת על מערכות המידע</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">זכויותיכם</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                בהתאם לחוק הגנת הפרטיות התשמ"א-1981 ותקנות הגנת הפרטיות, אתם זכאים:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>לדעת איזה מידע אישי מוחזק עליכם</li>
                <li>לקבל עותק מהמידע</li>
                <li>לתקן מידע שגוי</li>
                <li>למחוק מידע (בכפוף לחובות שמירה חוקיות)</li>
                <li>להתנגד לעיבוד המידע למטרות שיווק</li>
                <li>להגיש תלונה לרשות להגנת הפרטיות</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">עוגיות (Cookies)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                האתר שלנו משתמש בעוגיות לשיפור חוויית הגלישה:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>עוגיות הכרחיות לפעולת האתר</li>
                <li>עוגיות לשיפור הביצועים</li>
                <li>עוגיות אנליטיות (Google Analytics) - רק בהסכמתכם</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                אתם יכולים לנהל את העדפות העוגיות דרך הגדרות הדפדפן שלכם.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">שמירת מידע</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו שומרים את המידע האישי שלכם למשך התקופה הנדרשת לביצוע השירותים ובהתאם לחובות החוקיות שלנו:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
                <li>פרטי יצירת קשר: עד 3 שנים ממועד האירוע</li>
                <li>חשבוניות ומסמכים כספיים: 7 שנים</li>
                <li>תיעוד אלרגיות ומגבלות תזונתיות: לצמיתות (לבטיחות)</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">קטינים</h2>
              <p className="text-gray-700 leading-relaxed">
                השירותים שלנו מיועדים למבוגרים. איננו אוספים מידע אישי מקטינים מתחת לגיל 18 ללא הסכמת הורים.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">שינויים במדיניות</h2>
              <p className="text-gray-700 leading-relaxed">
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. שינויים מהותיים יפורסמו באתר עם הודעה מוקדמת של 30 יום.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">יצירת קשר</h2>
              <div className="bg-cream p-6 rounded-xl">
                <p className="text-gray-700 leading-relaxed mb-4">
                  לשאלות או בקשות בנוגע למדיניות הפרטיות, אנא צרו קשר:
                </p>
                <div className="space-y-2">
                  <p><strong>ממונה על הגנת הפרטיות:</strong> דוד כהן</p>
                  <p><strong>טלפון:</strong> <a href="tel:052-1234567" className="text-golden hover:text-dark-golden">052-123-4567</a></p>
                  <p><strong>אימייל:</strong> <a href="mailto:privacy@mamamia.co.il" className="text-golden hover:text-dark-golden">privacy@mamamia.co.il</a></p>
                  <p><strong>כתובת:</strong> מדינת היהודים 85, הרצליה פיתוח</p>
                </div>
              </div>
            </section>
            
            <section>
              <p className="text-sm text-gray-600 text-center">
                מדיניות פרטיות זו עודכנה לאחרונה: ינואר 2024
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
}