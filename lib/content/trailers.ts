import { readJsonCollection } from './collection-files'
import { trailerSchema, type Trailer } from './schemas'

let trailerCache: Trailer[] | undefined

export function getAllTrailers(): Trailer[] {
  return trailerCache ??= readJsonCollection('trailers', trailerSchema)
    .filter((trailer) => !trailer.draft)
    .sort((a, b) => a.order - b.order)
}

export function getTrailerBySlug(slug: string): Trailer | undefined {
  return getAllTrailers().find((trailer) => trailer.slug === slug)
}
