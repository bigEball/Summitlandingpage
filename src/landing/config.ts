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
 * Where "Open the live demo" goes.
 *
 * TODO: point this at the deployed application before the site goes live. Until
 * it is set, the demo buttons land on the app's sign-in path relative to this
 * site — which does not exist here, so they 404. Set `VITE_APP_URL` in the
 * Netlify environment (or edit the fallback below) to the app's real address,
 * e.g. https://app.summitaisoftware.com/login
 */
export const APP_URL = env.VITE_APP_URL ?? '/login';

/*
 * There is deliberately no API base here. This site posts nothing: the contact
 * form hands the visitor a prefilled email instead, because the application it
 * used to share an origin with now serves its own API as a static mock, and
 * there is no server left to receive a submission. See `ContactForm.tsx`.
 */
