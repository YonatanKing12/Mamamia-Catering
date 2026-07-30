/**
 * ═══════════════════════════════════════════════════════════════════════
 *  מניפסט המסלולים — מקור אמת יחיד לדפדפן ולשרת כאחד.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 01 INV-8 ("שום מסלול אינו עולה בלי רשומה ב־`shared/routes.ts`"),
 * ‎§1 (מדיניות ה־slug), §2 (מלאי העמודים), §5.1 (שכבת ה־head).
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הפגם שהקובץ הזה קיים כדי לסגור
 * ─────────────────────────────────────────────────────────────────────
 * ‎`server/vite.ts` מסתיים ב־`app.use("*")` שמחזיר את `index.html` עם
 * ‎`status 200` — בשני הענפים, גם בפיתוח וגם בייצור. כלומר `/no-such-page`
 * עונה 200, ומנוע חיפוש מאנדקס אותו כדף אמיתי (soft 404). בלי רשימת
 * מסלולים שהשרת יכול לייבא, התיקון היחיד היה לשכפל את הרשימה בצד השרת —
 * וכל רשימה שנייה נפרדת מהראשונה תוך שבועיים.
 *
 * ‎`httpStatusFor(pathname)` הוא בדיוק מה שהשרת צריך: 200 למסלול שמוגש,
 * ‎404 לכל השאר — כולל `/kitchens/{משהו}` שאינו אחד משלושת הסניפים,
 * וכולל מסלול קיים שהשער שלו סגור.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  שלושה כללים שמחזיקים את הקובץ
 * ─────────────────────────────────────────────────────────────────────
 *  1. **אפס תלויות.** אין `import` בקובץ הזה, ולא יהיה.
 *
 *     ‎**השרת כן יכול לייבא אותו**, ובאליאס: `import { httpStatusFor }
 *     from "@shared/routes"`. נבדק — `esbuild server/index.ts` פותר את
 *     ‎`paths` מ־`tsconfig.json` ומטמיע את המודול בבאנדל, בדיוק כפי שהוא
 *     כבר עושה ל־`@shared/lead-schema` ב־`server/routes.ts`. אין צורך
 *     בנתיב יחסי ואין צורך בדגל `--alias`.
 *
 *     האיסור על `import` כאן אינו בגלל הרזולוציה אלא בגלל הכיוון: הקובץ
 *     נטען גם בדפדפן, ולכן אסור שייגרר אליו `drizzle`, `zod` או כל דבר
 *     שרתי דרך שרשרת ייבוא (spec 00-spec-review D3). `@/content/…` אסור
 *     מאותה סיבה בכיוון ההפוך — הוא היה הופך את מודול המסלולים לתלוי
 *     בשכבת התוכן, בזמן שכל השאר אמור לתלות בו.
 *  2. **אין כאן קופי.** לא כותרת, לא תיאור, לא תווית פירור לחם. הקופי
 *     יושב ב־`client/src/lib/seo.ts`, וההכוונה היא ש־`seo.ts` יצרוך את
 *     הקובץ הזה — לא להפך. שום שדה כאן אינו נגזר מ־`PAGE_META`.
 *  3. **אין כאן עובדה עסקית.** אין כתובת, אין שעה, אין מחיר, אין אזור
 *     שירות. `CITY_SLUGS` היא **טבלת איות** של שמות מקומות בלטינית
 *     (spec 01 §1 ממקם אותה כאן במפורש) ואינה הצהרה שאנחנו משרתים ישוב
 *     כלשהו: `/areas/:city` מושבת, `values` שלו ריק, ולכן אף כתובת
 *     ‎`/areas/…` אינה נפתרת היום.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה `enabled` אומר, ומה הוא לא אומר
 * ─────────────────────────────────────────────────────────────────────
 * ‎`enabled === true` ⇒ **המסלול מוגש היום**: הראוטר רושם אותו, השרת
 * מחזיר עליו 200, והוא נכנס ל־sitemap אם הוא אינדקסבילי.
 *
 * ‎`enabled === false` ⇒ שער סגור לפי עמודת ה־Gate ב־spec 01 §2 —
 * «עובדות בעלים שבלעדיהן הדף אינו נבנה כלל». `blockedBy` נוקב במה חסר.
 * מסלול חסום מחזיר 404, ואינו מופיע ב־sitemap, בניווט או ב־sitelinks.
 *
 * מצב השערים היום נקבע מול המשבצות בפועל (`content/business.ts`,
 * ‎`content/locations.ts`, `content/dishes.ts`) ולא מניחוש. הוא ישתנה
 * ברגע שהבעלים ימסור עובדה — ואז הופכים `enabled` כאן, **באותו שינוי**
 * שבו נרשם המסלול בראוטר. הרשומה כאן והשורה ב־`App.tsx` נעות יחד;
 * מסלול שמופעל כאן ואין לו קובץ עמוד יחזיר 200 עם מעטפת ה־404, וזה
 * בדיוק ה־soft 404 שהקובץ הזה נועד למנוע.
 *
 * הנימוק לצד שאליו נוטים בספק: להפעיל מסלול שעמודו טרם נחת עולה
 * ‎soft 404 זמני על דף `noindex`; להשבית מסלול שעמודו חי עולה 404 קשיח
 * על מסלול המרה. לכן `enabled` נשאר `true` בכל מקום שבו שער spec §2
 * פתוח, גם כשהעמוד עוד לא נכתב.
 */

