/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ServiceFormats — פורמטי ההגשה כתפריטי שף.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * spec 03 §7.8b, §7.10, spec 02 §3.4, spec 01 §3.1 סקשן 02.
 *
 * משלוח והנחה · בופה במקום · מוגש בצלחות עם צוות · אירוח אצלנו במסעדה.
 * מוצגים כתפריטי שף קבועים, לא כ«חבילות»: חבילה מזמינה השוואת מחיר מול
 * מתחרה שמפרסם מחיר לסועד, ותפריט שף מזמין השוואת תוכן.
 *
 * ─── השער, וזה הסעיף החשוב בקובץ ────────────────────────────────
 * **כל פורמט נשען על המשבצת שלו בלבד, ופורמט לא מאושר פשוט לא קיים.**
 * ‎`offered !== true` ⇒ אין כרטיס, אין שם, ואין אזכור בשום מקום בעמוד.
 *
 * שני פורמטים הם הצהרות מסחריות ולא תיאורים:
 *
 *   `plated_staffed`  טוען שיש מלצרים, ציוד הגשה וכלי פורצלן. 02 §3.4
 *                     קובע שזו שאלה פתוחה לבעלים, ו־00-spec-review A1
 *                     מוחק את «עם הצוות שלנו בשטח» משתי כותרות H1
 *                     בדיוק בגלל זה. הכרטיס אינו קיים עד תשובה בכתב.
 *   `at_restaurant`   טוען שהמסעדות מארחות אירועים פרטיים — קיבולת
 *                     ישיבה, אפשרות סגירת החלל, חניה ונגישות. 01 P-09
 *                     גוזר אותו על `privateEventCapacity` של סניף כלשהו.
 *
 * בלי שניהם הרשת מרנדרת שני כרטיסים ולא ארבעה, והיא לא אומרת דבר על
 * צוות או על אירוח. רשת של שניים אינה רשת חסרה — היא הרשת.
 *
 * ─── מחיר ───────────────────────────────────────────────────────
 * ‎`pricePerPerson` מוצג **רק** יחד עם `priceNoteHe` — הסייג שבעליו כתב
 * ‎(מה כלול, מע״מ, תוקף). מספר בלי סייג מעגן כל שיחת מכירה במספר הלא נכון,
 * ובלי הסייג הוא גם מצג חסר. אין מחיר ⇒ אין שורת מחיר, ואם העמוד סיפק
 * ‎`noPriceNoteHe` היא מופיעה במקומה. תפריט שף בלי מחירים הוא מוסכמה
 * לגיטימית של מסעדה, ולכן המצב הזה נקרא מכוון ולא מתחמק.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Money } from "@/components/primitives";
import { SERVICE_FORMAT_LABEL } from "@/components/quote/quote-config";
import { track } from "@/lib/analytics";
import type { ServiceFormat } from "@shared/lead-constants";
import { BandSection, type BandTone } from "./section";
import { DishList, type DishLine } from "./dish-list";

export interface ServiceFormatSpec {
  id: ServiceFormat;
  /**
   * **חובה, ובלי ברירת מחדל.** רק `true` מציג את הפורמט. המקור היחיד
   * הלגיטימי הוא אישור הבעלים — לא סבירות, לא «כנראה», לא מתחרה.
   */
  offered: boolean;
  /** ברירת מחדל: התווית המשותפת מ־quote-config (שם הדבר, לא הצהרה). */
  titleHe?: string;
  kickerHe?: string | null;
  descriptionHe?: string | null;
  /** «למי זה מתאים» — שורת התחתית של הכרטיס. */
  forWhoHe?: string | null;
  includes?: readonly string[] | null;
  excludes?: readonly string[] | null;
  /** רשימת מנות בתוך הכרטיס — אותה שורת מנה בדיוק (§7.7). */
  dishes?: readonly DishLine[];
  /** מוצג רק יחד עם priceNoteHe. */
  pricePerPerson?: number | null;
  priceNoteHe?: string | null;
  /** מה נכתב במקום מחיר. נוסח בבעלות הלקוח — בלי נוסח אין שורה. */
  noPriceNoteHe?: string | null;
  /** הכרטיס המסומן. קו כותר של 2px, לא צל ולא זהב. */
  flagged?: boolean;
  href?: string;
  onSelect?: (format: ServiceFormat) => void;
  selectLabelHe?: string;
}

export interface ServiceFormatsProps {
  formats: readonly ServiceFormatSpec[];
  /** לאנליטיקס של `service_format_select`. */
  sourcePage: string;

  id?: string;
  num?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  tone?: BandTone;
  className?: string;
}

/* ═══════════════════ עזרים ═══════════════════ */

/** לכרטיס יש מה לומר? שם לבד הוא הצהרה שהפורמט מוצע, ולא כרטיס. */
function hasBody(f: ServiceFormatSpec): boolean {
  return Boolean(
    f.descriptionHe ||
      f.forWhoHe ||
      f.includes?.length ||
      f.excludes?.length ||
      f.dishes?.length ||
      (typeof f.pricePerPerson === "number" && f.priceNoteHe) ||
      f.noPriceNoteHe,
  );
}

const BULLET_BASE =
"relative m-0 mb-[.5rem] ps-[1.15rem] text-sm text-fg-muted " +
"before:absolute before:top-[.72em] before:h-[5px] before:w-[5px] " +
"before:content-[''] before:[inset-inline-start:0] before:[border-radius:50%]";

