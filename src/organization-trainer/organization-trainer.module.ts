import { Module } from '@nestjs/common';
import { OrganizationTrainerController } from './organization-trainer.controller';
import { OrganizationTrainerService } from './organization-trainer.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [OrganizationTrainerService],
  controllers: [OrganizationTrainerController]
})
export class OrganizationTrainerModule {}
