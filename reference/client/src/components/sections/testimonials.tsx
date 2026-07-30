export const Testimonials = () => {
  const testimonials = [
    {
      text: "אירוע בר המצווה של הבן שלי היה מושלם! האוכל היה פנטסטי ושירות ברמה הכי גבוהה. כל האורחים התרשמו מאוד.",
      author: "שרה כהן",
      event: "בר מצווה - רמת השרון",
      color: "bg-golden"
    },
    {
      text: "מאמאמיה טיפלו באירוע הזכרון עם כל הרגישות והכבוד הנדרש. התמיכה המקצועית והאנושית שלהם הקלה עלינו מאוד.",
      author: "אברהם לוי",
      event: "אירוע הזכרון - כפר סבא",
      color: "bg-wine-red"
    },
    {
      text: "החתונה שלנו היתה בדיוק כמו שחלמנו! האוכל היה טעים בטירוף, השירות מעולה והצוות סופר מקצועי. תודה רבה מאמאמיה!",
      author: "דנה ויוסי מזרחי",
      event: "חתונה - הרצליה",
      color: "bg-saddle-brown"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full organic-shape bg-golden"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">מה אומרים עלינו</span>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 mt-2">הלקוחות שלנו הם השגרירים הטובים ביותר</h2>
          <p className="text-xl text-gray-800 font-medium max-w-3xl mx-auto">
            אלפי לקוחות מרוצים בחרו במאמאמיה לאירועים הכי חשובים בחייהם. הנה מה שהם אומרים עלינו.
          </p>
          <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-cream rounded-2xl p-8 shadow-xl hover-lift text-center">
              <div className="mb-6">
                <div className={`w-20 h-20 ${testimonial.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <i className="fas fa-quote-right text-white text-2xl"></i>
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-golden"></i>
                  ))}
                </div>
              </div>
              <p className="text-lg italic text-gray-800 font-medium mb-6">
                "{testimonial.text}"
              </p>
              <div className="border-t pt-4">
                <h4 className="font-bold text-dark-brown">{testimonial.author}</h4>
                <p className="text-sm text-gray-700 font-medium">{testimonial.event}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Google & Facebook Reviews Stats */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <i className="fab fa-google text-4xl text-blue-500 ml-3"></i>
                <div className="text-right">
                  <div className="text-2xl font-bold text-dark-brown">4.9/5</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-golden"></i>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">מבוסס על 247 ביקורות ב-Google</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <i className="fab fa-facebook text-4xl text-blue-600 ml-3"></i>
                <div className="text-right">
                  <div className="text-2xl font-bold text-dark-brown">4.8/5</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-golden"></i>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">מבוסס על 189 ביקורות בפייסבוק</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
