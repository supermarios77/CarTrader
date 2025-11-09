import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { OtpRepository } from './otp.repository';
import { OtpService } from './otp.service';

@Module({
  imports: [DatabaseModule],
  providers: [OtpRepository, OtpService],
  exports: [OtpService],
})
export class OtpModule {}
