import { readJsonCollection } from './collection-files'
import { eventTypeSchema, type EventType } from './schemas'

let eventTypeCache: EventType[] | undefined

export function getAllEventTypes(): EventType[] {
  return eventTypeCache ??= readJsonCollection('event-types', eventTypeSchema).filter((entry) => !entry.draft)
}

export function getEventTypeBySlug(slug: string): EventType | undefined {
  return getAllEventTypes().find((entry) => entry.slug === slug)
}

export function getEventTypeOrThrow(slug: string): EventType {
  const entry = getEventTypeBySlug(slug)
  if (!entry) throw new Error(`Missing event type content: ${slug}`)
  return entry
}
