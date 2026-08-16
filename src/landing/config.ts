/**
 * The two addresses this site does not own.
 *
 * The marketing site used to live inside the application's build, so the demo
 * was a router link and the contact form posted to a same-origin path. Split
 * into its own deployment, both of those cross an origin boundary and have to
 * be spelled out.
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

/**
 * Origin of the API that takes contact-form submissions — the Express server
 * in the `dentalai` repository, which owns `/api/v1/demo-requests`.
 *
 * Empty means same-origin, which is what `npm run dev` wants: the Vite proxy
 * below forwards `/api` to localhost:3001. In production it must be the
 * absolute origin of the API server, and that server's `CORS_ORIGIN` must list
 * this site — otherwise the browser blocks the POST and the form falls back to
 * handing the visitor a prefilled mailto.
 */
export const API_BASE = env.VITE_API_BASE ?? '';

/** True when `APP_URL` leaves this origin, and the link needs a real navigation. */
export const APP_IS_EXTERNAL = /^https?:\/\//.test(APP_URL);
