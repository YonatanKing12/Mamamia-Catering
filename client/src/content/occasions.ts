/**
 * ═══════════════════════════════════════════════════════════════════════
 *  סוגי האירועים — המודול שדפי האירועים נבנים ממנו. spec 01 §4 P-08…P-16.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זהו מודול **נתונים**. אין בו קופי שיווקי, אין כותרות, אין ledes ואין
 * שאלות נפוצות — כל אלה יושבים בדף שלהם, כי הם ייחודיים לו וזה מה שמונע
 * ממנו להיות אותו דף עם עיר או מילה מוחלפת (מבחן T-1, spec 01 P-04).
 *
 * מה שכן יושב כאן הוא מה שחייב להיות זהה בכל מקום שמזכיר את האירוע:
 * המזהה, הכתובת, השם, שורת הכוונה, פורמטי ההגשה שרלוונטיים לו, החתך
 * מהתפריט שמתאים לו, ומה חוסם אותו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  השערים
 * ─────────────────────────────────────────────────────────────────────
 * שני שערים נושאים משקל, ושניהם סגורים היום:
 *
 *   **`/catering/shiva` — שער קשיח.** spec 01 P-11: הדף אינו נבנה כל עוד
 *   אין תשובת כשרות **בכתב**. כל תוצאה מתחרה בקלאסטר הזה נפתחת ב־`בד״ץ`
 *   או `למהדרין`; תנועה שמגיעה לשם נושאת כוונת כשרות ותנטוש על תג חסר,
 *   ובנייה בכל זאת מרמזת על מעמד שאין לנו. `SLOTS.kashrutByBranch`
 *   ב־`business.ts` **אינו** פותח את השער: שם יושבת תשובה כללית שנמסרה
 *   בעל־פה, ו־`business.ts` עצמו מתעד בה שני פערים פתוחים. השער נשען על
 *   `locations[branch].kashrutStatementHe` — הנוסח כלשונו, בכתב.
 *
 *   **עמדות חיות — שער `SLOTS.liveStations`.** כל טענה על בישול במקום
 *   (`/catering/fun-day`, `/pasta-bar`) חסומה עליו. הוא `null`, ולכן שני
 *   המסלולים אינם נבנים; `/catering/fun-day` חי בינתיים כעוגן `#gibush`
 *   בתוך `/catering/business` (spec 01 P-13), ואין שם תחנה נקוב בשום מקום.
 *
 * שער אינו קישוט: `isBuildable()` הוא מה שקובע אם מסלול נרשם, אם הוא
 * נכנס ל־sitemap, ואם קבוצת מודעות רצה.
 */

import { SLOTS, filled } from "@/content/business";
import { anyPrivateEventCapacity, kashrutStatementComplete } from "@/content/locations";
import type { ServiceFormat } from "@shared/lead-schema";

export type { ServiceFormat } from "@shared/lead-schema";

/* ═══════════════════ חתך התפריט ═══════════════════ */

/**
 * מדורי התפריט. spec 01 §6.2.
 *
 * `data/menus.ts` טרם נוצר; כשייווצר, הטיפוס הזה עובר לשם והמודול הזה
 * מייבא אותו. עד אז הוא מוגדר כאן פעם אחת, ולא בכל דף בנפרד.
 */
export type CourseId = "antipasti" | "pasta" | "mains" | "dessert" | "platters";

/**
 * תגית מנה שהדף דורש כדי להציג אותה.
 *
 * `dairy` דרושה ל־`/catering/dairy`, ו־spec 01 §6.2 **אינו מגדיר אותה**:
 * `Dish.dietary` מכיר `vegetarian | vegan | gluten-free-ingredients` בלבד.
 * עד ש־`menus.ts` יוסיף אותה, הסינון מחזיר אפס מנות, ולפי spec 01 §3.3
 * שורת «0» הדף עובר לרג׳יסטר התפעולי ו־`MenuSheet` אינו מרונדר. זו
 * ההתנהגות הנכונה: עדיף דף חלבי בלי רשימת מנות מאשר דף חלבי שמציג
 * מנות בשריות.
 */
