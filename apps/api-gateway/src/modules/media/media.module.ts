import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 0,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
