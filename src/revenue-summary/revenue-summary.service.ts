import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MembershipService } from '../membership/membership.service';
import { OrgExpenseService } from '../org-expense/org-expense.service';

@Injectable()
export class RevenueSummaryService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly membershipService: MembershipService,
        private readonly orgExpenseService: OrgExpenseService
    ) {}

    async getRevenueSummary(orgId:string, year:number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)
        const result = await this.databaseService.revenueRecognition.aggregate({
            where: {
                organizationId: orgId,
                recognizedAt: {
                    gte: startDate, 
                    lt: endDate
                }
            },
            _sum: { amount: true }
        })
        const earnedRevenue = result._sum.amount?.toNumber() ?? 0
        const totalSales = await this.membershipService.getTotalSales(orgId, year, month)
        const totalSalesOnValidMembership = await this.membershipService.getTotalSalesOnValidMembership(orgId)

        const unearnedRevenue = totalSalesOnValidMembership - earnedRevenue

        const totalExpenses = await this.orgExpenseService.getTotalExpense(orgId, year, month)

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