export type DishTag = "dairy";

export interface MenuCut {
  /** מדורים, בסדר ההצגה. ריק ⇒ אין `MenuSheet` בדף הזה. */
  courses: readonly CourseId[];
  /** תגית חובה על כל מנה בדף. `null` ⇒ אין סינון נוסף. */
  requiresTag: DishTag | null;
}

/* ═══════════════════ שערים ═══════════════════ */

export type GateRequirement =
  /** נוסח כשרות בכתב, כלשון הבעלים, לכל שלושת הסניפים. */
  | "kashrut_statement_written"
  /** `SLOTS.liveStations` — האם מוצעת עמדה חיה ומה מגבלותיה. */
  | "live_stations"
  /** `SLOTS.sameDayCutoff` — שעת חיתום להזמנה לאותו יום. */
  | "same_day_cutoff"
  /** קיבולת אירוע פרטי בסניף אחד לפחות. */
  | "private_event_capacity";

/**
 * `hard`  — המסלול אינו נבנה ואינו נרשם עד שהדרישות מולאו.
 * `soft`  — הדף נבנה, והבלוק שתלוי בדרישה נשמט ממנו בלבד.
 * `open`  — אין תלות.
 */
export type OccasionGate =
  | { kind: "open" }
  | { kind: "hard" | "soft"; requires: readonly GateRequirement[] };

/** האם הדרישה מולאה. זו הפונקציה היחידה שיודעת מה בודקים בפועל. */
export function requirementMet(req: GateRequirement): boolean {
  switch (req) {
    case "kashrut_statement_written":
      return kashrutStatementComplete();
    case "live_stations":
      return filled(SLOTS.liveStations);
    case "same_day_cutoff":
      return filled(SLOTS.sameDayCutoff);
    case "private_event_capacity":
      return anyPrivateEventCapacity();
  }
}

/* ═══════════════════ הטיפוס ═══════════════════ */

export type OccasionId =
  | "business"
  | "private-events"
  | "bar-mitzvah"
  | "shiva"
  | "holidays"
  | "fun-day"
  | "dairy"
  | "urgent"
  | "pasta-bar";

export interface Occasion {
  id: OccasionId;
  /** הכתובת. חייבת להתאים למפתח ב־`PAGE_META` (`lib/seo.ts`). */
  route: string;
  /** שם האירוע בעברית — לניווט, לפירורי לחם ולשורות הקישור. */
  nameHe: string;
  /**
   * שורת הכוונה: מה הקונה בא לפתור. משפט אחד, תיאורי, בלי הבטחה ובלי
   * מספר. זו לא כותרת הדף ולא הלֶדֶה — אלה נכתבים בדף.
   */
  intentHe: string;
  /**
   * פורמטי ההגשה **הרלוונטיים** לאירוע. רלוונטיות אינה הצעה: פורמט
   * מרונדר רק כש־`SERVICE_FORMATS[key].offered === true`
   * (`config/service-formats.ts`, spec 02 §3.4), ו־`at_restaurant`
   * דורש בנוסף קיבולת אירוע פרטי בסניף כלשהו.
   */
  serviceFormats: readonly ServiceFormat[];
  /** החתך מהתפריט שמתאים לאירוע. */
  menu: MenuCut;
  gate: OccasionGate;
  /**
   * הערך שנזרע ל־`eventType` בבנאי בכניסה דרך הדף הזה (spec 01 P-07).
   * חייב להיות אחד מהערכים ב־`EVENT_TYPE_OPTIONS`
   * (`components/quote/quote-config.ts`) — אחרת `use-quote-builder`
   * מתעלם ממנו בשקט. `null` ⇒ אין זריעה, בכוונה.
   */
  eventTypeSeed: string | null;
  /** הערה למפתח על השער או על הדף. אינה מרונדרת לעולם. */
  note?: string;
}

/* ═══════════════════ הרשימה ═══════════════════ */

