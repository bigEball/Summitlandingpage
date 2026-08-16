import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import AboutPage from './landing/pages/AboutPage';
import ServicesPage from './landing/pages/ServicesPage';
import ContactPage from './landing/pages/ContactPage';
import ThankYouPage from './landing/pages/ThankYouPage';
import PrivacyPage from './landing/pages/PrivacyPage';
import TermsPage from './landing/pages/TermsPage';
import AccessibilityPage from './landing/pages/AccessibilityPage';
import { useSeo } from './landing/useSeo';
import { APP_URL } from './landing/config';

/**
 * Everything inside the router, shared by the two entry points.
 *
 * `main.tsx` mounts this under a `BrowserRouter` in the browser and
 * `entry-prerender.tsx` renders it under a `StaticRouter` during the build.
 * Hydration compares the two trees node for node, so they have to be the same
 * tree — a component present in one and missing from the other is enough to
 * make React throw the prerendered markup away and re-render from scratch,
 * which is the exact cost prerendering was meant to avoid.
 */

function HomeRoute() {
  const navigate = useNavigate();
  // The landing page builds its own chrome instead of sitting in `PageShell`,
  // so it asks for its head entries directly.
  useSeo();
  return (
    <LandingPage
      /* No `onDemoClick`. The demo lives in the application's deployment, not
         this one, so the click has to be a real navigation off this origin —
         handing it to the router would look for a `/login` route that does not
         exist here and render nothing. */
      demoHref={APP_URL}
      onNavigate={(to, event) => {
        event.preventDefault();
        navigate(to);
      }}
    />
  );
}

export default function Root() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />

      {/* Every link in the site footer resolves here — a dead Privacy Policy
          link fails an A2P SMS registration. */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/accessibility" element={<AccessibilityPage />} />

      {/* Anything else is not a page on this site. Sending it home rather than
          rendering an empty router keeps a mistyped URL on something real. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
