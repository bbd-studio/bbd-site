import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // www subdomain — apex bbd.sh is currently CF-flagged (suspected phishing
  // interstitial), so canonical / sitemap URLs must use www to be reachable.
  site: 'https://www.bbd.sh',
  integrations: [tailwind(), sitemap(), mdx()],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
