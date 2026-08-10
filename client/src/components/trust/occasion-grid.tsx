/**
 * ═══════════════════════════════════════════════════════════════════════
 *  OccasionGrid — סוגי האירועים, בקישור לדפים שכבר קיימים.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * זו הקומפוננטה היחידה בשכבת האמון ש**כן** מרנדרת היום, והסיבה פשוטה:
 * היא אינה טוענת שום דבר שלא נמסר. המסלולים אמיתיים, השמות ושורות
 * הכוונה יושבים ב־`content/occasions.ts`, ואין כאן מחיר, מינימום, אזור
 * או זמן אספקה.
 *
 * מה שהיא עושה בפועל, ולמה היא חלק משכבת האמון ולא מהניווט:
 *
 *  · **המרה.** קונה שמגיע מקמפיין רחב («קייטרינג») אינו יודע שיש לנו דף
 *    שמדבר בדיוק על האירוע שלו. הרשת הזאת היא מה שמעביר אותו מדף כללי
 *    לדף שהכוונה שלו נכתבה בו — וזה הקפיצה הגדולה ביותר בשיעור ההמרה
 *    שאפשר לעשות בלי נתון חדש מהלקוח.
 *  · **קישור פנימי.** תשעה דפי אירוע בלי קישורים נכנסים הם תשעה דפים
 *    יתומים. הרשת הזאת היא מה שמעביר סמכות ביניהם, ומה שנותן לזחלן
 *    מסלול לגלות אותם בלי מפת אתר בלבד.
 *  · **ציטוט במנועי תשובות.** רשימה מפורשת של «לאילו אירועים» עם תיאור
 *    בן משפט לכל אחד היא בדיוק הצורה שמודל שולף כשנשאל «מי עושה
 *    קייטרינג ל־X».
 *
 * ─────────────────────────────────────────────────────────────────────
 *  השערים אינם נבדקים כאן
 * ─────────────────────────────────────────────────────────────────────
 * ‎`buildableOccasions()` הוא מקור האמת: מסלול שהשער הקשיח שלו סגור
 * אינו נרשם בראוטר ואינו נכנס ל־sitemap, ולכן גם אינו מופיע ברשת הזאת.
 * היום זה משמיט את `/catering/fun-day` ואת `/pasta-bar`, ששניהם חסומים
 * על `SLOTS.liveStations`, ואת `/catering/shiva` שחסום על נוסח הכשרות
 * בכתב. קישור לדף שאינו נבנה הוא ‎404 בקמפיין משלם.
 *
 * ‎`prop` שמוסיף אירוע ידנית לא קיים בכוונה — הוא היה עוקף בדיוק את זה.
 */

import * as React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/primitives";
import { buildableOccasions, type Occasion, type OccasionId } from "@/content/occasions";
import { getSourcePage } from "@/lib/attribution";
import { track } from "@/lib/analytics";

const COLUMNS: Record<2 | 3, string> = {
  2: "min-[620px]:grid-cols-2",
  3: "min-[620px]:grid-cols-2 min-[960px]:grid-cols-3",
};

/** חץ. ‎`icon-flip` מסובב אותו ב־RTL — לכן אין כאן `left` ואין `right`. */
function Chevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="icon-flip block shrink-0"
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

function OccasionCard({ occasion }: { occasion: Occasion }) {
  const handleClick = React.useCallback(() => {
    track("event_page_click", {
      target_route: occasion.route,
      source_page: getSourcePage(),
    });
  }, [occasion.route]);

  return (
    <Link
      href={occasion.route}
      onClick={handleClick}
      className={cn(
"group flex h-full flex-col gap-[.5rem] no-underline",
"rounded-card border border-solid border-[color:var(--rule-control)]",
"bg-bg-alt p-[1.05rem]",
"transition-[border-color,transform] duration-state ease-house",
"hover:border-accent hover:-translate-y-px motion-reduce:hover:translate-y-0",
      )}
    >
      <span className="flex items-center gap-[.45rem] text-md font-bold leading-tight text-fg group-hover:text-accent">
        {occasion.nameHe}
        <span className="text-accent">
          <Chevron />
        </span>
      </span>
      <span className="text-xs leading-[1.65] text-fg-muted">{occasion.intentHe}</span>
    </Link>
  );
}

export interface OccasionGridProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  lede?: React.ReactNode;
  headingAs?: "h2" | "h3";
  /** הצגה חלקית, בסדר שנמסר. מזהה שאינו נבנה היום מושמט בשקט. */
  only?: readonly OccasionId[];
  /** השמטה — למשל את האירוע שהדף הנוכחי עוסק בו. */
  exclude?: readonly OccasionId[];
  columns?: 2 | 3;
}

export function OccasionGrid({
  title,
  eyebrow,
  lede,
  headingAs = "h2",
  only,
  exclude,
  columns = 3,
  className,
...rest
}: OccasionGridProps) {
  const items = React.useMemo(() => {
    const buildable = buildableOccasions();
    const excluded = new Set<string>(exclude ?? []);

    /* `only` קובע גם סינון וגם סדר — «קודם עסקי» הוא החלטה של הדף. */
    const ordered = only
      ? only
.map((id) => buildable.find((o) => o.id === id))
.filter((o): o is Occasion => Boolean(o))
      : buildable;

    return ordered.filter((o) => !excluded.has(o.id));
  }, [only, exclude]);

  /* לא נותר אף אירוע ⇒ אין רשת ואין כותרת מעל כלום. */
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-[1.1rem]", className)} {...rest}>
      {title ? (
        <SectionHeader title={title} eyebrow={eyebrow} lede={lede} as={headingAs} />
      ) : null}

      <ul className={cn("m-0 grid list-none gap-[.7rem] p-0", COLUMNS[columns])}>
        {items.map((o) => (
          <li key={o.id} className="flex">
            <OccasionCard occasion={o} />
          </li>
        ))}
      </ul>
    </div>
  );
}
