import navigation from '@/content/site/navigation.json'
import footer from '@/content/site/footer.json'
import business from '@/content/site/business.json'
import seoDefaults from '@/content/site/seo-defaults.json'
import {
  businessSchema, footerSchema, navigationSchema, seoDefaultsSchema,
} from './schemas'

const settings = {
  navigation: navigationSchema.parse(navigation),
  footer: footerSchema.parse(footer),
  business: businessSchema.parse(business),
  seo: seoDefaultsSchema.parse(seoDefaults),
}

export function getSiteSettings() {
  return settings
}
