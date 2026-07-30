import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { BackToTop } from '@/components/ui/back-to-top';

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-warm-white text-dark-brown">
      <AccessibilityToolbar />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-4">הצהרת נגישות</h1>
            <p className="text-xl text-gray-600">מחויבות מאמאמיה לנגישות דיגיטלית</p>
            <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">מחויבותנו לנגישות</h2>
              <p className="text-gray-700 leading-relaxed">
                מאמאמיה מחויבת להנגשת האתר שלה לכל הציבור, כולל אנשים עם מוגבלויות. אנו פועלים להבטיח שהאתר שלנו 
                נגיש ושמיש לכולם, בהתאם לתקנות הנגישות הישראליות ולסטנדרטים הבינלאומיים.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">תקני נגישות</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                האתר שלנו מיועד להתאים לרמת AA של הנחיות WCAG 2.1 (Web Content Accessibility Guidelines), 
                הכוללות את העקרונות הבאים:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>תוכן ניתן לתפיסה - מידע ורכיבי ממשק משתמש חייבים להיות ניתנים להצגה בפני המשתמשים</li>
                <li>תוכן ניתן להפעלה - רכיבי ממשק משתמש וניווט חייבים להיות ניתנים להפעלה</li>
                <li>תוכן מובן - מידע והפעלת ממשק המשתמש חייבים להיות מובנים</li>
                <li>תוכן חזק - התוכן חייב להיות חזק מספיק כדי שיהיה ניתן לפירוש על ידי מגוון רחב של סוכני משתמש</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">תכונות נגישות באתר</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-3 space-x-reverse">
                  <i className="fas fa-check text-golden mt-1"></i>
                  <span>ניווט במקלדת - כל תכונות האתר נגישות באמצעות מקלדת בלבד</span>
                </li>
                <li className="flex items-start space-x-3 space-x-reverse">
                  <i className="fas fa-check text-golden mt-1"></i>
                  <span>תאימות לקוראי מסך - האתר תואם לקוראי מסך מובילים</span>
                </li>
                <li className="flex items-start space-x-3 space-x-reverse">
                  <i className="fas fa-check text-golden mt-1"></i>
                  <span>ניגודיות צבעים - שמירה על ניגודיות מינימלית של 4.5:1</span>
                </li>
                <li className="flex items-start space-x-3 space-x-reverse">
                  <i className="fas fa-check text-golden mt-1"></i>
                  <span>גדלי טקסט ניתנים לשינוי - עד 200% ללא אובדן תוכן או פונקציונליות</span>
                </li>
                <li className="flex items-start space-x-3 space-x-reverse">
                  <i className="fas fa-check text-golden mt-1"></i>
                  <span>טקסט חלופי לתמונות - כל התמונות כוללות תיאור חלופי</span>
                </li>
                <li className="flex items-start space-x-3 space-x-reverse">
                  <i className="fas fa-check text-golden mt-1"></i>
                  <span>כותרות מבניות - שימוש נכון בכותרות H1-H6 לניווט קל</span>
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">כלי נגישות</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                האתר כולל סרגל נגישות מתקדם המאפשר התאמה אישית של חוויית הגלישה:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• הגדלה/הקטנה של טקסט</li>
                <li>• ניגודיות גבוהה</li>
                <li>• הפיכת צבעים</li>
                <li>• קו תחתון לקישורים</li>
                <li>• איפוס הגדרות</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">בדיקות נגישות</h2>
              <p className="text-gray-700 leading-relaxed">
                האתר נבדק באופן קבוע על ידי מומחי נגישות וכלים אוטומטיים, כולל:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
                <li>בדיקות ידניות עם קוראי מסך (NVDA, JAWS, VoiceOver)</li>
                <li>בדיקות ניווט במקלדת</li>
                <li>בדיקות ניגודיות צבעים</li>
                <li>בדיקות עם כלים אוטומטיים (axe, WAVE)</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">משוב ופניות</h2>
              <div className="bg-cream p-6 rounded-xl">
                <p className="text-gray-700 leading-relaxed mb-4">
                  אנו מקבלים בברכה משוב על נגישות האתר ופועלים ללא הרף לשיפורו. 
                  אם נתקלתם בבעיות נגישות או יש לכם הצעות לשיפור, אנא צרו איתנו קשר:
                </p>
                <div className="space-y-2">
                  <p><strong>טלפון:</strong> <a href="tel:052-1234567" className="text-golden hover:text-dark-golden">052-123-4567</a></p>
                  <p><strong>אימייל:</strong> <a href="mailto:accessibility@mamamia.co.il" className="text-golden hover:text-dark-golden">accessibility@mamamia.co.il</a></p>
                  <p><strong>כתובת:</strong> מדינת היהודים 85, הרצליה פיתוח</p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">עדכונים</h2>
              <p className="text-gray-700 leading-relaxed">
                הצהרת נגישות זו עודכנה בתאריך: ינואר 2024<br/>
                האתר נבדק לאחרונה בתאריך: ינואר 2024
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