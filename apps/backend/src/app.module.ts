import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { MailModule } from './mail/mail.module.js';
import { HealthModule } from './health/health.module.js';
import { WebsiteAuthModule } from './auth/website/website-auth.module.js';
import { AdminAuthModule } from './auth/admin/admin-auth.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { RolesModule } from './roles/roles.module.js';
import { AdminUsersModule } from './admin-users/admin-users.module.js';
import { WebsiteUsersModule } from './website-users/website-users.module.js';
import { UploadModule } from './upload/upload.module.js';
import { BlogsModule } from './blogs/blogs.module.js';
import { BlogCategoriesModule } from './blog-categories/blog-categories.module.js';
import { BlogAuthorsModule } from './blog-authors/blog-authors.module.js';
import { BlogTagsModule } from './blog-tags/blog-tags.module.js';
import { WebsiteBlogModule } from './website-blog/website-blog.module.js';
import { TokenCleanupService } from './tasks/token-cleanup.service.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'default', ttl: 60_000, limit: 60 }, // 60 req / min (general)
        { name: 'auth', ttl: 60_000, limit: 60 }, // 60 req / min (auth endpoints)
      ],
    }),
    ScheduleModule.forRoot(),
    ConfigModule,
    DatabaseModule,
    MailModule,
    HealthModule,
    WebsiteAuthModule,
    AdminAuthModule,
    PermissionsModule,
    RolesModule,
    AdminUsersModule,
    WebsiteUsersModule,
    UploadModule,
    BlogsModule,
    BlogCategoriesModule,
    BlogAuthorsModule,
    BlogTagsModule,
    WebsiteBlogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TokenCleanupService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