/**
 * הסדר הוא סדר ההצגה ב־`EventRows` (spec 01 P-07): עסקי ראשון, כי הוא
 * העמוד עם התדירות הגבוהה ביותר וה־LTV הגבוה ביותר.
 */
export const OCCASIONS: readonly Occasion[] = [
  {
    id: "business",
    route: "/catering/business",
    nameHe: "קייטרינג לחברות",
    intentHe: "ארוחת צוות, ישיבה או כנס — הזמנה לתאריך, עם חשבונית והזמנת רכש.",
    serviceFormats: ["delivery", "buffet_on_site"],
    menu: { courses: ["platters", "antipasti", "pasta", "dessert"], requiresTag: null },
    gate: { kind: "open" },
    eventTypeSeed: "אירוע חברה",
  },
  {
    id: "private-events",
    route: "/catering/private-events",
    nameHe: "שמחות פרטיות",
    intentHe: "אירוע משפחתי בבית או במקום שנבחר, עם תפריט שנסגר מראש.",
    serviceFormats: ["delivery", "buffet_on_site", "plated_staffed", "at_restaurant"],
    menu: { courses: ["antipasti", "pasta", "mains", "dessert"], requiresTag: null },
    /* הדף נבנה בכל מקרה; רק שורת «אירוח אצלנו במסעדה» והצ׳יפ המקביל
       בבנאי תלויים בקיבולת. spec 01 P-09. */
    gate: { kind: "soft", requires: ["private_event_capacity"] },
    eventTypeSeed: "שמחה פרטית",
    note: "at_restaurant נשמט לגמרי כשאין קיבולת — שני פורמטים, לא שלושה ריקים.",
  },
  {
    id: "bar-mitzvah",
    route: "/catering/bar-mitzvah",
    nameHe: "בר מצווה ובת מצווה",
    intentHe: "אירוע שמתוכנן חודשים מראש ונבדק מול כמה ספקים.",
    serviceFormats: ["delivery", "buffet_on_site", "plated_staffed", "at_restaurant"],
    menu: { courses: ["antipasti", "pasta", "mains", "dessert"], requiresTag: null },
    /* רך ולא קשיח: spec 01 P-10 קובע במפורש שבלי נוסח כשרות הדף מוקם
       במסגור אגנוסטי לכשרות, והווריאנטים `ברית` / `שבת חתן` / `חינה`
       מנוטרלים כמילות שלילה במקום להיות מטרה. */
    gate: { kind: "soft", requires: ["kashrut_statement_written"] },
    eventTypeSeed: "שמחה פרטית",
    note: "המילה «כשר» בכל הטיה אסורה בדף בהיעדר נוסח בכתב.",
  },
  {
    id: "shiva",
    route: "/catering/shiva",
    nameHe: "אירוח שבעה ואזכרה",
    intentHe: "אוכל לבית אבלים — אותו יום או למחרת, בלי שהמזמין יצטרך לנהל את זה.",
    serviceFormats: ["delivery"],
    menu: { courses: ["platters", "antipasti"], requiresTag: null },
    /* השער הקשיח. spec 01 P-11. */
    gate: { kind: "hard", requires: ["kashrut_statement_written"] },
    /* אין בנאי בדף הזה, ולכן אין מה לזרוע. spec 01 P-11: בלי בנאי, בלי
       הערכה, בלי טעימות, בלי אפסייל ובלי תיבת הסכמה שיווקית. */
    eventTypeSeed: null,
    note: "בלי מחירים, בלי אוצר מילים של חגיגה, ובלי og:image של אירוע.",
  },
  {
    id: "holidays",
    route: "/catering/holidays",
    nameHe: "חגים",
    intentHe: "ארוחת חג לבית, עם תאריך הזמנה אחרון ומועד איסוף או משלוח.",
    serviceFormats: ["delivery", "buffet_on_site"],
    menu: { courses: ["antipasti", "pasta", "mains", "dessert"], requiresTag: null },
    gate: { kind: "open" },
    eventTypeSeed: "אירוח משפחתי או חג",
    /* חלון החג ותאריך ההזמנה האחרון מגיעים מ־`content/seasons.ts`
       (spec 01 P-12) ואינם יושבים כאן. מחוץ לחלון פעיל הדף מציג גרסה
       ירוקת־עד ולעולם לא חג שעבר. */
    note: "seasons.ts הוא מודול נפרד; `orderByDate` הוא Slot ולא נגזר מלוח עברי בבילד.",
  },
  {
    id: "fun-day",
    route: "/catering/fun-day",
    nameHe: "ימי גיבוש וימי כיף",
    intentHe: "יום צוות מחוץ למשרד, שבו האוכל הוא חלק מהאירוע ולא רק ארוחה.",
    serviceFormats: ["delivery", "buffet_on_site"],
    menu: { courses: ["pasta", "antipasti", "dessert"], requiresTag: null },
    /* spec 01 P-13: המסלול מקודם לעצמאי רק כשיש מגבלות תפעוליות אמיתיות
       לעמדה. עד אז הוא עוגן `#gibush` בתוך `/catering/business`, ואסור
       לשחרר אותו כ־P-08 עם מילים מוחלפות — זו תבנית דלת כניסה. */
    gate: { kind: "hard", requires: ["live_stations"] },
    eventTypeSeed: "יום כיף או כנס",
    note: "בינתיים: עוגן #gibush ב־/catering/business. שם תחנה אינו נכתב בשום מקום.",
  },
  {
    id: "dairy",
    route: "/catering/dairy",
    nameHe: "קייטרינג חלבי",
    intentHe: "אירוע חלבי — קטגוריה שבה מטבח איטלקי הוא ההתאמה הטבעית.",
    /* חתך תפריט, לא סוג אירוע: אותו קונה יכול להיות חברה, שמחה או חג. */
    menu: { courses: ["antipasti", "pasta", "dessert"], requiresTag: "dairy" },
    serviceFormats: ["delivery", "buffet_on_site", "plated_staffed"],
    gate: { kind: "open" },
    /* אין זריעה: זריעת סוג אירוע כאן הייתה מתייגת ליד לא נכון, וזה כשל
       גרוע יותר מתיוג חסר (spec 02 §1.7). */
    eventTypeSeed: null,
    note: "אין טענת מחיר משווה בדף. `אותו תקציב, שולחן עשיר יותר` נדחתה בביקורת (A2).",
  },
  {
    id: "urgent",
    route: "/urgent",
    nameHe: "קייטרינג להיום",
    intentHe: "צריך אוכל היום — הקונה מחפש מי שיענה ויגיד כן או לא מיד.",
    serviceFormats: ["delivery"],
    menu: { courses: ["platters", "antipasti"], requiresTag: null },
    /* רך: spec 01 P-15 — בלי שעת חיתום הדף עולה בלי טענת קאט־אוף,
       וקבוצת המודעות פשוט אינה רצה. שעת חיתום שלא נשמרת היא כשל
       מוניטין בלי דרך חזרה, עם שמות שלוש מסעדות עליו. */
    gate: { kind: "soft", requires: ["same_day_cutoff"] },
    /* אין בנאי בדף (spec 01 P-15, גובר על 02 §1.5) — קישור טקסט ל־/quote. */
    eventTypeSeed: null,
    note: "המרה בטלפון. הקאט־אוף מוצג ב־Asia/Jerusalem בלבד (INV-9).",
  },
  {
    id: "pasta-bar",
    route: "/pasta-bar",
    nameHe: "עמדת פסטה",
    intentHe: "עמדה שמבשלים בה במקום — מוצר, לא סוג אירוע.",
    serviceFormats: ["buffet_on_site"],
    menu: { courses: ["pasta"], requiresTag: null },
    /* spec 01 P-16: הדף כולו חסום על מגבלות העמדה — טווח סועדים, חשמל,
       מים, מקום, והאם טבח נוסע. בלעדיהן אין כאן דף כן. */
    gate: { kind: "hard", requires: ["live_stations"] },
    eventTypeSeed: null,
    note: "מגבלות התחנה יושבות ב־content/stations.ts (מודול נפרד, טרם נוצר).",
  },
] as const;