/* ═══════════════════ טיפוסים ═══════════════════ */

/** מזהה הדף בטבלת spec 01 §2. מזין גם את שם קובץ ה־og (`/og/{id}.jpg`). */
export type RouteId =
  | "P-01" | "P-02" | "P-03" | "P-04" | "P-05" | "P-06" | "P-07" | "P-08"
  | "P-09" | "P-10" | "P-11" | "P-12" | "P-13" | "P-14" | "P-15" | "P-16"
  | "P-17" | "P-18" | "P-19" | "P-20" | "P-21" | "P-22" | "P-23" | "P-24"
  | "P-25" | "P-26" | "P-27";

/**
 * הרג׳יסטר של הדף. spec 01 §2 מכיר `menu` ו־`operational`;
 * ‎`utility` נוסף כאן לדפים שאינם שיווקיים כלל (אישור, משפטי, ניהול, 404)
 * ואינם מרכיבים את השדרה של §3.1 — בטבלת §2 העמודה שלהם ריקה («—»).
 */
export type Register = "menu" | "operational" | "utility";

/** פס ה־CTA הנייד. spec 01 §5.3. `none` ⇒ הפס אינו מרונדר. */
export type StickyBar = "quote" | "phone" | "none";

/** מצב ה־CTA הראשי בגוף הדף. spec 00-spec-review §66 מחייב שדה מפורש. */
export type CtaMode = "quote" | "phone";

/**
 * עובדת בעלים חסרה שחוסמת מסלול. המזהים תואמים ל־`GateRequirement`
 * ב־`client/src/content/occasions.ts`, ומורחבים בשערים שאינם של אירוע.
 * הקובץ הזה **אינו** בודק אותן בעצמו — אין לו גישה למשבצות, וגם לא צריכה
 * להיות לו. הוא מתעד איזו עובדה חסרה, כדי שדוח «מה נפתח כשמוסרים מה»
 * ייגזר מכאן ולא ייכתב ביד.
 */
export type GateRequirementId =
  /** ‎`SLOTS.addresses` — כתובת מדויקת לכל סניף. */
  | "branch_addresses"
  /** ‎`SLOTS.openingHours` — שעות פעילות לכל סניף. */
  | "branch_hours"
  /** ‎`CATERING_DISHES` — לפחות מנה אחת שזמינה לקייטרינג. */
  | "catering_dishes"
  /** ‎`CATERING_KASHRUT_STATEMENT` — נוסח כשרות **בכתב** למערך הקייטרינג. */
  | "kashrut_statement_written"
  /** ‎`SLOTS.liveStations` — האם מוצעת עמדה חיה ומה מגבלותיה. */
  | "live_stations"
  /** ‎`SLOTS.servesAreas` + זמן נסיעה ומינימום לאזור — הבסיס היחיד לדף אזור. */
  | "area_facts"
  /** קופי קמפיין חתום. אין קמפיין ⇒ אין דף נחיתה. */
  | "campaign_copy"
  /*
   * שני המזהים הבאים הם שערים **רכים** בלבד (`content/occasions.ts`): הם
   * משמיטים בלוק בתוך דף ואינם חוסמים מסלול, ולכן אינם מופיעים באף
   * `blockedBy` היום. הם נמנים כאן כדי שהאיחוד הזה יהיה מכיל־ממש את
   * ‎`GateRequirement` שב־occasions.ts — אחרת ההצהרה «המזהים תואמים»
   * שלמעלה אינה נכונה, ודוח «מה נפתח כשמוסרים מה» לא יוכל למפות את שניהם.
   */
  /** ‎`SLOTS.sameDayCutoff` — שעת חיתום להזמנה לאותו יום. שער רך של `/urgent`. */
  | "same_day_cutoff"
  /** קיבולת אירוע פרטי במסעדה. שער רך של `/catering/private-events`. */
  | "private_event_capacity";

