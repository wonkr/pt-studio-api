import { Module } from '@nestjs/common';
import { OrgExpenseService } from './org-expense.service';
import { OrgExpenseController } from './org-expense.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [OrgExpenseService],
  controllers: [OrgExpenseController],
  exports:[OrgExpenseService]
})
export class OrgExpenseModule {}
