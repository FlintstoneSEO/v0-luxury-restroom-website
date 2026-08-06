import { describe, expect, it } from 'vitest'

import footer from '@/content/site/footer.json'
import { business, localBusinessJsonLd, organizationJsonLd } from '@/lib/seo-schema'

describe('business identity schema', () => {
  const publicProfileUrls = footer.socials.map(({ href }) => href)

  it('uses the footer profile links as the sameAs source', () => {
    expect(business.sameAs).toEqual(publicProfileUrls)
    expect(business.sameAs).toContainEqual(expect.stringContaining('google.com/maps/'))
  })

  it.each([
    ['Organization', organizationJsonLd()],
    ['LocalBusiness', localBusinessJsonLd()],
  ])('emits every public profile URL in %s JSON-LD', (_schemaType, schema) => {
    expect(schema.sameAs).toEqual(publicProfileUrls)
  })
})
