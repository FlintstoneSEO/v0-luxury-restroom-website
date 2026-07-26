import gallery from '@/content/pages/gallery.json'
import { galleryPageSchema } from './schemas'

export function getGalleryPage() {
  return galleryPageSchema.parse(gallery)
}