/**
 * הסגמנט הדינמי של מסלול פרמטרי.
 *
 * ‎`values` הוא ה־`enumerate()` של spec 01 §5.1: הערכים הקונקרטיים
 * היחידים שנחשבים מסלול אמיתי, וגם מה שמרחיב את המסלול ל־sitemap.
 * ערך שאינו ברשימה ⇒ אין התאמה ⇒ 404. זה מה שמונע מ־`/kitchens/:slug`
 * לענות 200 על `/kitchens/anything`.
 *
 * ‎`open: true` ⇒ כל ערך בצורת slug מתקבל (רק `/lp/:campaign`, שמזהי
 * הקמפיינים שלו נולדים מחוץ למאגר). מסלול `open` **לעולם אינו** נכנס
 * ל־sitemap, כי אין דבר כזה «כל הערכים».
 */
export type RouteParam = {
  name: string;
  values: readonly string[];
  open?: boolean;
  /**
   * מזהה דף לכל ערך. spec 01 §2 מונה שלושה מזהים נפרדים לשלושת הסניפים
   * (P-04…P-06) — הם מסלול אחד בראוטר ושלוש ישויות ב־SEO, ולכל אחת
   * ‎`og:image` משלה.
   */
  idByValue?: Readonly<Record<string, RouteId>>;
};

export type RouteDef = {
  id: RouteId;
  /** תבנית wouter. סגמנט דינמי מסומן ב־`:`. */
  path: string;
  register: Register;
  stickyBar: StickyBar;
  ctaMode: CtaMode;
  /**
   * האם `QuoteBuilder` מרונדר בדף. spec 00-spec-review §66: הנוסחה
   * ‎`stickyBar !== 'phone'` שב־01 §3.1 מכניסה בנאי ל־`/thanks`,
   * ‎`/privacy` ו־`/404`. השדה מפורש, ולא נגזר.
   */
  hasBuilder: boolean;
  /** `index,follow` מול `noindex`. spec 01 §2, §5.1. */
  indexable: boolean;
  /** נכנס ל־`sitemap.xml`. `indexable === false` ⇒ תמיד `false`. */
  inSitemap: boolean;
  /** האם המסלול מוגש היום. ראו הפתיח. */
  enabled: boolean;
  /** מה חסר. ריק ⇔ `enabled === true`. */
  blockedBy: readonly GateRequirementId[];
  /**
   * spec 01 §5.8 — `T-2` ו־`T-6` הן אזהרות עד שהדף מסומן, וחוסמות אחריו.
   * אדם הופך את זה, אחרי שעובדות הבעלים של הדף נחתו.
   */
  launchReady: boolean;
  /** הסגמנט הדינמי, אם יש. */
  param?: RouteParam;
  /** הערה למפתח. אינה מרונדרת לעולם. */
  note?: string;
};

/* ═══════════════════ טבלת האיות ═══════════════════ */

/**
 * spec 01 §1: «טבלת התעתיק קבועה ויושבת ב־`shared/routes.ts`, כדי שאיש
 * לא ירומן עיר מחדש בעמוד תשע». זו **טבלת איות בלבד**. הופעת ישוב כאן
 * אינה אומרת שאנחנו משרתים אותו — `SLOTS.servesAreas` הוא `null`,
 * ו־`/areas/:city` מושבת.
 */
export const CITY_SLUGS = [
  "herzliya-pituach",
  "raanana",
  "petah-tikva",
  "kfar-saba",
  "hod-hasharon",
  "ramat-hasharon",
  "tel-aviv",
] as const;

