import { defineConfig } from 'astro/config';
import editableRegions from '@cloudcannon/editable-regions/astro-integration';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.signatureluxeevents.com',
  output: 'static',
  trailingSlash: 'never',
  publicDir: '../../public',
  integrations: [editableRegions()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'directory',
  },
});
