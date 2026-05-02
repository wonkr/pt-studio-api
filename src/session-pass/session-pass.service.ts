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

    async create(orgId: string, createSessionPassDto:CreateSessionPassDto){
        return await this.databaseService.sessionPass.create({
            data: {
                organizationId: orgId,
                name: createSessionPassDto.name,
                price: createSessionPassDto.price,
                totalSessions: createSessionPassDto.totalSessions,
                validDays: createSessionPassDto.validDays
            }
        })
    }

    async findAll(orgId:string){
        return await this.databaseService.sessionPass.findMany({
            where: {
                organizationId: orgId,
                deletedAt: null
            }
        })
    }

    async findOne(orgId:string, id:string){
        return await this.databaseService.sessionPass.findUnique({
            where: {
                organizationId: orgId,
                id: id,
                deletedAt: null
            }
        })
    }

    async update(orgId: string, id:string, updateSessionPassDto:UpdateSessionPassDto){
        return await this.databaseService.sessionPass.update({
            where: {
                organizationId: orgId,
                id: id,
                deletedAt: null
            },
            data: updateSessionPassDto
        })
    }

    async remove(orgId: string, id:string){
        const activeMembership = await this.databaseService.membership.findFirst({
            where: {
                organizationId: orgId,
                sessionPassId: id,
                OR: [
                    { expiredAt: {gte: new Date()}},
                    { expiredAt: null },
                    { remainingSessions: { gte: 0 }}
                ]
            }
        })
        console.log({message: activeMembership})
        if (activeMembership) {
            throw new ConflictException('Cannot delete: there is an active membership that references the session pass')
        }

        await this.databaseService.sessionPass.update({
            where: {
                organizationId: orgId,
                id: id,
                deletedAt: null
            },
            data: {
                deletedAt: new Date()
            }
        })

        return
    }

    async activate(orgId: string, id: string, activateSessionPassDto: ActivateSessionPassDto){
        const result = await this.databaseService.sessionPass.update({
            where: {
                organizationId: orgId,
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