export type CitySlug = (typeof CITY_SLUGS)[number];

/**
 * ה־slugs של שלושת הסניפים, בסדר spec 01 §2 (P-04…P-06).
 *
 * הם נכתבים כאן ולא מיובאים מ־`content/business.ts` משתי סיבות: הקובץ
 * הזה חייב להישאר חסר תלויות, ובמיוחד אינו רשאי לתלות בשכבת התוכן של
 * הלקוח (כלל 1 בפתיח), ו־slug הוא **איות בכתובת**, לא עובדה עסקית.
 * הגזירה `herzliya_pituach → herzliya-pituach`
 * חיה בשני מקומות נוספים (`lib/seo.ts#branchSlug`, `content/locations.ts#branchSlug`);
 * שלושתם חייבים להסכים, ובדיקה שמשווה ביניהם היא המשך העבודה שנרשם בדוח.
 */
export const BRANCH_SLUGS = ["herzliya-pituach", "raanana", "petah-tikva"] as const;

export type BranchSlug = (typeof BRANCH_SLUGS)[number];

/* ═══════════════════ המסלולים ═══════════════════ */

/**
 * כל 27 המסלולים של spec 01 §2, בסדר המזהים.
 *
 * מצב השערים נבדק מול העץ בפועל היום:
 *   · `DISHES` ריק ⇒ `catering_dishes` סגור ⇒ `/menus` חסום.
 *   · `SLOTS.addresses` ו־`SLOTS.openingHours` הם `null` ⇒ `/kitchens`
 *     ושלושת דפי הסניף חסומים.
 *   · `locations[*].kashrutStatementHe` הוא `null` ⇒ השער הקשיח של
 *     `/catering/shiva` סגור. `SLOTS.kashrutByBranch` **אינו** פותח אותו:
 *     שם יושבת תשובה שנמסרה בעל־פה, והשער דורש נוסח בכתב.
 *   · `SLOTS.liveStations` הוא `null` ⇒ `/catering/fun-day` ו־`/pasta-bar`
 *     חסומים.
 *   · `SLOTS.servesAreas` הוא `null` ⇒ `/areas/:city` חסום, בלי ערכים.
 *
 * שער **רך** אינו חוסם מסלול — הוא מוריד בלוק בתוך הדף. לכן
 * `/catering/private-events` (קיבולת), `/catering/bar-mitzvah` (כשרות)
 * ו־`/urgent` (שעת חיתום) מופעלים, בדיוק כפי ש־`isBuildable()`
 * ב־`content/occasions.ts` פוסק.
 */
