import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {},

  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_ENVIRONMENT: z.enum(['production', 'staging', 'development']),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_AUTH_URL: z.string().default('/api/admin/auth/google'),
    // When set (e.g. http://localhost:3002 in dev), large-file uploads (videos)
    // POST directly to the backend instead of going through the Next.js dev
    // rewrite proxy, which buffers and drops multipart bodies over a certain
    // size with a "Request aborted" error. Empty/unset = use proxy (same-origin
    // /api paths). Backend CORS already allows the admin origin.
    NEXT_PUBLIC_BACKEND_DIRECT_URL: z.string().default(''),
  },

  /*
   * Specify what values should be validated by your schemas above.
   *
   * If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
   * For Next.js >= 13.4.4, you can use the experimental__runtimeEnv option and
   * only specify client-side variables.
   */
  runtimeEnv: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GOOGLE_AUTH_URL: process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL,
    NEXT_PUBLIC_BACKEND_DIRECT_URL: process.env.NEXT_PUBLIC_BACKEND_DIRECT_URL,
  },
})
