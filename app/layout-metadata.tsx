import { metadata } from './metadata'

export { metadata }

/**
 * This is a server component that exports the metadata for the application.
 * It's separate from layout.tsx because layout.tsx is a client component
 * which cannot directly export metadata.
 */
export default function LayoutMetadata() {
  return null
} 