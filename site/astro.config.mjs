import { defineConfig } from 'astro/config';

// https://astro.build/config
// Deployed to cyc.inquiry.institute (dedicated subdomain for The Encyclopædia)
export default defineConfig({
  site: 'https://cyc.inquiry.institute',
  base: '/',  // Root path since we have a dedicated subdomain
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
        },
      },
    },
  },
});
