import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    'apps/web/dist/**',
    'apps/web/.astro/**',
    'coverage/**',
    'supabase/.temp/**',
  ]),
])
