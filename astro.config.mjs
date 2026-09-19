import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.dadoune.com',
  // Pages are still written as contact/index.html; this only decides the URLs
  // Astro emits for canonical tags, og:url and the sitemap. A CloudFront
  // function resolves the slash-less form at the edge, so what is advertised
  // and what is served agree. See infra/functions/canonical-urls.js.
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
