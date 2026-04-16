import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTrainerExpenseDto } from './dto/create-trainer-expense.dto';
import { UpdateTrainerExpenseDto } from './dto/update-trainer-expense.dto';
import { NOTFOUND } from 'node:dns/promises';
import { start } from 'node:repl';

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
}
