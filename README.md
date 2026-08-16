# Summit Tech — public site

The marketing and legal pages at `summitaisoftware.com`: the landing page, About,
Services, Contact, Privacy, Terms, Accessibility, and the post-submit thank-you
screen. Eight URLs, no application code, no sign-in, no database.

This was extracted from the `dentalai` repository, where it shared a build with
the product. It is now its own deployment.

## Running it

```sh
npm install
cp .env.example .env
npm run dev          # http://localhost:5180
```

`npm run dev` serves the un-prerendered `index.html`, so the page mounts
client-side and every route works through the router. That is the fast loop for
copy and layout work.

## Building it

```sh
npm run build
npm run preview
```

`build` is four steps and all of them matter:

1. `tsc` — typecheck.
2. `vite build` — the browser bundle, plus `sitemap.xml` emitted from the route
   table in `src/landing/seo.ts`.
3. `vite build --ssr` — a Node bundle of the same component tree, into
   `dist-ssr/`. Never served; it exists only for the next step.
4. `node scripts/prerender.mjs` — renders each route through that bundle and
   writes a real HTML file: `dist/index.html`, `dist/about/index.html`, and so
   on, each with its own `<title>`, description and canonical.

Step 4 is the reason the site ranks. Google runs JavaScript and was always fine,
but the answer engines largely do not, and to them a client-rendered SPA is the
same empty `<div id="root">` at all eight URLs. Do not "simplify" the build by
dropping steps 3 and 4 — the pages stop being readable to anything that does not
execute JavaScript.

## The two addresses this site does not own

Both live in `src/landing/config.ts` and both are set from environment
variables, with production values in `netlify.toml`.

| Variable | What it is | If it is wrong |
| --- | --- | --- |
| `VITE_APP_URL` | Where every "Open the live demo" button goes. The demo is the application, which deploys from `dentalai`, not from here. | Demo buttons 404. |
| `VITE_API_BASE` | Origin of the API that takes contact-form submissions (`POST /api/v1/demo-requests`, served by the Express server in `dentalai`). Empty means same-origin, which is what dev wants — `vite.config.ts` proxies `/api` to `localhost:3001`. | The form falls back to handing the visitor a prefilled `mailto:`. Leads still arrive, but by hand. |

**The API server must allow this origin.** It reads a comma-separated
`CORS_ORIGIN` environment variable; `https://summitaisoftware.com` has to be in
it. Nothing in this repository can fix that from this side — a missing entry
shows up as the mailto fallback, not as an error anyone will notice.

## Adding a page

1. Write the component in `src/landing/pages/`, wrapped in `PageShell`.
2. Add a route to `src/Root.tsx`.
3. Add an entry to `SEO_ROUTES` in `src/landing/seo.ts`.

Step 3 is not optional. That table is read by three things that must not
disagree: `useSeo` at runtime, the sitemap plugin in `vite.config.ts`, and the
prerenderer. A route missing from it gets no file, and nothing serves it —
there is no SPA fallback here on purpose, so the URL simply 404s. The
prerenderer throws if the count comes out wrong.

## Why there is no SPA fallback

Every URL is a real file, so Netlify serves it directly. A catch-all rewrite
would only ever match URLs that are *not* pages here, and answering those with
`200` and the home page's markup turns every typo into a soft 404 that crawlers
index. Letting them 404 is correct.

The router still has a `*` route that sends unknown paths home, which covers a
bad in-app link clicked by someone already on the site.

## Layout

```
index.html              the shell — head tags, JSON-LD, noscript styles
netlify.toml            build command, env, cache headers
scripts/
  prerender.mjs         writes the eight HTML files
  og-card.html          source of public/og-image.jpg, rendered by hand
public/                 favicon, logo, og image, robots.txt, llms.txt
src/
  main.tsx              browser entry — hydrates if markup is present
  entry-prerender.tsx   build-time entry
  Root.tsx              the routes
  index.css             tailwind directives
  landing/
    config.ts           VITE_APP_URL and VITE_API_BASE
    company.ts          legal identity — address, phone, SMS consent language
    seo.ts              the route table: titles, descriptions, sitemap
    LandingPage.tsx     the home page
    SiteNav / SiteFooter / PageShell
    DemoFrame.tsx       the product screenshot, drawn rather than photographed
    JarvisCore.tsx      the animated hero object
    ContactForm.tsx     the one thing on the site that posts anywhere
    pages/              About, Services, Contact, Privacy, Terms, …
```

## Things that will bite you

- **`company.ts` is load-bearing for compliance.** The address, phone and SMS
  consent language are what a carrier checks an A2P messaging registration
  against, and they must match the footer and the privacy policy exactly. One
  source, so they cannot drift.
- **`DemoFrame.tsx` is a hand-drawn replica of the real dashboard**, not a
  screenshot. It stays sharp and weighs nothing, but it does not update itself
  when the product's UI changes. Someone has to look at it occasionally.
- **`seo.ts` must not import React or touch the DOM.** `vite.config.ts` imports
  it in plain Node to build the sitemap. The same is true of `company.ts`, which
  `seo.ts` imports — which is why the env-var config lives in `config.ts`
  instead, outside that chain.
- **Trailing slashes.** The pages are prerendered to directories but the
  canonical tags have no trailing slash. `netlify.toml` sets
  `pretty_urls = false` to stop Netlify adding one; verify on the first deploy
  that `/about` stays `/about`.
