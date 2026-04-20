import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSessionPassDto } from './dto/create-session-pass.dto';
import { DatabaseService } from '../database/database.service';
import { UpdateSessionPassDto } from './dto/update-session-pass.dto';
import { ActivateSessionPassDto } from './dto/activate-session-pass.dto';

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
                trainerId: trainerId,
                deletedAt: null
            }
        })
    }

    async findOne(trainerId:string, id:string){
        return await this.databaseService.sessionPass.findUnique({
            where: {
                trainerId: trainerId,
                id: id,
                deletedAt: null
            }
        })
    }

    async update(trainerId: string, id:string, updateSessionPassDto:UpdateSessionPassDto){
        return await this.databaseService.sessionPass.update({
            where: {
                trainerId: trainerId,
                id: id,
                deletedAt: null
            },
            data: updateSessionPassDto
        })
    }

    async remove(trainerId: string, id:string){
        const activeMembership = await this.databaseService.membership.findFirst({
            where: {
                trainerId: trainerId,
                id: id,
                OR: [
                    { expiredAt: {gte: new Date()}},
                    { remainingSessions: { gte: 0 } }
                ]
            }
        })
        
        if (activeMembership) {
            throw new ConflictException('Cannot delete: there is an active membership that references the session pass')
        }

        await this.databaseService.sessionPass.update({
            where: {
                trainerId: trainerId,
                id: id,
                deletedAt: null
            },
            data: {
                deletedAt: new Date()
            }
        })

        return
    }

    async activate(trainerId: string, id: string, activateSessionPassDto: ActivateSessionPassDto){
        const result = await this.databaseService.sessionPass.update({
            where: {
                trainerId: trainerId,
                id: id,
                deletedAt: null
            },
            data: {
                isActivated: activateSessionPassDto.isActivated
            }
        })

        return result
    }

    
}