/** נכלל: נקודה מלאה באקסנט ב־55%. לא נכלל: טבעת חלולה, אותו משקל בדיוק. */
const BULLET_IN = `${BULLET_BASE} before:bg-accent before:opacity-[.55]`;
const BULLET_OUT = `${BULLET_BASE} before:border before:border-solid before:border-[color:var(--fg-decor)]`;

function BulletList({ items, out }: { items: readonly string[]; out?: boolean }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item, i) => (
        <li key={i} className={out ? BULLET_OUT : BULLET_IN}>
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ═══════════════════ כרטיס ═══════════════════ */

function FormatCard({
  format,
  sourcePage,
}: {
  format: ServiceFormatSpec;
  sourcePage: string;
}) {
  const title = format.titleHe ?? SERVICE_FORMAT_LABEL[format.id];
  const showPrice = typeof format.pricePerPerson === "number" && Boolean(format.priceNoteHe);
  const includes = format.includes ?? [];
  const excludes = format.excludes ?? [];

  const select = () => {
    track("service_format_select", { service_format: format.id, source_page: sourcePage });
    format.onSelect?.(format.id);
  };

  return (
    <article
      className={cn(
"flex flex-col bg-bg p-card",
        /* הכרטיס המסומן: קו כותר של 2px בדיו (§3.4 טכניקה 1), לא צל. */
        format.flagged && "rule-top",
      )}
    >
      {format.kickerHe ? (
        <p
          className={cn(
"eyebrow m-0 mb-[.6rem] max-w-none",
            format.flagged && "text-accent",
          )}
        >
          {format.kickerHe}
        </p>
      ) : null}

      <h3 className="m-0 font-serif text-xl font-medium leading-sub">{title}</h3>

      {showPrice ? (
        <div className="mt-4 border-b border-solid border-b-[color:var(--rule)] pb-[1.3rem]">
          <p className="m-0 max-w-none font-serif text-2xl font-medium">
            <Money value={format.pricePerPerson as number} />
          </p>
          {/* הסייג יושב מיד מתחת ובאותו גודל טיפוס — §7.24 כלל 2. */}
          <p className="m-0 mt-2 max-w-none text-xs text-fg-subtle">{format.priceNoteHe}</p>
        </div>
      ) : format.noPriceNoteHe ? (
        <p className="m-0 mt-4 max-w-none border-b border-solid border-b-[color:var(--rule)] pb-[1.3rem] text-xs text-fg-subtle">
          {format.noPriceNoteHe}
        </p>
      ) : null}

      {format.descriptionHe ? (
        <p className="m-0 mt-5 max-w-none text-sm text-fg-muted">{format.descriptionHe}</p>
      ) : null}

      {format.dishes?.length ? (
        <div className="menu-leaf mt-5">
          <DishList dishes={format.dishes} />
        </div>
      ) : null}

      {includes.length > 0 ? (
        <div className="mt-6">
          <h4 className="m-0 mb-[.6rem] font-sans text-sm font-semibold">מה כלול</h4>
          <BulletList items={includes} />
        </div>
      ) : null}

      {/* עמודת ההחרגות באותו משקל בדיוק. היא לא הערת שוליים — היא מה
          שמקדים את ההתנגדות שהורגת עסקה בשבוע השני (§7.10). */}
      {excludes.length > 0 ? (
        <div className="mt-6">
          <h4 className="m-0 mb-[.6rem] font-sans text-sm font-semibold">מה לא כלול</h4>
          <BulletList items={excludes} out />
        </div>
      ) : null}

      {format.forWhoHe ? (
        <div className="mt-auto pt-[1.6rem]">
          <p className="m-0 max-w-none border-t border-solid border-t-[color:var(--rule)] pt-[1.1rem] text-xs text-fg-subtle">
            {format.forWhoHe}
          </p>
        </div>
      ) : null}

      {format.href || format.onSelect ? (
        <p className="m-0 mt-4 max-w-none">
          <Button
            variant="link"
            href={format.href}
            onClick={format.onSelect ? select : undefined}
          >
            {format.selectLabelHe ?? `בנו תפריט — ${title}`}
          </Button>
        </p>
      ) : null}
    </article>
  );
}

/* ═══════════════════ הבאנד ═══════════════════ */

export function ServiceFormats({
  formats,
  sourcePage,
  id,
  num,
  eyebrow,
  title,
  lede,
  tone = "paper",
  className,
}: ServiceFormatsProps) {
  const visible = formats.filter((f) => f.offered === true && hasBody(f));

  /* אף פורמט מאושר עם תוכן ⇒ אין סקשן, כותרת כלולה. */
  if (visible.length === 0) return null;

  return (
    <BandSection
      id={id}
      num={num}
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      tone={tone}
      className={className}
    >
      {/* המרזבים הם הקווים — §3.4 טכניקה 2. אין צללים ואין מסגרות כפולות. */}
      <div
        className={cn(
"grid gap-px overflow-hidden rounded border border-solid",
"border-[color:var(--rule)] bg-[color:var(--rule)]",
"[grid-template-columns:repeat(auto-fit,minmax(275px,1fr))]",
        )}
      >
        {visible.map((format) => (
          <FormatCard key={format.id} format={format} sourcePage={sourcePage} />
        ))}
      </div>
    </BandSection>
  );
}
