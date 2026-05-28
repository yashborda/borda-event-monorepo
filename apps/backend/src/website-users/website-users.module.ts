import { Module } from '@nestjs/common';
import { WebsiteUsersController } from './website-users.controller.js';
import { WebsiteUsersService } from './website-users.service.js';

@Module({
  controllers: [WebsiteUsersController],
  providers: [WebsiteUsersService],
  exports: [WebsiteUsersService],
})
export class WebsiteUsersModule {}
