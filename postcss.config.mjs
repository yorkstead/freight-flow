/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 uses this single PostCSS plugin.
    // No tailwind.config.js needed — configuration is done in CSS.
    "@tailwindcss/postcss": {},
  },
};

export default config;
