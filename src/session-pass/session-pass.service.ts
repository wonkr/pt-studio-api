import { Injectable } from '@nestjs/common';
import { CreateSessionPassDto } from './dto/create-session-pass.dto';
import { DatabaseService } from '../database/database.service';
import { UpdateSessionPassDto } from './dto/update-session-pass.dto';

@Injectable()
export class SessionPassService {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async create(trainerId: string, createSessionPassDto:CreateSessionPassDto){
        return await this.databaseService.sessionPass.create({
            data: {
                trainerId: trainerId,
                name: createSessionPassDto.name,
                price: createSessionPassDto.price,
                totalSessions: createSessionPassDto.totalSessions,
                validDays: createSessionPassDto.validDays
            }
        })
    }

    async findAll(trainerId:string){
        return await this.databaseService.sessionPass.findMany({
            where: {
                trainerId: trainerId
            }
        })
    }

    async findOne(trainerId:string, id:string){
        return await this.databaseService.sessionPass.findUnique({
            where: {
                trainerId: trainerId,
                id: id
            }
        })
    }

    async update(trainerId: string, id:string, updateSessionPassDto:UpdateSessionPassDto){
        return await this.databaseService.sessionPass.update({
            where: {
                trainerId: trainerId,
                id: id
            },
            data: updateSessionPassDto
        })
    }

    async remove(trainerId: string, id:string){
        await this.databaseService.sessionPass.delete({
            where: {
                trainerId: trainerId,
                id: id
            }
        })

        return
    }

    
}
