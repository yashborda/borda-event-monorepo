import { parseAsInteger, parseAsString } from 'nuqs/server'

// Shared between BlogSearchInput (client) and blog listing pages (server via createLoader).
// Import createLoader from 'nuqs/server' in server components.
export const blogSearchParsers = {
  search: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
}
