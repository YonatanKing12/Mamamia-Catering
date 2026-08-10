/**
 * ═══════════════════════════════════════════════════════════════════════
 *  App — שלד הניתוב. spec 01 §5.2, §5.4, §5.5, INV-8.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  הכלל היחיד שקובע מה עולה כאן
 * ─────────────────────────────────────────────────────────────────────
 * ‏INV-8: «שום מסלול אינו עולה בלי רשומה ב־`shared/routes.ts`». הקובץ הזה
 * אינו מחזיק רשימת מסלולים משלו — הוא **גוזר** את הרישום מ־`ROUTES`, ומה
 * שיש לו משלו הוא בדיוק דבר אחד: מיפוי `RouteId → מודול העמוד`.
 *
 * מסלול נרשם אם ורק אם שני התנאים מתקיימים:
 *   1. ‎`enabled === true` ב־`shared/routes.ts` (שער עובדות הבעלים פתוח);
 *   2. יש למזהה שלו קובץ עמוד אמיתי ב־`PAGE_LOADERS` שמתחת.
 *
 * חסר אחד מהם ⇒ המסלול אינו נרשם, נופל ל־`NotFound`, ואינו מקבל 200.
 * הכיוון הזה הוא הבטוח בשני הצדדים: רישום בלי קובץ עמוד מייצר soft 404
 * (‏200 עם מעטפת שגיאה) — בדיוק הפגם ש־`shared/routes.ts` נבנה כדי לסגור;
 * ורישום של מסלול ששערו סגור פותח דף שמצהיר על עובדה שאיש לא מסר.
 *
 * המשמעות המעשית: כשהבעלים ימסור עובדה, `enabled` מתהפך **ב־
 * `shared/routes.ts` בלבד** והמסלול עולה כאן מעצמו. אין שורה להוסיף כאן,
 * ולכן אין שורה לשכוח. הקבצים שכבר כתובים וממתינים לשער כזה מופו מראש
 * ב־`PAGE_LOADERS` (`P-02`, `P-03`, `P-11`, `P-13`, `P-16`).
 *
 * ‏`React.lazy` על מזהה שאינו נרשם אינו עולה דבר בזמן ריצה: הוא יוצר
 * צ׳אנק נפרד בבנייה ולא נטען לעולם עד שהמסלול מרונדר.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מודל המטבח — אחד, לא ארבעה
 * ─────────────────────────────────────────────────────────────────────
 *  · ‎`P-03` הועבר ב־`shared/routes.ts` מ־`/kitchens` ל־`/kitchen` ונפתח,
 *    בהתאמה ל־`pages/kitchen.tsx` ול־`lib/page-meta-extra.ts`. אי־ההתאמה
 *    שהייתה כאן — רשומה על נתיב ישן מול דף שממען את עצמו בנתיב חדש —
 *    נסגרה, ולא רק הוסתרה מאחורי שער סגור.
 *  · ‎`P-04`…`P-06` (שלושת דפי הסניף) אין להם קובץ עמוד ולא יהיה: המודל
 *    נמחק באותו תיקון מיצוב. הרשומה נשארת `enabled: false` כדי ש־
 *    ‎`/kitchens/…` יחזיר 404 ולא 200 עם מעטפת שגיאה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  פיצול לצ׳אנקים
 * ─────────────────────────────────────────────────────────────────────
 * ‏`React.lazy` לכל מסלול, ו־`<Suspense>` **אחד** בלבד. הכותרת, הפוטר ופס
 * ה־CTA יושבים **מחוץ** לגבול ההשהיה: `<Switch>` של wouter מפרק את המסלול
 * היוצא מיד, ולכן רק גוף העמוד רשאי להתחלף. ה־fallback הוא שלד בגובה קבוע
 * כדי ש־CLS יישאר 0.
 *
 * ‏`preloadRoute(path)` מיוצא כדי שקישור יוכל להקדים טעינה ב־hover או
 * ב־focus. ל־wouter אין preload מובנה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הוסר מהמעטפת הקודמת, ולמה
 * ─────────────────────────────────────────────────────────────────────
 *  · ‎`QueryClientProvider` — ‎~18KB gzip בשביל POST אחד. הלידים נשלחים
 *    דרך `lib/lead-client.ts`, שהוא fetch/sendBeacon ישיר.
 *  · ‎`TooltipProvider` — אין tooltips בממשק השיווקי.
 *  · ‎`Toaster` — הודעת ההצלחה היא מעבר מסלול ל־`/thanks`, לא toast.
 *  · ‎`AccessibilityToolbar` — §5.5 מוחק אותו, לא מתקן אותו.
 *  · ‎`normalizePath` מ־`@/lib/seo` — הוחלף בזה של `@shared/routes`. הראשון
 *    גורר את כל שכבת התוכן אל צ׳אנק הכניסה בשביל פונקציית מחרוזת אחת.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  RTL
 * ─────────────────────────────────────────────────────────────────────
 * ‏`DirectionProvider dir="rtl"` בשורש. פרימיטיבים של Radix קוראים כיוון
 * מה־prop שלהם או מהספק הזה, ו**אינם** קוראים את `document.dir`.
 */

