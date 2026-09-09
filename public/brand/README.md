# FreightFlow identity

Original vector F/forward-arrow mark using cyan (#22d3ee), ink (#071014), and the existing dark app surface (#0b0e12). Created directly as SVG for sharp small-size rendering.

- freightflow-mark.svg: scalable app mark; matches src/app/icon.svg.
- freightflow-logo.svg / .png: dark-surface wordmark for presentations and sales material.
- ../icons: 32px favicon export, 192px and 512px app icons, 180px Apple touch icon, and a separately padded 512px maskable icon.

Regenerate exports with `node scripts/generate-icons.mjs` (uses the installed Sharp package).

The web manifest uses standalone mode. A production-only service worker caches the static offline screen, not shipment data or API responses. An internet connection is required for operational work. Worker updates activate after existing app windows close.

Install from the browser's Install app menu in supporting desktop/Android browsers, or Share → Add to Home Screen on iOS. Hosting must use HTTPS (localhost is allowed for testing).

Local verification: production build, lint, icon dimensions, Chromium installability, service-worker control, offline navigation and reconnect. Physical-device installation and a deployed HTTPS origin must be checked separately.

The stricter app-wide browser check also catches intermittent React hydration errors in the existing demo. The dashboard computes relative times with Date.now() during rendering while its initial HTML is built statically. Investigate the demo clock before claiming an error-free presentation. This is separate from the passing installability and offline checks.
