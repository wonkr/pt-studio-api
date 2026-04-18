import { Module } from '@nestjs/common';
import { RevenueSummaryService } from './revenue-summary.service';
import { RevenueSummaryController } from './revenue-summary.controller';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { TrainerExpenseModule } from '../trainer-expense/trainer-expense.module';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [DatabaseModule, AuthModule, TrainerExpenseModule, MembershipModule],  
  providers: [RevenueSummaryService],
  controllers: [RevenueSummaryController]
})
export class RevenueSummaryModule {}
