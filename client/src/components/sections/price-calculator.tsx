import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useScroll } from '@/hooks/use-scroll';

interface PriceResult {
  total: number;
  breakdown: {
    base: number;
    guests: number;
    multiplier: number;
    extras: number;
    weekendSurcharge: number;
  };
}

export const PriceCalculator = () => {
  const [eventType, setEventType] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [menuLevel, setMenuLevel] = useState('basic');
  const [eventDate, setEventDate] = useState('');
  const [extraServices, setExtraServices] = useState<string[]>([]);
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const { scrollToSection } = useScroll();

  const eventPrices: Record<string, number> = {
    wedding: 120,
    'bar-mitzvah': 110,
    corporate: 85,
    memorial: 65,
    birthday: 95,
    holiday: 100
  };

  const menuMultipliers: Record<string, number> = {
    basic: 1,
    premium: 1.3,
    luxury: 1.6
  };

  const servicesPrices: Record<string, number> = {
    waiters: 500,
    decoration: 300,
    delivery: 200
  };

  const calculatePrice = () => {
    if (!eventType || !guestCount) {
      alert('אנא בחרו סוג אירוע והזינו מספר אורחים');
      return;
    }

    const basePrice = eventPrices[eventType] || 0;
    const guests = parseInt(guestCount) || 0;
    const multiplier = menuMultipliers[menuLevel] || 1;

    let total = Math.round(basePrice * guests * multiplier);
    const baseTotal = total;

    // Add extra services
    const extrasTotal = extraServices.reduce((sum, service) => {
      return sum + (servicesPrices[service] || 0);
    }, 0);
    total += extrasTotal;

    // Weekend surcharge
    let weekendSurcharge = 0;
    if (eventDate) {
      const date = new Date(eventDate);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
        weekendSurcharge = Math.round(total * 0.15);
        total += weekendSurcharge;
      }
    }

    setPriceResult({
      total,
      breakdown: {
        base: basePrice,
        guests,
        multiplier,
        extras: extrasTotal,
        weekendSurcharge
      }
    });
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setExtraServices(prev => [...prev, service]);
    } else {
      setExtraServices(prev => prev.filter(s => s !== service));
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-dark-brown to-saddle-brown text-white relative">
      <div className="absolute inset-0 diagonal-section bg-gradient-to-br from-golden to-dark-golden opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-cornsilk font-semibold text-lg tracking-wide">מחשבון מחיר</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 mt-2">חשבו את עלות האירוע שלכם</h2>
          <p className="text-xl text-gray-200 font-medium max-w-3xl mx-auto">
            קבלו הערכת מחיר מדויקת לאירוע שלכם תוך דקות ספורות. המחירים כוללים את כל השירותים הנלווים.
          </p>
          <div className="w-24 h-1 bg-cornsilk mx-auto mt-6"></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 glass-effect rounded-3xl p-8 md:p-12">
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <Label className="block text-lg font-semibold mb-3">סוג האירוע</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="w-full p-4 rounded-xl bg-white text-dark-brown font-medium">
                      <SelectValue placeholder="בחרו סוג אירוע" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">חתונה</SelectItem>
                      <SelectItem value="bar-mitzvah">בר/בת מצווה</SelectItem>
                      <SelectItem value="corporate">אירוע עסקי</SelectItem>
                      <SelectItem value="memorial">אירוע הזכרון</SelectItem>
                      <SelectItem value="birthday">יום הולדת</SelectItem>
                      <SelectItem value="holiday">חג ומועד</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-lg font-semibold mb-3">מספר אורחים</Label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    placeholder="50"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white text-dark-brown font-medium"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label className="block text-lg font-semibold mb-3">רמת התפריט</Label>
                  <Select value={menuLevel} onValueChange={setMenuLevel}>
                    <SelectTrigger className="w-full p-4 rounded-xl bg-white text-dark-brown font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">בסיסי</SelectItem>
                      <SelectItem value="premium">פרמיום</SelectItem>
                      <SelectItem value="luxury">יוקרה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-lg font-semibold mb-3">שירותים נוספים</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="waiters"
                        checked={extraServices.includes('waiters')}
                        onCheckedChange={(checked) => handleServiceChange('waiters', checked as boolean)}
                      />
                      <Label htmlFor="waiters" className="text-white">מלצרים (₪500)</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="decoration"
                        checked={extraServices.includes('decoration')}
                        onCheckedChange={(checked) => handleServiceChange('decoration', checked as boolean)}
                      />
                      <Label htmlFor="decoration" className="text-white">עיצוב שולחנות (₪300)</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="delivery"
                        checked={extraServices.includes('delivery')}
                        onCheckedChange={(checked) => handleServiceChange('delivery', checked as boolean)}
                      />
                      <Label htmlFor="delivery" className="text-white">משלוח מחוץ לאזור (₪200)</Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-lg font-semibold mb-3">תאריך האירוע</Label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white text-dark-brown font-medium"
                  />
                  <p className="text-sm text-gray-200 font-medium mt-2">אירועי סוף שבוע עם תוספת 15%</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={calculatePrice}
                  className="bg-golden hover:bg-dark-golden text-white px-8 py-4 rounded-full text-xl font-semibold hover-lift shadow-lg"
                >
                  <i className="fas fa-calculator ml-2"></i>
                  חשבו את המחיר
                </Button>
              </div>
              
              {priceResult && (
                <div className="bg-cornsilk text-dark-brown p-8 rounded-2xl text-center">
                  <h3 className="text-2xl font-bold mb-4">הערכת מחיר לאירוע שלכם</h3>
                  <div className="text-4xl font-bold text-golden mb-2">₪{priceResult.total.toLocaleString()}</div>
                  <p className="text-lg mb-6">המחיר כולל את כל המנות והשירותים שבחרתם</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => scrollToSection('contact')}
                      className="bg-golden hover:bg-dark-golden text-white px-6 py-3 rounded-full font-semibold"
                    >
                      הזמינו עכשיו
                    </Button>
                    <Button
                      asChild
                      className="bg-wine-red hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold"
                    >
                      <a href="tel:052-1234567">
                        <i className="fas fa-phone ml-2"></i>
                        התקשרו לייעוץ
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
