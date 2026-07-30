import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { BackToTop } from '@/components/ui/back-to-top';

export default function Terms() {
  return (
    <div className="min-h-screen bg-warm-white text-dark-brown">
      <AccessibilityToolbar />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-4">תקנון השימוש</h1>
            <p className="text-xl text-gray-600">התנאים וההגבלות לשימוש בשירותי מאמאמיה</p>
            <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">הגדרות</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>"החברה"</strong> - מאמאמיה קייטרינג בע"מ</li>
                <li><strong>"הלקוח"</strong> - הזמין שירותי קייטרינג מהחברה</li>
                <li><strong>"האירוע"</strong> - כל אירוע בו נדרשים שירותי קייטרינג</li>
                <li><strong>"ההזמנה"</strong> - בקשה לשירותי קייטרינג שאושרה על ידי החברה</li>
                <li><strong>"השירותים"</strong> - כל השירותים הניתנים על ידי החברה</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">הזמנת שירותים</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-saddle-brown">תהליך ההזמנה:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>מילוי טופס יצירת קשר או פנייה טלפונית</li>
                  <li>קבלת הצעת מחיר מפורטת</li>
                  <li>אישור ההזמנה ומתן מקדמה</li>
                  <li>חתימה על חוזה (לאירועים מעל ₪10,000)</li>
                </ol>
                
                <div className="bg-cream p-4 rounded-lg mt-4">
                  <p className="text-gray-700">
                    <strong>חשוב:</strong> ההזמנה מתבצעת רק לאחר קבלת אישור בכתב מהחברה וביצוע התשלום הנדרש.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">מחירים ותשלומים</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-saddle-brown">מדיניות מחירים:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>כל המחירים כוללים מע"מ לפי החוק</li>
                  <li>המחירים בתוקף למשך 30 יום ממועד ההצעה</li>
                  <li>שינויים במספר האורחים יתומחרו בהתאם</li>
                  <li>תוספת של 15% עבור אירועים בסוף השבוע</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-saddle-brown mt-6">תנאי תשלום:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>מקדמה של 50% בעת אישור ההזמנה</li>
                  <li>יתרת התשלום עד 7 ימים לפני האירוע</li>
                  <li>תשלום במזומן, המחאה או העברה בנקאית</li>
                  <li>אירועים בהיקף קטן (עד 20 אורחים) - תשלום מלא מראש</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">ביטולים ושינויים</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-saddle-brown">מדיניות ביטולים:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>עד 72 שעות מראש:</strong> החזר מלא של הסכום ששולם</li>
                  <li><strong>24-72 שעות מראש:</strong> החזר של 50% מהסכום</li>
                  <li><strong>פחות מ-24 שעות:</strong> ללא החזר (למעט כוח עליון)</li>
                  <li><strong>כוח עליון:</strong> החזר מלא בכפוף להצגת אישור רלוונטי</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-saddle-brown mt-6">שינויים בהזמנה:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>שינויים במספר האורחים: עד 48 שעות מראש</li>
                  <li>שינויים בתפריט: עד 72 שעות מראש</li>
                  <li>שינוי תאריך: בכפוף לזמינות, עלות נוספת עשויה לחול</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">אחריות ואחריותיות</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-saddle-brown">אחריות החברה:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>מתן שירותי קייטרינג באיכות גבוהה</li>
                  <li>שמירה על תקני כשרות ובטיחות המזון</li>
                  <li>הגעה בזמן לאירוע</li>
                  <li>מתן השירותים בהתאם להזמנה המאושרת</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-saddle-brown mt-6">אחריות הלקוח:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>מתן פרטים מדויקים בעת ההזמנה</li>
                  <li>הודעה על אלרגיות ומגבלות תזונתיות</li>
                  <li>הכנת המקום לביצוע השירות</li>
                  <li>תשלום על פי התנאים המוסכמים</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">בטיחות המזון וכשרות</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-saddle-brown">תקני כשרות:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>כל המזון כשר בד"ץ מהדרין</li>
                  <li>הפרדה מלאה בין בשרי לחלבי</li>
                  <li>שמירה על שרשרת הכשרות מהכנה ועד הגשה</li>
                  <li>פיקוח רבני קבוע</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-saddle-brown mt-6">בטיחות מזון:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>שמירה על שרשרת הקור</li>
                  <li>הכנה במטבחים מורשים בלבד</li>
                  <li>בדיקות איכות קבועות</li>
                  <li>הכשרת הצוות בנושא בטיחות מזון</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">מגבלות אחריות</h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  <strong>חשוב לדעת:</strong> אחריות החברה מוגבלת לערך השירותים שנרכשו. 
                  החברה לא תהא אחראית לנזקים עקיפים, אובדן רווחים או נזקים שנגרמו בשל:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-1 text-gray-700">
                  <li>כוח עליון (מזג אוויר קיצוני, שביתות, מלחמה וכו')</li>
                  <li>מידע שגוי שסופק על ידי הלקוח</li>
                  <li>שינויים דקה אחרונה מצד הלקוח</li>
                  <li>בעיות באתר האירוע (חשמל, מים וכו')</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">זכויות יוצרים וקניין רוחני</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>כל המתכונים והנוסחאות הם קניינה הרוחני של החברה</li>
                <li>אסור לשכפל או להפיץ מתכונים ללא הסכמה בכתב</li>
                <li>צילומי האירוע עשויים לשמש לצרכי שיווק (למעט אם התבקש אחרת)</li>
                <li>שם "מאמאמיה" הוא סימן מסחרי רשום</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">יישוב סכסוכים</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-saddle-brown">הליך יישוב סכסוכים:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>פנייה ישירה למנהל השירותים</li>
                  <li>דיון ופתרון בתום לב</li>
                  <li>בעת הצורך - בוררות על פי חוק הבוררות</li>
                  <li>בית המשפט המוסמך: מחוז תל אביב</li>
                </ol>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">שונות</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>תקנון זה כפוף לדיני מדינת ישראל</li>
                <li>שינויים בתקנון ייכנסו לתוקף לאחר פרסום באתר</li>
                <li>אם סעיף כלשהו בטל, יתר הסעיפים יישארו בתוקף</li>
                <li>הסכמים בכתב גוברים על תקנון זה</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-dark-brown mb-4">פרטי החברה</h2>
              <div className="bg-cream p-6 rounded-xl">
                <div className="space-y-2">
                  <p><strong>שם החברה:</strong> מאמאמיה קייטרינג בע"מ</p>
                  <p><strong>ח.פ:</strong> 123456789</p>
                  <p><strong>כתובת:</strong> מדינת היהודים 85, הרצליה פיתוח</p>
                  <p><strong>טלפון:</strong> <a href="tel:052-1234567" className="text-golden hover:text-dark-golden">052-123-4567</a></p>
                  <p><strong>אימייל:</strong> <a href="mailto:info@mamamia.co.il" className="text-golden hover:text-dark-golden">info@mamamia.co.il</a></p>
                </div>
              </div>
            </section>
            
            <section>
              <p className="text-sm text-gray-600 text-center">
                תקנון זה עודכן לאחרונה: ינואר 2024
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