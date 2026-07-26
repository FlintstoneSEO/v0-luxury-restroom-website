import routes from '@/content/site/routes.json'
import seoDefaults from '@/content/site/seo-defaults.json'
import { getAllServiceAreas } from '@/lib/content/service-areas'

export const siteUrl = seoDefaults.canonicalOrigin
export const finalRoutes = routes.routes
export const cityPages = getAllServiceAreas().map(({ slug, city }) => ({ slug, city }))
