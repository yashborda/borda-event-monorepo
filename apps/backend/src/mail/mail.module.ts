import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { MailPreviewController } from './mail-preview.controller.js';

@Global()
@Module({
  controllers: [MailPreviewController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
