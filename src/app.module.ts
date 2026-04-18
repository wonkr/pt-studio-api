import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TrainersModule } from './trainers/trainers.module';
import { MembersModule } from './members/members.module';
import { SessionPassModule } from './session-pass/session-pass.module';
import { MembershipModule } from './membership/membership.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TrainerExpenseModule } from './trainer-expense/trainer-expense.module';
import { RevenueSummaryModule } from './revenue-summary/revenue-summary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule, 
    AuthModule, TrainersModule, MembersModule, SessionPassModule, MembershipModule, ScheduleModule, TrainerExpenseModule, RevenueSummaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
