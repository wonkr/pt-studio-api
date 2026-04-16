import { Module } from '@nestjs/common';
import { TrainerExpenseService } from './trainer-expense.service';
import { TrainerExpenseController } from './trainer-expense.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [TrainerExpenseService],
  controllers: [TrainerExpenseController]
})
export class TrainerExpenseModule {}
