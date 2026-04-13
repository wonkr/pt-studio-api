import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipService {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async create(trainerId: string, createMembershipDto:CreateMembershipDto){
        if (!createMembershipDto.sessionPassId){
            const createdSessionPass = await this.databaseService.sessionPass.create({
                data: {
                    trainerId: trainerId, 
                    name: createMembershipDto.sessionPassName,
                    totalSessions: createMembershipDto.sessionPassTotalSessions,
                    price: createMembershipDto.sessionPassPrice,
                    validDays: createMembershipDto.sessionPassValidDays
                }
            })

            createMembershipDto.sessionPassId = createdSessionPass.id
        }

        const paidAt = (createMembershipDto.paymentStatus === "PAID" && !createMembershipDto.paidAt)? new Date(): createMembershipDto.paidAt

        createMembershipDto.remainingSessions = (!createMembershipDto.remainingSessions)? createMembershipDto.sessionPassTotalSessions: createMembershipDto.remainingSessions

        const membership =  await this.databaseService.membership.create({
            data:{
                trainerId: trainerId,
                memberId: createMembershipDto.memberId,
                sessionPassId: createMembershipDto.sessionPassId,
                paymentType: createMembershipDto.paymentType,
                paymentStatus: createMembershipDto.paymentStatus,
                ... (paidAt && { paidAt: paidAt }),
                startedAt: createMembershipDto.membershipStartedAt,
                expiredAt: createMembershipDto.membershipExpiredAt,
                remainingSessions: (!createMembershipDto.remainingSessions)? createMembershipDto.sessionPassTotalSessions: createMembershipDto.remainingSessions,
                usedSessions: (!createMembershipDto.usedSession)?0: createMembershipDto.usedSession,
            }
        })

        return await this.databaseService.membership.findUnique({
            where: {
                trainerId: trainerId,
                id: membership.id
            },
            select: {
                id: true,
                memberId: true,
                sessionPass: {
                    select: {
                        id: true,
                        name: true,
                        totalSessions: true,
                        price: true,
                        validDays: true
                    }
                },
                paymentType: true,
                paymentStatus: true,
                paidAt: true,
                startedAt: true,
                expiredAt: true,
                remainingSessions: true,
                usedSessions: true
            }
        })
    }

    async findOne(trainerId:string, id:string){
        return await this.databaseService.membership.findUnique({
            where: {
                trainerId: trainerId,
                id: id
            },
            select: {
                id: true,
                memberId: true,
                sessionPass: {
                    select: {
                        id: true,
                        name: true,
                        totalSessions: true,
                        price: true,
                        validDays: true
                    }
                },
                paymentType: true,
                paymentStatus: true,
                paidAt: true,
                startedAt: true,
                expiredAt: true,
                remainingSessions: true,
                usedSessions: true
            }
        })
    }

    async update(trainerId: string, id: string, updateMembershipDto:UpdateMembershipDto){
        const updatedMembership = await this.databaseService.membership.update({
            where: {
                trainerId: trainerId,
                id: id
            },
            data: updateMembershipDto
        })

        return await this.databaseService.membership.findUnique({
            where: {
                trainerId: trainerId,
                id: updatedMembership.id
            },
            select: {
                id: true,
                memberId: true,
                sessionPass: {
                    select: {
                        id: true,
                        name: true,
                        totalSessions: true,
                        price: true,
                        validDays: true
                    }
                },
                paymentType: true,
                paymentStatus: true,
                paidAt: true,
                startedAt: true,
                expiredAt: true,
                remainingSessions: true,
                usedSessions: true
            }
        })
    }

    async remove(trainerId: string, id: string){
        return await this.databaseService.membership.delete({
            where: {
                trainerId: trainerId,
                id: id
            }
        })
    }
}