/* ═══════════════════ בוררים ═══════════════════ */

const BY_ID = new Map<string, Occasion>(OCCASIONS.map((o) => [o.id, o]));
const BY_ROUTE = new Map<string, Occasion>(OCCASIONS.map((o) => [o.route, o]));

export const occasionById = (id: OccasionId): Occasion => BY_ID.get(id)!;

/** `null` לכתובת שאינה דף אירוע. */
export const occasionByRoute = (route: string): Occasion | null =>
  BY_ROUTE.get(route.replace(/\/+$/, "") || "/") ?? null;

/** הדרישות שטרם מולאו. ריק ⇒ השער פתוח. */
export function gateBlockers(o: Occasion): GateRequirement[] {
  if (o.gate.kind === "open") return [];
  return o.gate.requires.filter((r) => !requirementMet(r));
}

/**
 * האם המסלול נבנה ונרשם.
 * שער רך לעולם אינו חוסם מסלול — הוא מוריד בלוק בתוך הדף.
 */
export const isBuildable = (o: Occasion): boolean =>
  o.gate.kind !== "hard" || gateBlockers(o).length === 0;

/** המסלולים שנרשמים היום. מזין את הראוטר, את ה־sitemap ואת `EventRows`. */
export const buildableOccasions = (): Occasion[] => OCCASIONS.filter(isBuildable);