import * as React from "react";
import { Route, Switch, useLocation } from "wouter";
import { DirectionProvider } from "@radix-ui/react-direction";
import { PageShell } from "@/components/layout/page-shell";
import {
  ROUTES,
  matchRoute,
  normalizePath,
  redirectTarget,
  type RouteDef,
  type RouteId,
  type StickyBar,
} from "@shared/routes";

/* ═══════════════════ מודולי העמודים ═══════════════════ */

/**
 * עמוד אינו מקבל props היום. `params` מוצהר כאופציונלי כדי שמסלול
 * פרמטרי יוכל להעביר את הסגמנט בלי לשנות את החתימה של אף עמוד קיים.
 *
 * הטיפוס הוא `unknown` ולא `Record<string,string>` כי `component` של wouter
 * מזריק צורת params רחבה יותר (כולל קבוצות של regex, שערכן עשוי להיות
 * `undefined`). `unknown` מקבל את שתיהן בלי `any` ובלי המרה.
 */
type PageComponent = React.ComponentType<{ params?: unknown }>;
type PageLoader = () => Promise<{ default: PageComponent }>;

const loadNotFound: PageLoader = () => import("@/pages/not-found");
const loadQuote: PageLoader = () => import("@/pages/quote");

/**
 * ‏`RouteId` ⇒ הקובץ. זו כל הידיעה שיש לקובץ הזה על מלאי העמודים, וזה
 * המקום היחיד שמשתנה כשעמוד חדש נוחת.
 *
 * מזהים שאין להם רשומה כאן, ומדוע:
 *   ‎`P-04`…`P-06` — דפי הסניף. המודל נמחק (מטבח אחד, לא שלושה).
 *   ‎`P-26` — `/areas/:city`: `SLOTS.servesAreas` הוא `null`.
 *   ‎`P-27` — `/lp/:campaign`: אין קופי קמפיין חתום.
 */
const PAGE_LOADERS: Partial<Record<RouteId, PageLoader>> = {
"P-01": () => import("@/pages/home"),
"P-02": () => import("@/pages/menus"),
"P-03": () => import("@/pages/kitchen"),
"P-07": () => import("@/pages/catering"),
"P-08": () => import("@/pages/catering-business"),
"P-09": () => import("@/pages/catering-private"),
"P-10": () => import("@/pages/catering-bar-mitzvah"),
"P-11": () => import("@/pages/catering-shiva"),
"P-12": () => import("@/pages/catering-holidays"),
"P-13": () => import("@/pages/catering-fun-day"),
"P-14": () => import("@/pages/catering-dairy"),
"P-15": () => import("@/pages/urgent"),
"P-16": () => import("@/pages/pasta-bar"),
"P-17": loadQuote,
"P-18": () => import("@/pages/thanks"),
"P-19": () => import("@/pages/summary"),
"P-20": () => import("@/pages/unsubscribe"),
"P-21": () => import("@/pages/privacy"),
"P-22": () => import("@/pages/terms"),
"P-23": () => import("@/pages/accessibility"),
"P-24": () => import("@/pages/admin-leads"),
"P-25": loadNotFound,
};

/** דף ההתאוששות. מוגדר ישירות כדי שיהיה זמין גם למסלול שלא נרשם. */
const NotFound = React.lazy(loadNotFound);

