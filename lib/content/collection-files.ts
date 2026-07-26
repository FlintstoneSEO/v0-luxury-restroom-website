import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { z } from 'zod'

export function readJsonCollection<Schema extends z.ZodTypeAny>(
  directory: string,
  schema: Schema,
): Array<z.output<Schema>> {
  const collectionPath = join(process.cwd(), 'content', directory)
  return readdirSync(collectionPath)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => {
      const path = join(collectionPath, file)
      try {
        return schema.parse(JSON.parse(readFileSync(path, 'utf8')))
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Invalid content file ${path}: ${message}`)
      }
    })
}
