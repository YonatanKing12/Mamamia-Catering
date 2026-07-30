export const Footer = () => {
  return (
    <footer className="bg-dark-brown text-white py-16 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-golden mb-2">מאמאמיה</h3>
              <p className="text-gray-300">טעמים של בית, חוויה של פעם בחיים</p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              קייטרינג כשר וביתי שמביא אהבה ומסורת לכל אירוע. 25 שנות ניסיון ואלפי לקוחות מרוצים.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="w-10 h-10 bg-golden rounded-full flex items-center justify-center hover:bg-dark-golden transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-golden rounded-full flex items-center justify-center hover:bg-dark-golden transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://wa.me/972521234567" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-golden rounded-full flex items-center justify-center hover:bg-dark-golden transition-colors">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-golden">השירותים שלנו</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-golden transition-colors">קייטרינג לחתונות</a></li>
              <li><a href="#" className="hover:text-golden transition-colors">אירועים עסקיים</a></li>
              <li><a href="#" className="hover:text-golden transition-colors">בר/בת מצווה</a></li>
              <li><a href="#" className="hover:text-golden transition-colors">אירועי הזכרון</a></li>
              <li><a href="#" className="hover:text-golden transition-colors">אירוח ביתי</a></li>
              <li><a href="#" className="hover:text-golden transition-colors">חגים ומועדים</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-golden">קישורים מהירים</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#story" className="hover:text-golden transition-colors">הסיפור שלנו</a></li>
              <li><a href="#menu" className="hover:text-golden transition-colors">התפריט</a></li>
              <li><a href="#gallery" className="hover:text-golden transition-colors">גלריה</a></li>
              <li><a href="#blog" className="hover:text-golden transition-colors">בלוג</a></li>
              <li><a href="#" className="hover:text-golden transition-colors">המלצות</a></li>
              <li><a href="#contact" className="hover:text-golden transition-colors">צור קשר</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-golden">פרטי התקשרות</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="fas fa-phone text-golden"></i>
                <a href="tel:052-1234567" className="hover:text-golden transition-colors">052-123-4567</a>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="fas fa-map-marker-alt text-golden"></i>
                <span>מדינת היהודים 85, הרצליה פיתוח</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="fas fa-clock text-golden"></i>
                <span>ראשון-חמישי: 9:00-22:00</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="fas fa-certificate text-golden"></i>
                <span>כשר בד"ץ מהדרין</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 מאמאמיה. כל הזכויות שמורות.
            </div>
            <div className="flex space-x-6 space-x-reverse text-sm text-gray-400">
              <a href="#" className="hover:text-golden transition-colors">מדיניות פרטיות</a>
              <a href="#" className="hover:text-golden transition-colors">תקנון</a>
              <a href="#" className="hover:text-golden transition-colors">הצהרת נגישות</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
