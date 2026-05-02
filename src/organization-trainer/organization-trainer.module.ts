import { Module } from '@nestjs/common';
import { OrganizationTrainerController } from './organization-trainer.controller';

@Module({
  controllers: [OrganizationTrainerController]
})
export class OrganizationTrainerModule {}
