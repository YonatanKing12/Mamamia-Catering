export interface MenuItem {
  name: string;
  description: string;
  price?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    id: "main-dishes",
    name: "מנות עיקריות",
    description: "תבשילים ביתיים עשירים בטעם ונוסטלגיה",
    icon: "fas fa-drumstick-bite",
    color: "from-golden to-dark-golden",
    items: [
      { name: "סלמון אפוי", description: "פילה סלמון עסיסי בתיבול עדין, אפוי בתנור עד שלמות", price: 48 },
      { name: "דג ברוטב", description: "דג טרי ברוטב עגבניות, עשבי תיבול ותיבול ים-תיכוני", price: 42 },
      { name: "דג ברוטב גולש", description: "דג עסיסי ברוטב פפריקה, פלפלים ועשבי תיבול בסגנון הונגרי", price: 45 },
      { name: "מוקפץ עוף", description: "נתחי עוף מוקפצים עם ירקות טריים ברוטב אסייתי מתקתק", price: 38 },
      { name: "עוף ממולא", description: "עוף שלם ממולא באורז, עשבי תיבול ופירות יבשים, אפוי באהבה", price: 52 },
      { name: "חזה עוף ממולא", description: "חזה עוף רך במילוי ירקות, עשבי תיבול ותיבול עדין", price: 42 },
      { name: "תבשיל חזה עוף", description: "נתחי חזה עוף בבישול איטי עם ירקות שורש ורוטב עשיר", price: 40 },
      { name: "פלפלים ממולאים", description: "פלפלים צבעוניים במילוי אורז, בשר ועשבי תיבול, ברוטב עגבניות", price: 35 },
      { name: "צלי בקר", description: "נתחי בקר רכים בבישול ארוך עם ירקות שורש ורוטב עשיר", price: 55 },
      { name: "צ׳ילי קון קרנה", description: "תבשיל בשר בקר, שעועית וירקות ברוטב עגבניות פיקנטי", price: 42 },
      { name: "קציצות עוף", description: "קציצות עוף רכות ברוטב עגבניות או ירק, כמו של סבתא", price: 32 },
      { name: "קציצות בקר", description: "קציצות בקר רכות, מתובלות היטב, ברוטב עשיר", price: 38 }
    ]
  },
  {
    id: "side-dishes",
    name: "תוספות וסלטים",
    description: "תוספות עשירות שמשלימות כל ארוחה",
    icon: "fas fa-leaf",
    color: "from-wine-red to-red-700",
    items: [
      { name: "2 סוגי אורז", description: "אורז לבן ואורז צהוב, אוורירים, מתובלים בעדינות" },
      { name: "אנטיפסטי", description: "ירקות שורש קלויים בתנור עם שמן זית ועשבי תיבול" },
      { name: "שורת ירקות", description: "מבחר ירקות טריים, מאודים או קלויים, צבעוניים ומרעננים" },
      { name: "כוסמת", description: "כוסמת מבושלת עם בצל, תיבול עדין וטעם של בית" },
      { name: "פירה", description: "פירה תפוחי אדמה חלק, קרמי ומנחם, עם נגיעת חמאה" },
      { name: "קוסקוס ירקות", description: "קוסקוס מסורתי עם ירקות שורש ברוטב עשיר" },
      { name: "פריקה", description: "גרגרי חיטה ירוקה קלויים, מבושלים עם בצל ותיבול עדין" },
      { name: "ספגטי", description: "אטריות ספגטי מבושלות, מוגשות עם שמן זית או רוטב עגבניות" },
      { name: "קינואה", description: "קינואה מבושלת עם ירק, קלה, בריאה ומרעננת" }
    ]
  },
  {
    id: "desserts",
    name: "קינוחים וממתקים",
    description: "סיום מתוק לכל ארוחה עם קינוחים ביתיים",
    icon: "fas fa-birthday-cake",
    color: "from-saddle-brown to-yellow-700",
    items: [
      { name: "מלבי ביתי", description: "מלבי ביתי עם פירות העונה", price: 18 },
      { name: "עוגת שוקולד חמה", description: "עוגת שוקולד חמה עם גלידה", price: 22 },
      { name: "תפוח אפוי", description: "תפוח אפוי עם קרם וניל", price: 16 },
      { name: "טירמיסו איטלקי", description: "טירמיסו איטלקי מקורי", price: 20 },
      { name: "פאר ביתי", description: "פאר ביתי עם פירות יער", price: 19 },
      { name: "מוז ושוקולד", description: "מוז ושוקולד בכוסות", price: 15 }
    ]
  }
];