export const ROUTES: readonly RouteDef[] = [
  {
    id: "P-01",
    path: "/",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "שער §2 דורש ≥4 מנות, אך §3.3 מגדיר נפילה אחורה לאפס מנות — ולכן פתוח.",
  },
  {
    id: "P-02",
    path: "/menus",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: false,
    blockedBy: ["catering_dishes"],
    launchReady: false,
    note: "דף תפריטים בלי מנה אחת הוא דף ריק. אין נפילה אחורה כמו ב־P-01.",
  },
  {
    /*
     * ‏`/kitchen` — יחיד, ולא `/kitchens`.
     *
     * המפרט תיאר מפרק מטבחים ושלושה דפי סניף תחת ההנחה שהקייטרינג יוצא
     * משלושה מטבחים. ההנחה שגויה (`content/business.ts`, המיצוב, 30 ביולי
     * 2026): הוא מבושל במטבח של **אחת** מהמסעדות. `pages/kitchen.tsx` ו־
     * ‏`lib/page-meta-extra.ts` כבר עברו למודל הזה ומתייחסים ל־`/kitchen`;
     * הרשומה כאן הייתה הדבר האחרון שנשאר על הנתיב הישן, ובמצב הזה פתיחת
     * השער הייתה מגישה את `/kitchens` לדף שממען את עצמו `/kitchen`.
     *
     * ‏`enabled: true` ו־`blockedBy: []`: השער הישן דרש כתובת ושעות לכל
     * סניף, והוא היה שער של מודל שנמחק. הדף היחיד שבא במקומו עומד על
     * עובדה שנמסרה — «מבושל במטבח של מסעדה פעילה» — ובנוי להיראות גמור
     * כשכל המשבצות ריקות (`anyRestaurantDetail()` שקרי ⇒ בלוק הפרטים
     * אינו נבנה כלל). זה בדיוק המבחן של INV-2, והוא עובר אותו.
     */
    id: "P-03",
    path: "/kitchen",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
  },
  {
    /*
     * מסלול אחד בראוטר, שלוש ישויות ב־SEO. המזהה לכל סניף ב־`idByValue`.
     *
     * ‏**מוחלף ולא נפתח.** שלושת דפי הסניף היו המודל שנמחק יחד עם `/kitchens`
     * (ראו P-03); אין להם קובץ עמוד ולא יהיה, ו־`page-meta-extra.ts`
     * מוחק את ארבעת הנתיבים ב־`SUPERSEDED_PATHS`. הרשומה נשארת `enabled:
     * false` כדי ש־`httpStatusFor` יחזיר 404 על `/kitchens/…` שכבר קושר
     * מבחוץ, ואינה ממתינה לעובדה — הפיכת השער כאן תגיש 200 עם מעטפת 404.
     */
    id: "P-04",
    path: "/kitchens/:slug",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: false,
    blockedBy: ["branch_addresses", "branch_hours"],
    launchReady: false,
    param: {
      name: "slug",
      values: BRANCH_SLUGS,
      idByValue: {
        "herzliya-pituach": "P-04",
        raanana: "P-05",
        "petah-tikva": "P-06",
      },
    },
  },
  {
    id: "P-07",
    path: "/catering",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "מרכז ניווט. §2: אין שער — הוא אינו מוסיף עובדה חדשה.",
  },
  {
    id: "P-08",
    path: "/catering/business",
    register: "operational",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "מארח את עוגן #gibush כל עוד P-13 חסום.",
  },
  {
    id: "P-09",
    path: "/catering/private-events",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "שער רך: בלי קיבולת, שורת «אירוח אצלנו במסעדה» נשמטת. הדף נבנה.",
  },
  {
    id: "P-10",
    path: "/catering/bar-mitzvah",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "שער רך: בלי נוסח כשרות בכתב הדף אגנוסטי לכשרות, והמילה «כשר» אסורה בו.",
  },
  {
    id: "P-11",
    path: "/catering/shiva",
    register: "operational",
    /* spec 00-spec-review §61: `01` §2 כותב `phone`, `02` §1.2/§1.7
       ו־`03` §7.29 כותבים `none`, והביקורת גוברת על המפרט. */
    stickyBar: "none",
    ctaMode: "phone",
    hasBuilder: false,
    indexable: true,
    inSitemap: true,
    enabled: false,
    blockedBy: ["kashrut_statement_written"],
    launchReady: false,
    note: "שער קשיח. בלי בנאי, בלי מחיר, בלי אפסייל, בלי אוצר מילים של חגיגה.",
  },
  {
    id: "P-12",
    path: "/catering/holidays",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "מחוץ לחלון חג — גרסה ירוקת־עד. לעולם לא חג שעבר (INV-9).",
  },
  {
    id: "P-13",
    path: "/catering/fun-day",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: false,
    blockedBy: ["live_stations"],
    launchReady: false,
    note: "בינתיים עוגן #gibush בתוך /catering/business. לא לשחרר כ־P-08 עם מילים מוחלפות.",
  },
  {
    id: "P-14",
    path: "/catering/dairy",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "חתך תפריט, לא סוג אירוע. אין זריעת eventType.",
  },
  {
    id: "P-15",
    path: "/urgent",
    register: "operational",
    stickyBar: "phone",
    ctaMode: "phone",
    /* spec 01 P-15 גובר על 02 §1.5: אין בנאי בדף, רק קישור טקסט ל־/quote. */
    hasBuilder: false,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "שער רך: בלי שעת חיתום אין טענת קאט־אוף, וקבוצת המודעות אינה רצה.",
  },
  {
    id: "P-16",
    path: "/pasta-bar",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: false,
    blockedBy: ["live_stations"],
    launchReady: false,
  },
  {
    id: "P-17",
    path: "/quote",
    register: "operational",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
  },
  {
    id: "P-18",
    path: "/thanks",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: false,
    inSitemap: false,
    enabled: true,
    blockedBy: [],
    launchReady: false,
  },
  {
    id: "P-19",
    path: "/summary",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: false,
    inSitemap: false,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "‎?ref=MM-XXXXXX. הקוד הוא query ולא סגמנט — הוא מוקרא בטלפון.",
  },
  {
    id: "P-20",
    path: "/unsubscribe",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: false,
    inSitemap: false,
    enabled: true,
    blockedBy: [],
    launchReady: false,
  },
  {
    id: "P-21",
    path: "/privacy",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
  },
  {
    id: "P-22",
    path: "/terms",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
  },
  {
    id: "P-23",
    path: "/accessibility",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: true,
    inSitemap: true,
    enabled: true,
    blockedBy: [],
    launchReady: false,
  },
  {
    id: "P-24",
    path: "/admin/leads",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: false,
    inSitemap: false,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "ממשק פנימי. `robots.txt` חוסם /admin; ההגנה האמיתית היא requireAdmin בשרת.",
  },
  {
    id: "P-25",
    path: "/404",
    register: "utility",
    stickyBar: "none",
    ctaMode: "quote",
    hasBuilder: false,
    indexable: false,
    inSitemap: false,
    enabled: true,
    blockedBy: [],
    launchReady: false,
    note: "מוגש עם status 404 גם בגישה ישירה — ראו httpStatusFor.",
  },
  {
    id: "P-26",
    path: "/areas/:city",
    register: "menu",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: true,
    inSitemap: true,
    enabled: false,
    blockedBy: ["area_facts"],
    launchReady: false,
    /* `values` ריק במכוון: כל ישוב שיירשם כאן הוא הצהרה שאנחנו משרתים
       אותו. `SLOTS.servesAreas` הוא null, ולכן הרשימה ריקה ואף כתובת
       `/areas/…` אינה נפתרת. את האיות לוקחים מ־CITY_SLUGS, לא ממציאים. */
    param: { name: "city", values: [] },
    note: "לפתוח רק עם זמן נסיעה, מינימום ודמי הגעה לאזור — אחרת אלה דפי דלת כניסה.",
  },
  {
    id: "P-27",
    path: "/lp/:campaign",
    register: "operational",
    stickyBar: "quote",
    ctaMode: "quote",
    hasBuilder: true,
    indexable: false,
    inSitemap: false,
    enabled: false,
    blockedBy: ["campaign_copy"],
    launchReady: false,
    param: { name: "campaign", values: [], open: true },
    note: "תמיד noindex,nofollow ומחוץ ל־sitemap. פס ה־CTA נקבע לכל קמפיין.",
  },
] as const;

