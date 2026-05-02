import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateOrgExpenseDto } from './dto/create-org-expense.dto';
import { UpdateOrgExpenseDto } from './dto/update-org-expense.dto';
import { NOTFOUND } from 'node:dns/promises';
import { start } from 'node:repl';
import e from 'express';
import { OrgId } from '../auth/decorators/auth.decorator';

@Injectable()
export class OrgExpenseService {
    constructor(
        private readonly databaseService: DatabaseService
    ) {}

    async create(trainerId: string, orgId: string, createOrgExpenseDto:CreateOrgExpenseDto){
            return await this.databaseService.orgExpense.create({
                data: {
                    organizationId: orgId,
                    createdByTrainerId: trainerId,
                    category: createOrgExpenseDto.category,
                    amount: createOrgExpenseDto.amount,
                    memo: createOrgExpenseDto.memo,
                    paidAt: createOrgExpenseDto.paidAt
                }
            })
        }
    
    async findAll(orgId:string, category?: 'RENT' | 'UTILITY' | 'SUPPLY' | 'OTHER', startDate?: string, endDate?: string){
        const where: any = {}

        where.organizationId = orgId
        
        if (category){
            where.category = category
        }

        if (startDate || endDate) {
            where.paidAt = {};
            if (startDate) {where.paidAt.gte = new Date(startDate)}
            if (endDate) {where.paidAt.lte = new Date(endDate)}
        }
        return await this.databaseService.orgExpense.findMany({
            where: where
        })
    }

    async findOne(orgId:string, id:string){
        const expense =  await this.databaseService.orgExpense.findUnique({
            where: {
                organizationId: orgId,
                id: id
            }
        })
        if (!expense) {
            throw new NotFoundException()
        }
        return expense
    }

    async update(orgId: string, id:string, updateOrgExpenseDto:UpdateOrgExpenseDto){
        return await this.databaseService.orgExpense.update({
            where: {
                organizationId: orgId,
                id: id
            },
            data: updateOrgExpenseDto
        })
    }

    async remove(orgId: string, id:string){
        await this.databaseService.orgExpense.delete({
            where: {
                organizationId: orgId,
                id: id
            }
        })

        return
    }

    async getTotalExpense(orgId: string, year: number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)

        const expenseSum = await this.databaseService.orgExpense.aggregate({
            where:{
                organizationId: orgId,
                paidAt: {
                    gte: startDate,
                    lt: endDate
                }
            },
            _sum:{
                amount: true
            }
        })
        
        return expenseSum._sum.amount?.toNumber()??0
    }

    async getExpenseSummary(orgId: string, year: number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)

        const expenseByCategory = await this.databaseService.orgExpense.groupBy({
            by: ['category'],
            where: {
                organizationId: orgId,
                paidAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            _sum: { amount: true },
        })

        const flattenExpenseSummary = expenseByCategory.map(c => ({
            category: c.category,
            amount: c._sum.amount?.toNumber() ?? 0
        }))
        
        const total = flattenExpenseSummary.reduce((sum, e) => sum + e.amount, 0)

        return {
            totalExpenses: total, 
            byCategory: flattenExpenseSummary
        }
    }
}
