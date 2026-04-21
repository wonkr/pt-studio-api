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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule, 
    AuthModule, TrainersModule, MembersModule, SessionPassModule, MembershipModule, ScheduleModule, TrainerExpenseModule, RevenueSummaryModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 sec
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000, // 10 sec
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000, // 1sec
        limit: 100,
      }
    ])
  
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // global
    }
  ],
})
export class AppModule {}
