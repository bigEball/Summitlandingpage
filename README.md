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

## The one address this site does not own

`VITE_APP_URL`, read in `src/landing/config.ts`, set for production in
`netlify.toml`. It is where every "Open the live demo" button goes — the demo is
the application, which deploys from `dentalai`, not from here. Set it wrong and
the demo buttons 404, which is the single most expensive thing that can break on
this site.

It currently points at `https://summitaisoftware.com/login`, which is where the
application answers today.

**That value has an expiry date.** The intended end state is this site at
`summitaisoftware.com` and the application somewhere else. The moment apex DNS
points here, `summitaisoftware.com/login` resolves to *this* site — which has no
`/login` — and every demo button breaks. Move the application and change this
URL in the same deploy, not in two.

## The contact form does not post anywhere

It validates, then hands the visitor an email addressed to
`contact@summitaisoftware.com` with everything they typed already written into
the body. No `fetch`, no backend, no CORS.

This is a deliberate trade, not a stopgap that was never finished. The
application's own deployment serves `/api/*` as a static mock — there is no
server left to receive a submission — so the alternative was a form that posts
into nothing. What it costs: a lead only arrives if the visitor actually presses
send in their mail client, and nothing here records the ones who abandon. What
it buys: no enquiry can be lost to a server being down, a CORS header being
wrong, or a database nobody set up.

**Switch to Netlify Forms when automatic capture starts mattering more than
having zero infrastructure.** That is a change to `ContactForm.tsx` and a
`netlify` attribute on the `<form>`; nothing else in the repo assumes anything
about how leads travel.

One thing to preserve if you do switch: the SMS opt-in. The privacy policy
promises a timestamped record of every consent, and right now the email body
*is* that record — it states when and on which page the box was ticked. Whatever
replaces it has to keep storing that.

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
    config.ts           VITE_APP_URL — where the demo lives
    company.ts          legal identity — address, phone, SMS consent language
    seo.ts              the route table: titles, descriptions, sitemap
    LandingPage.tsx     the home page
    SiteNav / SiteFooter / PageShell
    DemoFrame.tsx       the product screenshot, drawn rather than photographed
    JarvisCore.tsx      the animated hero object
    ContactForm.tsx     composes a mailto — see above, it posts nowhere
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
