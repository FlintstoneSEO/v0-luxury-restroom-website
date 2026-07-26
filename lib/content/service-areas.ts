import { readJsonCollection } from './collection-files'
import { serviceAreaSchema, type ServiceArea } from './schemas'

let serviceAreaCache: ServiceArea[] | undefined
export function getAllServiceAreas(): ServiceArea[] {
  return serviceAreaCache ??= readJsonCollection('service-areas', serviceAreaSchema).filter((area) => !area.draft)
}
export function getServiceAreaBySlug(slug: string): ServiceArea | undefined {
  return getAllServiceAreas().find((area) => area.slug === slug)
}
