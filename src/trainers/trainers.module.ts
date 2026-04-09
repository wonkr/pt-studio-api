import { Module } from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TrainersService],
  controllers: [TrainersController],
  exports: [TrainersService]
})
export class TrainersModule {}
