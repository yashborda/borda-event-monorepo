import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3002),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  // Opt-in TLS for hosted Postgres (Neon/Supabase/Render Postgres/RDS).
  // Defaults to off for local Postgres which usually has SSL disabled.
  DB_SSL: z.string().optional(),

  WEBSITE_JWT_ACCESS_SECRET: z.string().min(32),
  WEBSITE_JWT_REFRESH_SECRET: z.string().min(32),
  ADMIN_JWT_ACCESS_SECRET: z.string().min(32),
  ADMIN_JWT_REFRESH_SECRET: z.string().min(32),

  WEBSITE_GOOGLE_CLIENT_ID: z.string().optional(),
  WEBSITE_GOOGLE_CLIENT_SECRET: z.string().optional(),
  WEBSITE_GOOGLE_CALLBACK_URL: z.string().url().optional(),

  ADMIN_GOOGLE_CLIENT_ID: z.string().optional(),
  ADMIN_GOOGLE_CLIENT_SECRET: z.string().optional(),
  ADMIN_GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Google Drive media storage — OAuth as the human owner of the Drive folder.
  // Service-account auth doesn't work on personal (non-Workspace) Drives.
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_DRIVE_ROOT_FOLDER_ID: z.string().optional(),
  // Legacy: kept for backward compat but the OAuth flow above is preferred.
  GOOGLE_DRIVE_KEY_FILE: z.string().optional(),

  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().default(465),
  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_FROM: z.string(),

  APP_URL: z.string().url().default('http://localhost:3002'),
  WEBSITE_URL: z.string().url(),
  ADMIN_URL: z.string().url(),
  WEBSITE_REVALIDATE_URL: z.string().url().optional(),
  WEBSITE_REVALIDATE_SECRET: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .transform((v) => v === 'true')
    .pipe(z.boolean())
    .default(false),
});

export type Env = z.infer<typeof envSchema>;

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          const messages = Object.entries(errors)
            .map(([key, errs]) => `${key}: ${(errs ?? []).join(', ')}`)
            .join('\n');
          throw new Error(`Environment validation failed:\n${messages}`);
        }
        return result.data;
      },
    }),
  ],
})
export class ConfigModule {}
