import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { COMPANY, SMS_CONSENT_LABEL, SMS_DISCLOSURE } from './company';
import { proseLink } from './prose';

const EMPTY = { name: '', email: '', practice: '', phone: '', message: '' };

const isEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

/**
 * Everything the visitor typed, as an email addressed and written for them.
 *
 * This site is static and has no backend to post to — the application it used
 * to share an origin with now serves its API as a mock, and there is nothing
 * left to receive a form. So the last step happens in the visitor's own mail
 * client rather than over the wire.
 *
 * The trade is deliberate and worth stating plainly: a lead only arrives if the
 * visitor actually presses send in their email app, and nothing on our side
 * records the ones who do not. What it buys is that no enquiry can be lost to a
 * server being down, a CORS header being wrong, or a database nobody set up —
 * the failure modes that were live the moment this became a separate
 * deployment. Swap this for Netlify Forms when automatic capture matters more
 * than having zero infrastructure.
 *
 * `source` rides along in the body so a lead says which page it came from.
 */
function composeEmail(form: typeof EMPTY, smsConsent: boolean, source: string) {
  const body = [
    `Name: ${form.name}`,
    `Practice: ${form.practice}`,
    `Email: ${form.email}`,
    form.phone ? `Phone: ${form.phone}` : null,
    // The privacy policy promises a timestamped record of every opt-in. With no
    // database to write one to, the email itself is that record — which is why
    // the consent line is stated in full rather than as a bare "yes".
    smsConsent
      ? `SMS consent: yes — opted in on the ${source} page at ${new Date().toISOString()}`
      : null,
    `Source: ${source}`,
    '',
    form.message || '(no message)',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(
    `Demo request — ${form.practice || form.name}`,
  )}&body=${encodeURIComponent(body)}`;
}

const field =
  'w-full rounded-lg border border-[#c8d5e6] bg-white px-3 py-2.5 text-[16px] text-[#0a1628] outline-none transition placeholder:text-[#8695ab] focus:border-[#0b6bcb] focus:ring-2 focus:ring-[#0b6bcb]/20';
const label = 'mb-1.5 block text-[15px] font-medium text-[#0a1628]';

export default function ContactForm({ source = 'contact' }: { source?: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const handoffRef = useRef<HTMLDivElement>(null);

  // The form is replaced rather than added to, so focus has to be moved by hand
  // or a keyboard or screen-reader user is left on a control that no longer
  // exists and hears nothing about what happened.
  useEffect(() => {
    if (ready) handoffRef.current?.focus();
  }, [ready]);

  function set(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.practice.trim()) {
      setError('Name, email, and practice are required.');
      return;
    }
    if (!isEmail(form.email)) {
      setError('Enter a valid email.');
      return;
    }
    // Consent to be texted at a number we do not have is not consent.
    if (smsConsent && !form.phone.trim()) {
      setError('To consent to text messages, please provide a phone number.');
      return;
    }

    setReady(true);
  }

  // Validated, and now written as an email for them to send. Not an error state
  // — this is how the form works — so it is announced politely rather than
  // interrupting, and it is worded as the next step rather than a failure.
  if (ready) {
    return (
      <div
        ref={handoffRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-[#d8e1ed] bg-white p-6 shadow-[0_1px_2px_rgba(10,22,40,0.04)] outline-none sm:p-8"
      >
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#0a1628]">
          One last step — send it from your email.
        </h2>
        <p className="mt-3 text-[16px] leading-7 text-[#4a5b73]">
          We do not store messages on this site, so the send happens in your own email app.
          Everything you typed is already written into it — open it and press send.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <a
            href={composeEmail(form, smsConsent, source)}
            /* No `preventDefault` — the browser hands the mailto to the mail
               client and the page stays put, so the route change is safe to do
               alongside it. */
            onClick={() => navigate('/thank-you')}
            className="summit-cta summit-cta-primary inline-flex items-center gap-2 rounded-full bg-[#0a1628] px-6 py-3 text-[16px] font-medium tracking-tight text-white"
          >
            Open my email
            <ArrowRight className="summit-cta-arrow h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setReady(false)}
            className="text-[16px] font-medium text-[#0a1628] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Back to the form
          </button>
        </div>

        <p className="mt-6 text-[15px] leading-6 text-[#5d6b80]">
          If that button does nothing, this browser has no mail app set up. Reach us at{' '}
          <a href={`mailto:${COMPANY.email}`} className={proseLink}>
            {COMPANY.email}
          </a>{' '}
          and{' '}
          <a href={`tel:${COMPANY.phone.replace(/[^+\d]/g, '')}`} className={proseLink}>
            {COMPANY.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-[#d8e1ed] bg-white p-6 shadow-[0_1px_2px_rgba(10,22,40,0.04)] sm:p-8"
    >
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-[15px] text-red-700"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={label}>
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            maxLength={200}
            value={form.name}
            onChange={set}
            aria-required="true"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="contact-practice" className={label}>
            Office/Practice Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-practice"
            name="practice"
            type="text"
            maxLength={200}
            value={form.practice}
            onChange={set}
            aria-required="true"
            className={field}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className={label}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            maxLength={320}
            value={form.email}
            onChange={set}
            aria-required="true"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className={label}>
            Phone
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            maxLength={40}
            value={form.phone}
            onChange={set}
            className={field}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="contact-message" className={label}>
          What can we help with?
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          maxLength={2000}
          value={form.message}
          onChange={set}
          placeholder="For example: notes after hygiene visits, missed calls, pre-auth tracking, claims, or front desk workload."
          className={`${field} resize-none`}
        />
      </div>

      {/* Unchecked by default and never pre-ticked — an A2P campaign is
          rejected if consent is bundled into the submit button. */}
      <label className="mt-5 flex items-start gap-3 text-[15px] leading-6 text-[#4a5b73]">
        <input
          type="checkbox"
          name="smsConsent"
          checked={smsConsent}
          onChange={(event) => setSmsConsent(event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-[#c8d5e6] accent-[#0b6bcb]"
        />
        <span>{SMS_CONSENT_LABEL}</span>
      </label>

      <p className="mt-4 text-[13px] leading-5 text-[#5d6b80]">
        By submitting this form you agree to our{' '}
        <Link to="/privacy" className={proseLink}>
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="/terms" className={proseLink}>
          Terms of Service
        </Link>
        .
      </p>

      <button
        type="submit"
        className="summit-cta summit-cta-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a1628] px-5 py-3.5 text-[16px] font-medium tracking-tight text-white"
      >
        Send message
        <ArrowRight className="summit-cta-arrow h-4 w-4" />
      </button>

      <p className="mt-4 text-[13px] leading-5 text-[#5d6b80]">{SMS_DISCLOSURE}</p>
    </form>
  );
}
