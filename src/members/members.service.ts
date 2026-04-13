import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MembersService {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async create(trainerId:string, createMemberDto:CreateMemberDto){
        const createdMember = await this.databaseService.member.create({
            data: {
                trainerId: trainerId,
                name: createMemberDto.name,
                phoneNumber: createMemberDto.phone
            }
        })
        if (!createMemberDto.sessionPassId) {
            const createdSessionPass = await this.databaseService.sessionPass.create({
                data: {
                    trainerId: trainerId,
                    name: createMemberDto.sessionPassName,
                    totalSessions: createMemberDto.sessionPassTotalSessions,
                    price: createMemberDto.sessionPassPrice,
                    validDays: createMemberDto.sessionPassValidDays
                }
            })

            createMemberDto.sessionPassId = createdSessionPass.id
        }


        const paidAt = (createMemberDto.paymentStatus === "PAID" && !createMemberDto.paidAt)? new Date(): createMemberDto.paidAt
        
        await this.databaseService.membership.create({
            data: {
                trainerId: trainerId,
                memberId: createdMember.id,
                sessionPassId: createMemberDto.sessionPassId,
                paymentType: createMemberDto.paymentType,
                paymentStatus: createMemberDto.paymentStatus,
                ... (paidAt && { paidAt: paidAt }),
                startedAt: createMemberDto.membershipStartedAt,
                expiredAt: createMemberDto.membershipExpiredAt,
                remainingSessions: createMemberDto.sessionPassTotalSessions,
                usedSessions: 0
            }
        })
    }

    async findAll(trainerId:string, name?: string){
        const members =  await this.databaseService.member.findMany({
            where: {
                trainerId: trainerId,
                ...( name && {
                        name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                })
            },
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                memberships: {
                    select: {
                        sessionPass: {
                            select: {
                                name: true
                            }
                        },
                        paymentStatus: true,
                        remainingSessions: true,
                        expiredAt: true
                    }
                }
            }
        })

        return members.map(m => this.flattenMember(m))
    }

    async getMemberDetails(trainerId: string, memberId: string){
        const member =  await this.databaseService.member.findUnique({
            where: {
                trainerId: trainerId,
                id:memberId,
            },
            select: {
                id: true,
                name: true,
                phoneNumber: true,
                memberships: {
                    select: {
                        sessionPass: {
                            select: {
                                name: true
                                
                            }
                        },
                        remainingSessions: true,
                        expiredAt: true,
                        paymentStatus: true,
                        paymentType: true
                    }
                }
            }
        })

        return member
    }

    private flattenMember(member: any){
        const membership = member.memberships?.[0];
        return {
            id: member.id,
            name: member.name,
            phoneNumber: member.phoneNumber,
            sessionPassName: membership?.sessionPass?.name ?? null,
            paymentStatus: membership?.paymentStatus ?? null,
            remainingSessions: membership?.remainingSessions ?? null,
            expiredAt: membership?.expiredAt ?? null
        };
    }
}
