import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MembershipService } from '../membership/membership.service';
import { TrainerExpenseService } from '../trainer-expense/trainer-expense.service';

@Injectable()
export class RevenueSummaryService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly membershipService: MembershipService,
        private readonly trainerExpenseService: TrainerExpenseService
    ) {}

    async getRevenueSummary(trainerId:string, year:number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)
        const result = await this.databaseService.revenueRecognition.aggregate({
            where: {
                trainerId: trainerId,
                recognizedAt: {
                    gte: startDate, 
                    lt: endDate
                }
            },
            _sum: { amount: true }
        })
        const earnedRevenue = result._sum.amount?.toNumber() ?? 0
        const totalSales = await this.membershipService.getTotalSales(trainerId, year, month)
        const totalSalesOnValidMembership = await this.membershipService.getTotalSalesOnValidMembership(trainerId)

        const unearnedRevenue = totalSalesOnValidMembership - earnedRevenue

        const totalExpenses = await this.trainerExpenseService.getTotalExpense(trainerId, year, month)

        const netProfit = earnedRevenue - totalExpenses

        return {
            "totalSales": totalSales,
            "totalSalesOnValidMemberships": totalSalesOnValidMembership,
            "earnedRevenue": earnedRevenue,
            "unearnedRevenue": unearnedRevenue,
            "totalExpenses": totalExpenses,
            "netProfit": netProfit
        }

    }


}
