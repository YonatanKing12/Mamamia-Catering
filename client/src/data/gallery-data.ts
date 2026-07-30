export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: string;
  title: string;
  description: string;
}

export const galleryData: GalleryItem[] = [
  {
    id: "1",
    src: "/src/assets/images/gallery/wedding1.svg",
    alt: "עיצוב מרהיב לחתונה עם שולחנות מעוטרים",
    category: "weddings",
    title: "חתונה מרהיבה",
    description: "150 אורחים במושב הדר"
  },
  {
    id: "2",
    src: "/src/assets/images/gallery/corporate1.svg",
    alt: "אירוע עסקי אלגנטי במשרדים מרכזיים",
    category: "corporate",
    title: "השקת חברה",
    description: "כיבוד עסקי מרהיב"
  },
  {
    id: "3",
    src: "/src/assets/images/gallery/family1.svg",
    alt: "חגיגה משפחתית חמה עם ילדים ומבוגרים",
    category: "family",
    title: "בר מצווה",
    description: "חגיגה משפחתית מיוחדת"
  },
  {
    id: "4",
    src: "/src/assets/images/gallery/food1.svg",
    alt: "מגש מנות עיקריות מסורתיות ומפתות",
    category: "food",
    title: "המנות שלנו",
    description: "אסאדו ברוטב יין אדום"
  },
  {
    id: "5",
    src: "/src/assets/images/placeholder.svg",
    alt: "מטבח מקצועי עם שפים מכינים מנות",
    category: "food",
    title: "מאחורי הקלעים",
    description: "הכנה עם אהבה"
  },
  {
    id: "6",
    src: "/src/assets/images/gallery/wedding1.svg",
    alt: "שולחן חתונה מעוצב בסגנון רומנטי",
    category: "weddings",
    title: "חתונת גן",
    description: "רומנטית ואינטימית"
  }
];

export const galleryCategories = [
  { id: "all", name: "הכל" },
  { id: "weddings", name: "חתונות" },
  { id: "corporate", name: "אירועים עסקיים" },
  { id: "family", name: "אירועים משפחתיים" },
  { id: "food", name: "המנות שלנו" }
];
