/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ReviewStep — התפריט שנבנה, ואז שתי העובדות שהמטבח חייב.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ─── למה סוג האירוע והעיר יושבים **כאן** ולא במסך פרטי הקשר ─────
 * חוק סדר השדות של `quote-builder`: מיון לפי (ערך המידע למטבח) ÷ (סיכון
 * נתפס לקונה), יורד — ולעולם לא שדה מזהה מעל שדה שאינו מזהה. סוג אירוע
 * ועיר אינם מזהים איש, והם שני הנתונים שקובעים אם ההזמנה בכלל אפשרית.
 * הם גם השדות היחידים בזרימה שמותר לשלוח כטיוטה, ולכן נטישה כאן עדיין
 * מייצרת שורה שימושית. שם וטלפון נשאלים אחריהם, פעם אחת, במסך האחרון.
 *
 * ─── כסף ────────────────────────────────────────────────────────
 * הסיכום הוא המקום המפתה ביותר באתר לשים בו סכום, ולכן `price` מגיע
 * לכאן **מוכן** מ־`priceSelection()` היחיד — הקומפוננטה אינה קוראת
 * מחירון ואינה מחשבת דבר. `null` היום, ולכן אין כאן שורת «סה״כ», אין
 * «יחושב בהמשך» ואין מסגרת ריקה במקומה.
 *
 * מה שכן יש: התפריט עצמו, כתוב מלא. זה מה שהמבקר בנה, וזה שלם.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, Money, Num, RadioCard, RadioCardGroup, TextInput } from "@/components/primitives";
import { eventTypeOptions } from "@/components/quote";
import type { CategoryId, PricedSelection, ResolvedSelection } from "@/content/packages";
import { COPY } from "./copy";

export interface ReviewStepProps {
  resolved: ResolvedSelection | null;
  price: PricedSelection | null;
  eventType: string | null;
  onEventType(value: string): void;
  area: string;
  onArea(value: string): void;
  /** האם להציע «אירוח אצלנו במסעדה». מקורו קיבולת שנמסרה — היום false. */
  offerAtRestaurant?: boolean;
  onEditCategory(categoryId: CategoryId): void;
  onEditGuests(): void;
  errors?: { eventType?: string; area?: string };
  headingId: string;
  className?: string;
}

export function ReviewStep({
  resolved,
  price,
  eventType,
  onEventType,
  area,
  onArea,
  offerAtRestaurant = false,
  onEditCategory,
  onEditGuests,
  errors,
  headingId,
  className,
}: ReviewStepProps) {
  const options = React.useMemo(() => eventTypeOptions(offerAtRestaurant), [offerAtRestaurant]);
  const lines = resolved?.categories.filter((line) => line.count > 0) ?? [];

  return (
    <div className={cn("grid gap-6", className)}>
      <h3
        id={headingId}
        data-step-heading=""
        tabIndex={-1}
        className="text-xl font-bold leading-sub outline-none"
      >
        {COPY.reviewHeading}
      </h3>

      {/* ── כותרת הבנייה ─────────────────────────────────────── */}
      {resolved ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold">{resolved.pkg.nameHe}</span>
          {resolved.guestCount !== null ? (
            <span className="text-fg-muted">
              <Num inline>{resolved.guestCount}</Num>{" "}
              {resolved.guestCount === 1 ? "סועד" : "סועדים"}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onEditGuests}
            className="min-h-[44px] text-xs text-accent underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
          >
            {COPY.edit}
            <span className="sr-only"> · {COPY.guestsLabel}</span>
          </button>
        </div>
      ) : null}

      {/* ── התפריט ────────────────────────────────────────────── */}
      {lines.length > 0 ? (
        <div className="grid gap-5 rounded-lg border border-solid border-rule bg-bg-form p-card">
          {lines.map((line) => (
            <div key={line.category.id} className="grid gap-[.5rem]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-bold">{line.category.nameHe}</h4>
                <span className="flex items-center gap-3 text-xs text-fg-subtle">
                  <span>
                    נבחרו <Num inline>{line.count}</Num> מתוך <Num inline>{line.quota}</Num>
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditCategory(line.category.id)}
                    className="min-h-[44px] text-accent underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
                  >
                    {COPY.edit}
                    <span className="sr-only"> · {line.category.nameHe}</span>
                  </button>
                </span>
              </div>
              <ul className="m-0 grid list-none gap-[.15rem] p-0 text-sm leading-dish">
                {line.dishes.map((dish) => (
                  <li key={dish.id}>{dish.nameHe}</li>
                ))}
              </ul>
            </div>
          ))}

          {/*
            הבלוק היחיד שיכול להציג סכום. הסייג מעל המספר, באותו גודל
            ואותו משקל — spec 02 §2.3. היום כולו אינו קיים.
          */}
          {price ? (
            <div className="grid gap-2 border-t border-solid border-rule pt-4">
              <p className="max-w-body text-sm font-medium leading-sub">{price.qualifier}</p>
              <p className="text-xl font-bold">
                <Money value={price.total} />
              </p>
              <p className="max-w-body text-xs text-fg-subtle">{price.vatLine}</p>
              <p className="max-w-body text-xs text-fg-subtle">
                מבוסס על מחירון <span className="num-inline">{price.approvedAt}</span>. הערכה
                בלבד ואינה הצעה מחייבת. המחיר הסופי ייקבע בהצעה בכתב לאחר בירור פרטי האירוע.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── סוג האירוע ────────────────────────────────────────── */}
      <RadioCardGroup
        id="cfg-event-type"
        legend={COPY.eventTypeLegend}
        error={errors?.eventType}
        variant="chip"
      >
        {options.map((option) => (
          <RadioCard
            key={option.value}
            variant="chip"
            name="cfg-event-type"
            value={option.value}
            checked={eventType === option.value}
            onChange={() => onEventType(option.value)}
            label={option.label}
          />
        ))}
      </RadioCardGroup>

      {/* ── עיר האירוע ────────────────────────────────────────── */}
      <Field
        id="cfg-area"
        label={COPY.areaLabel}
        hint={COPY.areaHint}
        error={errors?.area}
        required
        className="max-w-lede"
      >
        {(control) => (
          <TextInput
            {...control}
            kind="text"
            autoComplete="address-level2"
            value={area}
            maxLength={60}
            onChange={(e) => onArea(e.target.value)}
          />
        )}
      </Field>
    </div>
  );
}
