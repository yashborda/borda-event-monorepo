import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    BACKEND_INTERNAL_URL: z.string().url().optional(),
    REVALIDATE_SECRET: z.string().optional(),
  },

  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_ENVIRONMENT: z.enum(['production', 'staging', 'development']),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_AUTH_URL: z.string().default('/api/website/auth/google'),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
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
    BACKEND_INTERNAL_URL: process.env.BACKEND_INTERNAL_URL,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
})
