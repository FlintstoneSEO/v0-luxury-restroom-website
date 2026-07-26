import serviceAreaIndex from '@/content/pages/service-areas.json'
import resourceIndex from '@/content/pages/resources.json'
import { resourceIndexSchema, serviceAreaIndexSchema } from './schemas'
export const getServiceAreaIndex = () => serviceAreaIndexSchema.parse(serviceAreaIndex)
export const getResourceIndex = () => resourceIndexSchema.parse(resourceIndex)
