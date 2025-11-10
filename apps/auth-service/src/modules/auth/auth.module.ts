import { Module } from '@nestjs/common';

import { OtpModule } from '../otp/otp.module';
import { UsersModule } from '../users/users.module';
import { TokensModule } from '../tokens/tokens.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, OtpModule, TokensModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
