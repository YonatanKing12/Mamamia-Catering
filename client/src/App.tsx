/**
 * ═══════════════════════════════════════════════════════════════════════
 *  App — שלד הניתוב. spec 01 §5.2, §5.4, §5.5.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה נרשם כאן, ומה במכוון לא
 * ─────────────────────────────────────────────────────────────────────
 * מלאי העמודים ב־01 §2 מונה 27 מסלולים. נרשמים כאן **רק** מסלולים שקובץ
 * העמוד שלהם קיים בפועל. מסלול שנרשם לקובץ־בדל ריק גרוע ממסלול שלא נרשם:
 * הוא מחזיר 200 וקנוני לדף שאין בו תוכן, וזה בדיוק מה שהשכבה ב־§5.1
 * קיימת כדי למנוע. מסלול שאינו רשום נופל ל־NotFound, שהוא דף התאוששות
 * עברי — התנהגות נכונה עד שהעמוד נבנה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  פיצול לצ׳אנקים
 * ─────────────────────────────────────────────────────────────────────
 * `React.lazy` לכל מסלול, ו־`<Suspense>` **אחד** בלבד. הכותרת, הפוטר ופס
 * ה־CTA יושבים **מחוץ** לגבול ההשהיה: `<Switch>` של wouter מפרק את המסלול
 * היוצא מיד, ולכן רק גוף העמוד רשאי להתחלף. ה־fallback הוא שלד בגובה קבוע
 * כדי ש־CLS יישאר 0.
 *
 * טוען כל מודול מיוצא בשם (`preloadQuote` וכו׳) כדי שאפשר יהיה לקרוא לו
 * מ־onPointerEnter/onFocus על קישור. ל־wouter אין preload מובנה.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  מה הוסר מהמעטפת הקודמת, ולמה
 * ─────────────────────────────────────────────────────────────────────
 *  · `QueryClientProvider` — ‎~18KB gzip בשביל POST אחד. הלידים נשלחים
 *    דרך `lib/lead-client.ts`, שהוא fetch/sendBeacon ישיר.
 *  · `TooltipProvider` — אין tooltips בממשק השיווקי.
 *  · `Toaster` — הודעת ההצלחה היא מעבר מסלול ל־`/thanks`, לא toast.
 *  · `AccessibilityToolbar` — §5.5 מוחק אותו, לא מתקן אותו.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  RTL
 * ─────────────────────────────────────────────────────────────────────
 * `DirectionProvider dir="rtl"` בשורש. פרימיטיבים של Radix קוראים כיוון
 * מה־prop שלהם או מהספק הזה, ו**אינם** קוראים את `document.dir`.
 */

import * as React from "react";
import { Route, Switch, useLocation } from "wouter";
import { DirectionProvider } from "@radix-ui/react-direction";
import { PageShell, type StickyBar } from "@/components/layout/page-shell";
import { normalizePath } from "@/lib/seo";

/* ═══════════════════ טוענים ═══════════════════ */

/** מיוצאים בשם כדי שקישור יוכל להקדים את הטעינה ב־hover או ב־focus. */
export const preloadHome = () => import("@/pages/home");
export const preloadQuote = () => import("@/pages/quote");
export const preloadThanks = () => import("@/pages/thanks");
export const preloadPrivacy = () => import("@/pages/privacy");
export const preloadTerms = () => import("@/pages/terms");
export const preloadAccessibility = () => import("@/pages/accessibility");
export const preloadNotFound = () => import("@/pages/not-found");

const Home = React.lazy(preloadHome);
const Quote = React.lazy(preloadQuote);
const Thanks = React.lazy(preloadThanks);
const Privacy = React.lazy(preloadPrivacy);
const Terms = React.lazy(preloadTerms);
const Accessibility = React.lazy(preloadAccessibility);
const NotFound = React.lazy(preloadNotFound);

/* ═══════════════════ פס ה־CTA לפי מסלול ═══════════════════ */

/**
 * ‎01 §5.3 / 02 §1.7. ברירת המחדל היא `'none'` במכוון — מסלול שלא הצהיר
 * מקבל עמוד בלי פס המרה. הכיוון הבטוח: פס "הצעה" קבוע על מסלול תפעולי
 * או על עמוד אישור הוא כשל טוני, ולא חוסר.
 */
const STICKY_BAR: Readonly<Record<string, StickyBar>> = {
  "/": "quote",
};

/* ═══════════════════ ניווט לעוגן ═══════════════════ */

/**
 * ‎§5.4. wouter מתעלם מ־fragment לחלוטין, ולכן קישור `#quote` ממסלול אחר
 * לא היה קופץ לשום מקום. כאן: קוראים את ה־hash בכל שינוי מסלול ובכל
 * `hashchange`, ממתינים פריים אחד שהפריסה תתייצב, גוללים בכבוד ל־
 * `prefers-reduced-motion`, ומעבירים פוקוס ליעד — גלילה בלי פוקוס משאירה
 * משתמש מקלדת בראש העמוד.
 *
 * ‎`[id]{scroll-margin-top:88px}` כבר בבסיס (index.css §5), ולכן היעד לא
 * נחתך מתחת לכותרת הדביקה.
 *
 * ‎TODO(01 §5.7): כשייווצר `hooks/use-hash-scroll.ts` — להעביר לשם כמות שהוא.
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

/** ‎§5.4 — מקדימים את `/quote` אחרי ה־LCP. הוא היעד של כל CTA ראשי באתר. */
function useIdlePrefetch(): void {
  React.useEffect(() => {
    /* requestIdleCallback חסר ב־lib.dom של חלק מגרסאות TS ואינו קיים
       ב־Safari ישן. ההצהרה המקומית מחליפה `any` וה־fallback הוא setTimeout. */
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const idle = w.requestIdleCallback ?? ((cb: () => void) => w.setTimeout(cb, 1200));
    const handle = idle(() => {
      void preloadQuote();
    });

    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(handle);
      else w.clearTimeout(handle);
    };
  }, []);
}

/* ═══════════════════ שלד ההשהיה ═══════════════════ */

/**
 * ‎§5.4 — גובה קבוע התואם את מעטפת המסלול, כדי שהחלפת צ׳אנק לא תזיז
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
  useHashScroll();
  useIdlePrefetch();

  const stickyBar = STICKY_BAR[normalizePath(location)] ?? "none";

  return (
    <DirectionProvider dir="rtl">
      <PageShell stickyBar={stickyBar}>
        <React.Suspense fallback={<RouteShellSkeleton />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/quote" component={Quote} />
            <Route path="/thanks" component={Thanks} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/accessibility" component={Accessibility} />

            {/*
              מסלולים שטרם נבנו — 01 §2:
              /menus /kitchens /kitchens/:slug /catering /catering/business
              /catering/private-events /catering/bar-mitzvah /catering/shiva
              /catering/holidays /catering/fun-day /catering/dairy /urgent
              /pasta-bar /summary /unsubscribe /areas/:city /lp/:campaign
              /admin/leads
              אין להוסיף כאן שורה בלי קובץ עמוד אמיתי מאחוריה.
            */}

            <Route component={NotFound} />
          </Switch>
        </React.Suspense>
      </PageShell>
    </DirectionProvider>
  );
}