const PAGES = new Map<RouteId, React.LazyExoticComponent<PageComponent>>();
PAGES.set("P-25", NotFound);
for (const key of Object.keys(PAGE_LOADERS) as RouteId[]) {
  const loader = PAGE_LOADERS[key];
  /* P-25 כבר נרשם למעלה; שני עטיפות `lazy` לאותו מודול הן שתי השהיות. */
  if (loader && !PAGES.has(key)) PAGES.set(key, React.lazy(loader));
}

/** האם המסלול הזה באמת מוגש: שער פתוח **וגם** קובץ עמוד קיים. */
const isLive = (def: RouteDef): boolean => def.enabled && PAGES.has(def.id);

/* ═══════════════════ הקדמת טעינה ═══════════════════ */

/**
 * מקדים את הצ׳אנק של המסלול שמאחורי `pathname`. נועד ל־`onPointerEnter`
 * ול־`onFocus` של קישור. כתובת שאינה מוגשת אינה טוענת דבר.
 */
export function preloadRoute(pathname: string): void {
  const match = matchRoute(pathname);
  if (!match || !match.route.enabled) return;
  void PAGE_LOADERS[match.route.id]?.();
}

/* ═══════════════════ רישום המסלולים ═══════════════════ */

/**
 * הרכיבים של `<Switch>`, בסדר `ROUTES`. נבנים פעם אחת בזמן טעינת המודול:
 * `ROUTES` קפוא ו־`PAGES` נבנה לצדו, ולכן אין מה לחשב מחדש ברינדור.
 *
 * מסלול פרמטרי עובר שער נוסף: wouter מתאים כל ערך לסגמנט `:name`, בעוד
 * ש־`shared/routes.ts` מכיר רשימת ערכים סגורה. בלי הבדיקה הזאת
 * ‎`/kitchens/anything` היה מחזיר 200 עם דף סניף ריק. `matchRoute` הוא
 * הבורר — לא רשימה שנייה כאן.
 */
const ROUTE_ELEMENTS: React.ReactNode[] = ROUTES.filter(isLive).map((def) => {
  const Page = PAGES.get(def.id) as React.LazyExoticComponent<PageComponent>;

  if (!def.param) {
    return <Route key={def.id} path={def.path} component={Page} />;
  }

  const param = def.param;
  return (
    <Route key={def.id} path={def.path}>
      {(params: Record<string, string>) => {
        const value = params[param.name] ?? "";
        const match = matchRoute(def.path.replace(`:${param.name}`, value));
        return match && match.route.id === def.id ? (
          <Page params={params} />
        ) : (
          <NotFound />
        );
      }}
    </Route>
  );
});

/* ═══════════════════ פס ה־CTA לפי מסלול ═══════════════════ */

/**
 * ‏01 §5.3 / 02 §1.7 — הערך מגיע מ־`RouteDef.stickyBar` ואינו נגזר משום
 * נוסחה. כתובת שאינה מוגשת מקבלת `'none'`: דף ההתאוששות מציע דרכים
 * להמשיך, ופס המרה דביק מעליו הוא רעש.
 */
function stickyBarFor(pathname: string): StickyBar {
  const match = matchRoute(pathname);
  return match && isLive(match.route) ? match.route.stickyBar : "none";
}

/* ═══════════════════ קנוניזציה בצד הלקוח ═══════════════════ */

/**
 * ‏01 §1: אותיות קטנות, בלי סלאש סופי. השרת מחזיר 301 על הכתובת שנכנסת
 * מבחוץ; זה מטפל במה שנוצר **בתוך** האפליקציה — קישור ידני, כתובת
 * שהודבקה, או חזרה מהיסטוריה — שאינו עובר בשרת כלל. בלי זה `/Catering/`
 * נוחת על דף 404 בזמן ש־`/catering` חי.
 *
 * ‏`redirectTarget` מחזיר יעד **רק** כשהצורה הקנונית מוגשת היום, ולכן אין
 * כאן שרשרת הפניות אל 404. ה־query נשמר — פרמטרי ייחוס חייבים לשרוד.
 */
function useCanonicalPath(): void {
  const [location, navigate] = useLocation();

  React.useEffect(() => {
    const search = window.location.search;
    const target = redirectTarget(`${location}${search}`);
    if (target) navigate(target, { replace: true });
  }, [location, navigate]);
}

/* ═══════════════════ ניווט לעוגן ═══════════════════ */

