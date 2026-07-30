import { Button } from '@/components/ui/button';
import { useScroll } from '@/hooks/use-scroll';

const eventTypes = [
  {
    icon: "fas fa-glass-cheers",
    title: "שמחות משפחתיות",
    description: "מבריתות ועד חתונות, בר/בת מצווה וימי הולדת. נהפוך כל חגיגה משפחתית לחוויה קולינרית בלתי נשכחת.",
    price: "החל מ-₪120 למנה",
    color: "from-golden to-dark-golden"
  },
  {
    icon: "fas fa-briefcase",
    title: "אירועים עסקיים",
    description: "מכיבוד במשרד ועד כנסים והשקות. נדאג שהאירוע העסקי שלכם ישדר יוקרה וישאיר טעם של הצלחה.",
    price: "החל מ-₪85 למנה",
    color: "from-wine-red to-red-700"
  },
  {
    icon: "fas fa-dove",
    title: "אזכרות ואירועי זיכרון",
    description: "ברגישות, בכבוד הראוי ובמקצועיות, אנו מגישים סעודות כשרות ומנחמות לרגעים החשובים באמת.",
    price: "החל מ-₪65 למנה",
    color: "from-saddle-brown to-yellow-700"
  },
  {
    icon: "fas fa-home",
    title: "אירוח ביתי וחגים",
    description: "רוצים לארח את המשפחה בלי לעמוד שעות במטבח? הזמינו ותיהנו מארוחה ביתית מוכנה באהבה.",
    price: "החל מ-₪95 למנה",
    color: "from-green-600 to-green-700"
  }
];

export const Events = () => {
  const { scrollToSection } = useScroll();

  return (
    <section id="events" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 diagonal-section bg-gradient-to-br from-cornsilk to-cream opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-golden font-semibold text-lg tracking-wide">לכל רגע מיוחד בחיים</span>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6 mt-2">הטעמים של מאמאמיה לכל סוגי האירועים</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            אנחנו יודעים שלכל אירוע יש את הקסם והאווירה שלו. לכן נתאים לכם תפריט ביתי וכשר שיקלע בדיוק לטעם שלכם.
          </p>
          <div className="w-24 h-1 bg-golden mx-auto mt-6"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {eventTypes.map((event, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 shadow-xl hover-lift text-center group">
              <div className={`w-20 h-20 bg-gradient-to-br ${event.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <i className={`${event.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-dark-brown mb-4">{event.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {event.description}
              </p>
              <div className="mt-6">
                <span className="text-golden font-semibold">{event.price}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button
            onClick={() => scrollToSection('contact')}
            className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-lg font-semibold hover-lift shadow-lg"
          >
            יש לכם אירוע אחר? דברו איתנו ונמצא פתרון!
            <i className="fas fa-arrow-left mr-2"></i>
          </Button>
        </div>
      </div>
    </section>
  );
};
