import { Module } from '@nestjs/common';
import { SessionPassService } from './session-pass.service';
import { SessionPassController } from './session-pass.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [SessionPassService],
  controllers: [SessionPassController]
})
export class SessionPassModule {}
