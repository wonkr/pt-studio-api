import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTrainerExpenseDto } from './dto/create-trainer-expense.dto';
import { UpdateTrainerExpenseDto } from './dto/update-trainer-expense.dto';
import { NOTFOUND } from 'node:dns/promises';
import { start } from 'node:repl';
import e from 'express';

@Injectable()
export class TrainerExpenseService {
    constructor(
        private readonly databaseService: DatabaseService
    ) {}

    async create(trainerId: string, createTrainerExpenseDto:CreateTrainerExpenseDto){
            return await this.databaseService.trainerExpense.create({
                data: {
                    trainerId: trainerId,
                    category: createTrainerExpenseDto.category,
                    amount: createTrainerExpenseDto.amount,
                    memo: createTrainerExpenseDto.memo,
                    paidAt: createTrainerExpenseDto.paidAt
                }
            })
        }
    
    async findAll(trainerId:string, category?: 'RENT' | 'UTILITY' | 'SUPPLY' | 'OTHER', startDate?: string, endDate?: string){
        const where: any = { trainerId }
        
        if (category){
            where.category = category
        }

        if (startDate || endDate) {
            where.paidAt = {};
            if (startDate) {where.paidAt.gte = new Date(startDate)}
            if (endDate) {where.paidAt.lte = new Date(endDate)}
        }
        return await this.databaseService.trainerExpense.findMany({
            where: where
            
        })
    }

    async findOne(trainerId:string, id:string){
        const expense =  await this.databaseService.trainerExpense.findUnique({
            where: {
                trainerId: trainerId,
                id: id
            }
        })
        if (!expense) {
            throw new NotFoundException()
        }
        return expense
    }

    async update(trainerId: string, id:string, updateTrainerExpenseDto:UpdateTrainerExpenseDto){
        return await this.databaseService.trainerExpense.update({
            where: {
                trainerId: trainerId,
                id: id
            },
            data: updateTrainerExpenseDto
        })
    }

    async remove(trainerId: string, id:string){
        await this.databaseService.trainerExpense.delete({
            where: {
                trainerId: trainerId,
                id: id
            }
        })

        return
    }

    async getTotalExpense(trainerId: string, year: number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)

        const expenseSum = await this.databaseService.trainerExpense.aggregate({
            where:{
                trainerId: trainerId,
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

    async getExpenseSummary(trainerId: string, year: number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)

        const expenseByCategory = await this.databaseService.trainerExpense.groupBy({
            by: ['category'],
            where: {
                trainerId: trainerId,
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