/* ═══════════════════ אינדקסים ═══════════════════ */

const BY_ID = new Map<string, RouteDef>();
const BY_STATIC_PATH = new Map<string, RouteDef>();
const DYNAMIC: RouteDef[] = [];

for (const r of ROUTES) {
  BY_ID.set(r.id, r);
  if (r.param) {
    DYNAMIC.push(r);
    if (r.param.idByValue) {
      for (const id of Object.values(r.param.idByValue)) BY_ID.set(id, r);
    }
  } else {
    BY_STATIC_PATH.set(r.path, r);
  }
}

/** מזהה מסלול ⇒ הרשומה. מזהי סניף (P-05/P-06) מחזירים את `/kitchens/:slug`. */
export const routeById = (id: RouteId): RouteDef | null => BY_ID.get(id) ?? null;

/** נתיב דף השגיאה. גם היעד של הפניית מסלול לא מוכר, כשמפנים ולא מגישים במקום. */
export const NOT_FOUND_PATH = "/404";
export const NOT_FOUND_ID: RouteId = "P-25";

/* ═══════════════════ נרמול ═══════════════════ */

/**
 * מסיר query, hash, סלאשים כפולים וסלאש סופי. אינו משנה אותיות —
 * כתובת היא רגישת־רישיות, ו־`/Menus` אינו `/menus`. את זה מטפל
 * `redirectTarget`, שמחזיר יעד 301 במקום להתאים בשקט.
 *
 * ‎`/menus/` ו־`/menus?utm_source=x#faq` → `/menus`.
 */
