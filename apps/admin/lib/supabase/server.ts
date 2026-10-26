import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cookieOptions, publicConfig } from './config'

export async function createClient() {
  const store = await cookies()
  const { url, key } = publicConfig()
  return createServerClient(url, key, {
    cookieOptions,
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Server Components cannot write cookies. Proxy refreshes them first.
        }
      },
    },
  })
}
