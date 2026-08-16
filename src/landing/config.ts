/**
 * The one address this site does not own.
 *
 * The marketing site used to live inside the application's build, so the demo
 * was an ordinary router link. Split into its own deployment, it crosses an
 * origin boundary and has to be spelled out.
 *
 * Deliberately not in `company.ts`: that file is imported by `seo.ts`, which
 * `vite.config.ts` imports in plain Node to emit the sitemap. `import.meta.env`
 * does not exist there, so anything reading it has to stay out of that chain.
 */

/* Vite replaces `import.meta.env` at build time. The fallback is for any
   context that evaluates this module without Vite's define step. */
const env: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

/**
 * Where "Open the live demo" goes — the single most expensive link on the site
 * to get wrong, since the demo is the whole pitch of the page.
 *
 * Production sets this in `netlify.toml`. The fallback is relative on purpose:
 * `npm run dev` with no `.env` then behaves the way the page did when it lived
 * inside the application, which is the least surprising thing for someone
 * running it locally for the first time.
 */
export const APP_URL = env.VITE_APP_URL ?? '/login';

/*
 * There is deliberately no API base here. This site posts nothing: the contact
 * form hands the visitor a prefilled email instead, because the application it
 * used to share an origin with now serves its own API as a static mock, and
 * there is no server left to receive a submission. See `ContactForm.tsx`.
 */