export function normalizePath(pathname: string): string {
  const raw = pathname.split("?")[0].split("#")[0];
  if (raw === "" || raw === "/") return "/";
  const collapsed = raw.replace(/\/{2,}/g, "/");
  const trimmed = collapsed.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/**
 * היעד הקנוני ל־301, או `null` כשהכתובת כבר קנונית.
 *
 * spec 01 §1: אותיות קטנות, מקפים, בלי סלאש סופי. הפניה מוחזרת **רק**
 * כשהצורה הקנונית היא מסלול ש**מוגש היום** — אחרת `/NO-SUCH-PAGE/` היה
 * מקבל 301 ואז 404, שרשרת שמבזבזת תקציב סריקה במקום להחזיר 404 מיד.
 *
 * התנאי הוא `isServedPath` ולא `matchRoute` במכוון. `matchRoute` מתאים גם
 * מסלול שהשער שלו סגור, ולכן `/Menus/` היה מקבל 301 אל `/menus` — שהוא
 * עצמו 404 היום. זו בדיוק שרשרת ההפניה־אל־404 שהפסקה שלמעלה שוללת, והיא
 * תיפתח מעצמה ברגע ש־`enabled` של המסלול יתהפך.
 *
 * ה־query נשמר: פרמטרי UTM ו־`?ref=` חייבים לשרוד את ההפניה, אחרת
 * הייחוס נמחק בדיוק בכניסה מקמפיין.
 */
export function redirectTarget(rawPath: string): string | null {
  const queryIndex = rawPath.search(/[?#]/);
  const suffix = queryIndex === -1 ? "" : rawPath.slice(queryIndex);
  const canonical = normalizePath(rawPath).toLowerCase();
  const current = rawPath.slice(0, queryIndex === -1 ? undefined : queryIndex);
  if (canonical === current) return null;
  return isServedPath(canonical) ? `${canonical}${suffix}` : null;
}

/* ═══════════════════ ההתאמה ═══════════════════ */

export type RouteMatch = {
  route: RouteDef;
  /** המזהה האפקטיבי — לכל ערך פרמטר יש משלו כשהוגדר `idByValue`. */
  id: RouteId;
  /** הנתיב המנורמל שהותאם. */
  path: string;
  params: Readonly<Record<string, string>>;
};

/** ערך פרמטר תקין: אותיות קטנות, ספרות ומקפים. לא מקף פותח או סוגר. */
const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * האם `pathname` הוא מסלול אמיתי — כולל סגמנטים דינמיים.
 *
 * מחזיר גם מסלול **מושבת**, עם הרשומה שלו, כדי שהקורא יוכל להבחין בין
 * «אין דבר כזה» לבין «יש דבר כזה והשער סגור». להחלטת סטטוס HTTP השתמשו
 * ב־`isServedPath` או ב־`httpStatusFor`, שאינם מבחינים ביניהם בכוונה:
 * לזחלן, מסלול חסום ומסלול לא קיים הם אותו דבר בדיוק — 404.
 */
export function matchRoute(pathname: string): RouteMatch | null {
  const path = normalizePath(pathname);

  const exact = BY_STATIC_PATH.get(path);
  if (exact) return { route: exact, id: exact.id, path, params: {} };

  const segments = path.split("/").filter((s) => s !== "");

  for (const route of DYNAMIC) {
    const pattern = route.path.split("/").filter((s) => s !== "");
    if (pattern.length !== segments.length) continue;

    const params: Record<string, string> = {};
    let ok = true;

    for (let i = 0; i < pattern.length; i += 1) {
      const p = pattern[i];
      const s = segments[i];
      if (p.startsWith(":")) {
        const spec = route.param;
        if (!spec || spec.name !== p.slice(1)) {
          ok = false;
          break;
        }
        const allowed = spec.open
          ? SLUG_SHAPE.test(s)
          : spec.values.includes(s);
        if (!allowed) {
          ok = false;
          break;
        }
        params[spec.name] = s;
      } else if (p !== s) {
        ok = false;
        break;
      }
    }

    if (!ok) continue;

    const value = route.param ? params[route.param.name] : undefined;
    const id =
      (value && route.param?.idByValue?.[value]) || route.id;
    return { route, id, path, params };
  }

  return null;
}

/** האם הכתובת מוגשת היום: מסלול מוכר **וגם** שער פתוח. */
export function isServedPath(pathname: string): boolean {
  const m = matchRoute(pathname);
  return m !== null && m.route.enabled;
}

/**
 * סטטוס ה־HTTP שהשרת צריך להחזיר עם מעטפת ה־SPA.
 *
 * זהו התיקון ל־`app.use("*")` שמחזיר 200 על הכול: כתובת לא מוכרת,
 * כתובת שהשער שלה סגור, ו־`/404` עצמה — כולן 404. השאר 200.
 */
export function httpStatusFor(pathname: string): 200 | 404 {
  const path = normalizePath(pathname);
  if (path === NOT_FOUND_PATH) return 404;
  return isServedPath(path) ? 200 : 404;
}

/* ═══════════════════ בוררים ═══════════════════ */

/** המסלולים שמוגשים היום. מזין את הראוטר ואת הניווט. */
export const enabledRoutes = (): RouteDef[] => ROUTES.filter((r) => r.enabled);

/** המסלולים החסומים, עם מה שחסר. מזין את דוח «מה נפתח כשמוסרים מה». */
export const blockedRoutes = (): { route: RouteDef; blockedBy: readonly GateRequirementId[] }[] =>
  ROUTES.filter((r) => !r.enabled).map((r) => ({ route: r, blockedBy: r.blockedBy }));

/** עובדות הבעלים החסרות, בלי כפילות. כל אחת פותחת מסלול אחד או יותר. */
export function openGateRequirements(): GateRequirementId[] {
  const set = new Set<GateRequirementId>();
  for (const r of ROUTES) for (const g of r.blockedBy) set.add(g);
  return [...set];
}

/**
 * הנתיבים הקונקרטיים ל־`sitemap.xml`: מוגשים, אינדקסביליים, מסומנים
 * ‎`inSitemap`, ומורחבים לפי `param.values`. מסלול פרמטרי בלי ערכים
 * אינו תורם דבר — וזה מדוע `/areas/:city` אינו יכול להדליף ישוב שאיננו
 * משרתים גם אם מישהו יפעיל אותו בטעות.
 */
export function sitemapPaths(): { path: string; id: RouteId }[] {
  const out: { path: string; id: RouteId }[] = [];
  for (const r of ROUTES) {
    if (!r.enabled || !r.indexable || !r.inSitemap) continue;
    if (!r.param) {
      out.push({ path: r.path, id: r.id });
      continue;
    }
    if (r.param.open) continue;
    for (const v of r.param.values) {
      out.push({
        path: r.path.replace(`:${r.param.name}`, v),
        id: r.param.idByValue?.[v] ?? r.id,
      });
    }
  }
  return out;
}

/**
 * תחיליות ל־`robots.txt`. נגזרות ולא נכתבות ביד, כדי שמסלול `noindex`
 * חדש לא יישכח שם. `/404` אינו נחסם — צריך שיסרקו אותו ויראו 404.
 *
 * **הפשרה שיש לדעת עליה:** `Disallow` מונע *סריקה*, ו־`noindex` מונע
 * *אינדוקס* — וחסימת סריקה מונעת מהזחלן לראות את ה־`noindex` מלכתחילה.
 * בכתובת שיש אליה קישורים חיצוניים, הצירוף הזה גורם דווקא להופעה
 * כתוצאה ריקה. כאן הוא בטוח משום שכל המסלולים שנפלטים — `/thanks`,
 * `/summary`, `/unsubscribe`, `/admin/leads`, `/lp` — מגיעים אליהם רק
 * אחרי שליחת טופס, מקישור בהודעה או מקמפיין ממומן, ואף אחד מהם אינו
 * מקושר משום דף שנסרק. אם ייווצר מסלול `noindex` שכן מקושר בניווט,
 * יש להוציא אותו מכאן ולהשאיר לו את ה־`noindex` בלבד.
 */
export function robotsDisallow(): string[] {
  const out = new Set<string>();
  for (const r of ROUTES) {
    if (r.indexable || r.path === NOT_FOUND_PATH) continue;
    const prefix = r.param ? r.path.slice(0, r.path.indexOf("/:")) : r.path;
    out.add(prefix);
  }
  return [...out].sort();
}