/** המסלולים החסומים, עם הסיבה — למסך הבעלים ולדוח «מה נפתח כשמוסרים מה». */
export const blockedOccasions = (): { occasion: Occasion; blockers: GateRequirement[] }[] =>
  OCCASIONS.filter((o) => !isBuildable(o)).map((o) => ({
    occasion: o,
    blockers: gateBlockers(o),
  }));

/**
 * פורמטי ההגשה שמותר להציג באירוע הזה **היום**.
 *
 * שני מסננים, ושניהם סגורים כרגע:
 *   · `at_restaurant` — קיבולת אירוע פרטי בסניף כלשהו.
 *   · `offered === true` ב־`config/service-formats.ts` — המודול טרם נוצר,
 *     וכשייווצר הסינון שלו נכנס כאן ולא בכל דף בנפרד.
 */
export function serviceFormatsFor(o: Occasion): ServiceFormat[] {
  const atRestaurantOk = anyPrivateEventCapacity();
  return o.serviceFormats.filter((f) => f !== "at_restaurant" || atRestaurantOk);
}

/** האם יש בכלל מה להציג בסקשן פורמטי ההגשה. ריק ⇒ הסקשן אינו מרונדר. */
export const hasServiceFormats = (o: Occasion): boolean => serviceFormatsFor(o).length > 0;

/* ═══════════════════ בדיקות שפויות בפיתוח ═══════════════════ */

/**
 * הזרעים חייבים להתאים לאפשרויות שהבנאי מכיר. הבדיקה רצה בפיתוח בלבד,
 * ומייבאת מ־`quote-config` כדי שלא תיווצר רשימה שנייה של אותן מחרוזות.
 *
 * למה זה חשוב מספיק לקוד ריצה: `use-quote-builder` מתעלם בשקט מזרע שאינו
 * מוכר, ולכן טעות כתיב כאן אינה נראית בשום מקום — היא רק מוחקת את
 * ההקשר שהדף התכוון לתת לליד.
 */
if (import.meta.env?.DEV) {
  void (async () => {
    const { isKnownEventType } = await import("@/components/quote/quote-config");
    for (const o of OCCASIONS) {
      if (o.eventTypeSeed && !isKnownEventType(o.eventTypeSeed, true)) {
        // eslint-disable-next-line no-console
        console.error(
          `[occasions] eventTypeSeed «${o.eventTypeSeed}» של ${o.id} אינו אפשרות מוכרת בבנאי.`,
        );
      }
    }
  })();
}
