export const Story = () => {
  return (
    <section id="story" className="py-20 bg-cream relative">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full organic-shape bg-golden"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">הסיפור שלנו</span>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 mt-2">מטבח של מסורת, שירות של משפחה</h2>
          <div className="w-24 h-1 bg-golden mx-auto"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-saddle-brown">איפה כל מנה מתחילה באהבה</h3>
            <p className="text-lg leading-relaxed text-gray-800 font-medium">
              במאמאמיה, אנחנו לא רק מבשלים – אנחנו יוצרים זיכרונות. הסיפור שלנו נרקם בין סירים מהבילים במטבח הביתי, 
              עם מתכונים סודיים שעברו במשפחה מדור לדור, ניחוחות ילדות, ותשוקה אמיתית לארח ולהאכיל.
            </p>
            <p className="text-lg leading-relaxed text-gray-800 font-medium">
              את כל החום, האכפתיות והטעמים האותנטיים האלה, אנחנו מביאים היום ישירות אליכם, עם שירותי קייטרינג 
              כשרים ומוקפדים. כל מנה מוכנה מחומרי הגלם הטריים והאיכותיים ביותר, תוך שמירה על כשרות מהודרת של בד"ץ מהדרין.
            </p>
            
            {/* Timeline */}
            <div className="space-y-4 mt-8">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-white text-sm"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-dark-brown">1995 - ההתחלה</h4>
                  <p className="text-gray-700 font-medium">מתכונים משפחתיים במטבח הביתי</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center">
                  <i className="fas fa-utensils text-white text-sm"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-dark-brown">2005 - התרחבות</h4>
                  <p className="text-gray-700 font-medium">תחילת שירותי הקייטרינג המקצועיים</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-8 h-8 bg-golden rounded-full flex items-center justify-center">
                  <i className="fas fa-award text-white text-sm"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-dark-brown">2020 - הישג</h4>
                  <p className="text-gray-700 font-medium">קייטרינג מוביל באזור המרכז והשרון</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="/src/assets/images/story/family-kitchen.svg" 
              alt="מטבח משפחתי חם עם בישול מסורתי" 
              className="rounded-2xl shadow-2xl hover-lift"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-golden">25+</div>
                <div className="text-gray-600">שנות ניסיון</div>
              </div>
            </div>
            <div className="absolute -top-6 -left-6 bg-wine-red text-white p-4 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="text-2xl font-bold">10,000+</div>
                <div className="text-sm">לקוחות מרוצים</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
