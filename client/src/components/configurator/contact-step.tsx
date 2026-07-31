/**
 * ═══════════════════════════════════════════════════════════════════════
 *  ContactStep — המסך היחיד בזרימה שנוגע במידע אישי.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ‎`name`, `phone` ו־`email` חיים במצב מקומי **של הקומפוננטה הזאת בלבד**.
 * הם אינם עוברים ל־`useConfigurator`, אינם נשמרים ב־sessionStorage
 * ואינם נשלחים ל־`/api/draft`. זה לא סגנון — זה מה שמונע כתיבה שקטה של
 * מידע אישי לטבלת טיוטות שאמורה להיות נקייה ממנו, וזה גם מדוע הסכימה
 * בשרת היא `.strict()`.
 *
 * הבלוקים המשפטיים מגיעים מ־`components/quote/legal-blocks` ולא נכתבים
 * מחדש: הודעת האיסוף, נוסח ההסכמה השיווקית וגרסאות הנוסח חייבים להיות
 * זהים בכל נקודת איסוף באתר, אחרת אי אפשר להוכיח שנה אחר כך מה בדיוק
 * הוצג למי שסימן את התיבה.
 *
 * ─── מלכודת הספאם ───────────────────────────────────────────────
 * ‎`company_website` נשאר ריק אצל אדם. הוא `tabIndex={-1}`,
 * ‎`aria-hidden` ומחוץ לזרימה — לא `display:none`, כי בוטים מסוימים
 * מדלגים על שדות מוסתרים ב־CSS.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, Field, RadioCard, RadioCardGroup, TextInput } from "@/components/primitives";
import {
  CollectionNotice,
  MarketingConsent,
  ReassuranceLines,
  TermsStrip,
} from "@/components/quote";
import { PHONE, telLink } from "@/content/business";
import { COPY } from "./copy";

export interface ContactValues {
  name: string;
  phone: string;
  email: string;
  channel: "whatsapp" | "phone";
  consentMarketing: boolean;
  honeypot: string;
}

export const EMPTY_CONTACT: ContactValues = {
  name: "",
  phone: "",
  email: "",
  channel: "whatsapp",
  consentMarketing: false,
  honeypot: "",
};

export interface ContactStepProps {
  values: ContactValues;
  onChange(patch: Partial<ContactValues>): void;
  errors?: Partial<Record<"name" | "phone" | "email", string>>;
  submitError?: string | null;
  sending?: boolean;
  onWhatsApp(): void;
  headingId: string;
  className?: string;
}

export function ContactStep({
  values,
  onChange,
  errors,
  submitError,
  sending = false,
  onWhatsApp,
  headingId,
  className,
}: ContactStepProps) {
  const [emailOpen, setEmailOpen] = React.useState(values.email.length > 0);

  return (
    <div className={cn("grid max-w-lede gap-5", className)}>
      <h3
        id={headingId}
        data-step-heading=""
        tabIndex={-1}
        className="text-xl font-bold leading-sub outline-none"
      >
        {COPY.contactLegend}
      </h3>

      <Field id="cfg-name" label={COPY.nameLabel} error={errors?.name} required>
        {(control) => (
          <TextInput
            {...control}
            kind="name"
            value={values.name}
            maxLength={80}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        )}
      </Field>

      <Field id="cfg-phone" label={COPY.phoneLabel} error={errors?.phone} required>
        {(control) => (
          <TextInput
            {...control}
            kind="phone"
            value={values.phone}
            maxLength={25}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        )}
      </Field>

      {/* המייל אינו שדה שלישי במסך. הוא נחשף רק למי שרוצה אותו — שדה
          רשות פתוח מוסיף חיכוך נתפס בלי להוסיף לידים. */}
      {emailOpen ? (
        <Field id="cfg-email" label={COPY.emailLabel} error={errors?.email}>
          {(control) => (
            <TextInput
              {...control}
              kind="email"
              value={values.email}
              maxLength={120}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          )}
        </Field>
      ) : (
        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          className="min-h-[44px] justify-self-start text-xs text-accent underline decoration-rule underline-offset-[.22em] hover:decoration-accent"
        >
          {COPY.emailReveal}
        </button>
      )}

      <RadioCardGroup id="cfg-channel" legend={COPY.channelLegend} variant="chip">
        <RadioCard
          variant="chip"
          name="cfg-channel"
          value="whatsapp"
          checked={values.channel === "whatsapp"}
          onChange={() => onChange({ channel: "whatsapp" })}
          label={COPY.channelWa}
        />
        <RadioCard
          variant="chip"
          name="cfg-channel"
          value="phone"
          checked={values.channel === "phone"}
          onChange={() => onChange({ channel: "phone" })}
          label={COPY.channelPhone}
        />
      </RadioCardGroup>

      <MarketingConsent
        checked={values.consentMarketing}
        onChange={(v) => onChange({ consentMarketing: v })}
      />

      {/* מלכודת. מחוץ לזרימה ולעץ הנגישות, ולא מוסתרת ב־display:none. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cfg-company-website">Company website</label>
        <input
          id="cfg-company-website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.honeypot}
          onChange={(e) => onChange({ honeypot: e.target.value })}
        />
      </div>

      {submitError ? (
        <p role="alert" className="max-w-body text-sm text-danger">
          {submitError}
        </p>
      ) : null}

      <div className="grid gap-3">
        <Button type="submit" fullWidth loading={sending}>
          {COPY.submit}
        </Button>
        <Button type="button" variant="wa" fullWidth onClick={onWhatsApp}>
          {COPY.submitWa}
        </Button>
        <Button variant="link" href={telLink()} className="justify-self-center">
          {PHONE.display}
        </Button>
      </div>

      <ReassuranceLines />
      <CollectionNotice />
      <TermsStrip />
    </div>
  );
}