/**
 * ‏§5.4. wouter מתעלם מ־fragment לחלוטין, ולכן קישור `#quote` ממסלול אחר
 * לא היה קופץ לשום מקום. כאן: קוראים את ה־hash בכל שינוי מסלול ובכל
 * `hashchange`, ממתינים פריים אחד שהפריסה תתייצב, גוללים בכבוד ל־
 * `prefers-reduced-motion`, ומעבירים פוקוס ליעד — גלילה בלי פוקוס משאירה
 * משתמש מקלדת בראש העמוד.
 *
 * ‏`[id]{scroll-margin-top:88px}` כבר בבסיס (index.css §5), ולכן היעד לא
 * נחתך מתחת לכותרת הדביקה.
 *
 * ‏TODO(01 §5.7): כשייווצר `hooks/use-hash-scroll.ts` — להעביר לשם כמות שהוא.
 */
function useHashScroll(): void {
  const [location] = useLocation();

  React.useEffect(() => {
    let frameA = 0;
    let frameB = 0;

    const run = () => {
      const raw = window.location.hash;

      /* בלי hash: מסלול חדש מתחיל מלמעלה. בלי זה, מעבר מעמוד ארוך
         לעמוד קצר נוחת באמצע העמוד החדש. */
      if (raw.length < 2) {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      let id: string;
      try {
        id = decodeURIComponent(raw.slice(1));
      } catch {
        id = raw.slice(1);
      }

      frameA = window.requestAnimationFrame(() => {
        frameB = window.requestAnimationFrame(() => {
          const el = document.getElementById(id);
          if (!el) return;

          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

          /* היעד לרוב אינו פקד. tabIndex=-1 עושה אותו ממוקד־תוכנה בלבד. */
          if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
          (el as HTMLElement).focus({ preventScroll: true });
        });
      });
    };

    run();
    window.addEventListener("hashchange", run);
    return () => {
      window.removeEventListener("hashchange", run);
      if (frameA) window.cancelAnimationFrame(frameA);
      if (frameB) window.cancelAnimationFrame(frameB);
    };
  }, [location]);
}

/**
 * ‏§5.4 — מקדימים את `/quote` אחרי ה־LCP. הוא היעד של כל CTA ראשי באתר.
 * מותנה בכך שהמסלול באמת מוגש: לא מורידים צ׳אנק של דף שאי אפשר להגיע אליו.
 */
function useIdlePrefetch(): void {
  React.useEffect(() => {
    const quote = ROUTES.find((r) => r.id === "P-17");
    if (!quote || !isLive(quote)) return;

    /* requestIdleCallback חסר ב־lib.dom של חלק מגרסאות TS ואינו קיים
       ב־Safari ישן. ההצהרה המקומית מחליפה `any` וה־fallback הוא setTimeout. */
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const idle = w.requestIdleCallback ?? ((cb: () => void) => w.setTimeout(cb, 1200));
    const handle = idle(() => {
      void loadQuote();
    });

    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(handle);
      else w.clearTimeout(handle);
    };
  }, []);
}

/* ═══════════════════ שלד ההשהיה ═══════════════════ */

/**
 * ‏§5.4 — גובה קבוע התואם את מעטפת המסלול, כדי שהחלפת צ׳אנק לא תזיז
 * את הפוטר ואת ה־CLS. ריק במכוון: שלד מנצנץ הוא אנימציה, ו־L-13 מתיר
 * פרימיטיב תנועה אחד שאינו זה.
 */
const RouteShellSkeleton = () => (
  <div className="wrap min-h-[70vh] pt-sec">
    <p className="sr-only" role="status">
      טוען את העמוד
    </p>
  </div>
);

/* ═══════════════════ האפליקציה ═══════════════════ */

export default function App() {
  const [location] = useLocation();
  useCanonicalPath();
  useHashScroll();
  useIdlePrefetch();

  const stickyBar = stickyBarFor(normalizePath(location));

  return (
    <DirectionProvider dir="rtl">
      <PageShell stickyBar={stickyBar}>
        <React.Suspense fallback={<RouteShellSkeleton />}>
          <Switch>
            {ROUTE_ELEMENTS}
            {/* כל השאר — כולל מסלול ששערו סגור וכולל `/404` עצמה. */}
            <Route component={NotFound} />
          </Switch>
        </React.Suspense>
      </PageShell>
    </DirectionProvider>
  );
}
