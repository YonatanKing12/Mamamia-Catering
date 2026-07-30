/**
 * ═══════════════════════════════════════════════════════════════════════
 *  עובדות העסק — מקור אמת יחיד.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * החוק שמחזיק את הקובץ הזה, ואת האתר כולו:
 *
 *   עובדה עסקית שאינה כאן, ואינה מסומנת כמאומתת — אינה קיימת.
 *   קומפוננטה שנתקלת ב־null משמיטה את מה שהיא הייתה מציגה. לעולם
 *   לא ממציאה ברירת מחדל סבירה, ולא מציגה טקסט ממלא מקום ללקוח.
 *
 * הסיבה איננה קפדנות לשמה. מינימום סועדים, טווח מחיר, תעודת כשרות ואזור
 * חלוקה הם התחייבויות מסחריות. מספר שנראה סביר ואינו נכון הוא הטעיית
 * צרכן, והוא גם הדרך המהירה ביותר לשרוף אמון של לקוח שיגלה.
 *
 * הגרסה שנוצרה ברפליט הדגימה בדיוק את זה: תג "כשר בד״ץ" קבוע בקוד,
 * המלצות בשמות אנשים שלא קיימים, ותעריפי מחשבון שהומצאו.
 *
 * הרשימה המלאה של מה שחסר: docs/spec/00-owner-content-slots.md
 */

/** ערך שטרם סופק. `null` הוא המצב התקין, לא באג. */
export type Slot<T> = T | null;

/** שער טיפוסים: מצמצם Slot<T> ל־T ומאפשר תנאי רינדור בטוח. */
export const filled = <T,>(v: Slot<T>): v is T =>
  v !== null && v !== undefined && v !== "";

/* ═══════════════════ מאומת ═══════════════════ */

/**
 * טלפון ווואטסאפ ליעד הלידים.
 * מקור: הלקוח, בשיחה. 30 ביולי 2026.
 */
export const PHONE = {
  /** להצגה בעברית, RTL־בטוח */
  display: "054-784-2680",
  /** ל־href="tel:" */
  tel: "+972547842680",
  /** ל־wa.me — בלי + ובלי מפרידים */
  wa: "972547842680",
} as const;

/** שלושת הסניפים. השמות מאומתים; הפרטים התפעוליים אינם. */
export const BRANCHES = [
  { id: "herzliya_pituach", name: "הרצליה פיתוח", isFlagship: true },
  { id: "raanana", name: "רעננה", isFlagship: false },
  { id: "petah_tikva", name: "פתח תקווה", isFlagship: false },
] as const;

export type BranchId = (typeof BRANCHES)[number]["id"];

/* ═══════════════════ טרם סופק ═══════════════════ */

/**
 * כל שדה כאן הוא `null` עד שהלקוח מוסר אותו.
 * כשממלאים — למחוק את הערת ה־TODO ולציין מקור ותאריך, כמו ב־PHONE.
 */
export const SLOTS = {
  /**
   * חוסם אסטרטגיה. התשובה קובעת אם דפי שבעה, אזכרה, ברית ובר מצווה
   * ניתנים לבנייה בכלל, או שיש להוציא את אשכול החיפוש הזה מהקמפיינים.
   * ערך אפשרי: הנוסח המדויק כפי שהלקוח כתב אותו, לכל סניף בנפרד.
   * TODO(owner): מצב כשרות לכל סניף — גוף מכשיר, או הצהרה מפורשת שאין.
   */
  kashrutByBranch: null as Slot<Record<BranchId, string>>,

  /** TODO(owner): כתובת מדויקת לכל סניף */
  addresses: null as Slot<Record<BranchId, string>>,

  /** TODO(owner): שעות פעילות לכל סניף */
  openingHours: null as Slot<Record<BranchId, string>>,

  /** TODO(owner): ערים שכל מטבח משרת בפועל. לא לנחש לפי מרחק. */
  servesAreas: null as Slot<Record<BranchId, string[]>>,

  /** TODO(owner): מינימום סועדים. התחייבות מסחרית — לא להעתיק ממתחרה. */
  minGuests: null as Slot<number>,

  /** TODO(owner): מקסימום סועדים שהמטבחים מייצרים ליום */
  maxGuests: null as Slot<number>,

  /** TODO(owner): זמן התראה מינימלי להזמנה */
  leadTime: null as Slot<string>,

  /** TODO(owner): שעת חיתום להזמנה לאותו יום. כל דף /urgent תלוי בזה. */
  sameDayCutoff: null as Slot<string>,

  /**
   * TODO(owner): מחיר פתיחה לסועד לכל פורמט, ומה בדיוק כלול.
   * כל עוד `null` — מחשבון ההצעה לא מציג שום מספר. זה מכוון:
   * הערכה שגויה מעגנת כל שיחת מכירה במספר הלא נכון.
   */
  pricePerPerson: null as Slot<Record<string, { from: number; to: number }>>,

  /** TODO(owner): מה כלול ומה לא במחיר הפתיחה, כולל מע״מ */
  priceIncludes: null as Slot<string[]>,
  priceExcludes: null as Slot<string[]>,

  /** TODO(owner): מקדמה, תנאי תשלום, ומדיניות ביטול */
  paymentTerms: null as Slot<string>,

  /** TODO(owner): עד מתי משנים מספר סועדים */
  headcountDeadline: null as Slot<string>,

  /** TODO(owner): זמן תגובה מחויב, ובאילו שעות מאויש */
  responseTime: null as Slot<string>,
  staffedHours: null as Slot<string>,

  /** TODO(owner): שנת הקמה. רק אם מתועד — אחרת משמיטים לגמרי. */
  foundedYear: null as Slot<number>,

  /** TODO(owner): שמות ותפקידי השפים בכל סניף */
  chefs: null as Slot<Record<BranchId, string>>,

  /** TODO(owner): הסיפור בגוף ראשון, כלשונו */
  ownerStory: null as Slot<string>,

  /** TODO(owner): מדיניות טעימות — בתיאום או ללא, בתשלום או לא, ובאילו סניפים */
  tastingPolicy: null as Slot<string>,

  /** TODO(owner): האם מוצעת עמדה חיה, ומה המגבלות התפעוליות */
  liveStations: null as Slot<string>,

  /** TODO(owner): שם משפטי ומספר ח.פ. — נדרש לתקנון ולרכש מוסדי */
  legalName: null as Slot<string>,
  companyId: null as Slot<string>,

  /** TODO(owner): מייל מנוטר בפועל לפניות פרטיות */
  privacyEmail: null as Slot<string>,

  /** TODO(owner): תקופת שמירה לליד שלא הבשיל. מזין את משימת המחיקה. */
  leadRetentionMonths: null as Slot<number>,
} as const;

/* ═══════════════════ קישורי יצירת קשר ═══════════════════ */

/**
 * בונה קישור wa.me עם הודעה ממולאת מראש.
 * כל קישור וואטסאפ באתר עובר דרך כאן — אין מספר קשיח בשום קומפוננטה.
 */
export function waLink(message: string): string {
  return `https://wa.me/${PHONE.wa}?text=${encodeURIComponent(message)}`;
}

export const telLink = () => `tel:${PHONE.tel}`;
