// @ts-check
import { defineConfig } from 'astro/config';

// The site is served from tavishhanda.github.io/portfolio until a custom domain
// is set up. When it is, change `site` to the domain and delete `base`.
export default defineConfig({
  site: 'https://tavishhanda.github.io',
  base: '/portfolio',
});
