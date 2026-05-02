import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { crossOriginEmbedderPolicy } from 'helmet';

@Injectable()
export class MembershipService {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async create(trainerId: string, orgId: string, createMembershipDto:CreateMembershipDto){
        if (!createMembershipDto.sessionPassId){
            const createdSessionPass = await this.databaseService.sessionPass.create({
                data: {
                    organizationId: orgId, 
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
                organizationId: orgId,
                memberId: createMembershipDto.memberId,
                sessionPassId: createMembershipDto.sessionPassId,
                sessionPassName: createMembershipDto.sessionPassName,
                sessionPassPrice: createMembershipDto.sessionPassPrice,
                sessionPassTotalSessions: createMembershipDto.sessionPassTotalSessions,
                sessionPassValidDays: createMembershipDto.sessionPassValidDays,
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
                organizationId: orgId,
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

    async findOne(orgId:string, id:string){
        return await this.databaseService.membership.findUnique({
            where: {
                organizationId: orgId,
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

    async update(orgId: string, id: string, updateMembershipDto:UpdateMembershipDto){
        const updatedMembership = await this.databaseService.membership.update({
            where: {
                organizationId: orgId,
                id: id
            },
            data: updateMembershipDto
        })

        return await this.databaseService.membership.findUnique({
            where: {
                organizationId: orgId,
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

    async remove(orgId: string, id: string){
        return await this.databaseService.membership.delete({
            where: {
                organizationId: orgId,
                id: id
            }
        })
    }
    
    async getTotalSales(trainerId: string, year: number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)

        const memberships = await this.databaseService.membership.findMany({
            where: {
                trainerId: trainerId,
                paidAt: {
                    gte: startDate,
                    lt: endDate
                }, 
                paymentStatus: 'PAID'
            },
            select:{
                sessionPass: {
                    select: {
                        price: true
                    }
                }
            }
        })

        const totalSales = memberships.reduce(
            (sum, m) => sum + (m.sessionPass?.price.toNumber() ?? 0), 0
        )

        return totalSales
    }

    async getTotalSalesOnValidMembership(orgId: string){
        const memberships = await this.databaseService.membership.findMany({
            where: {
                organizationId: orgId, 
                OR: [
                    { expiredAt: { lt: new Date() } },
                    { expiredAt: null }
                ],
                paymentStatus: "PAID"
            },
            select: {
                sessionPass: {
                    select: {
                        price: true
                    }
                }
            }
        })

        const totalSales = memberships.reduce(
            (sum, m) => sum + (m.sessionPass?.price.toNumber() ?? 0), 0
        )

        return totalSales
    }

    async getMembershipSummaryByOrg(orgId: string, year:number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)

        const summary = await this.databaseService.membership.findMany({
            where: {
                organizationId: orgId
            },
            select: {
                id: true,
                member:{
                    select: {
                        id: true, 
                        name: true
                    }
                },
                sessionPass: {
                    select: {
                        id: true,
                        name: true,
                        totalSessions: true
                    }
                },
                remainingSessions: true,
                usedSessions: true,
                expiredAt: true,
            }
        })
        
        const flattenSummary = await Promise.all(summary.map(async (s) => {
            const usedThisMonthCount = await this.databaseService.revenueRecognition.count({
                where: {
                    organizationId: orgId,
                    memberId: s.member.id,
                    recognizedAt: {
                        gte: startDate,
                        lt: endDate
                    }
                }
            })
            return {
                membershipId: s.id,
                memberId: s.member.id,
                name: s.member.name,
                sessionPassId: s.sessionPass.id,
                sessionPassName: s.sessionPass.name,
                totalSession: s.sessionPass.totalSessions,
                remainingSessions: s.remainingSessions,
                usedSession: s.usedSessions,
                usedThisMonth: usedThisMonthCount,
                expiredAt: s.expiredAt,
                progress: Math.round(s.usedSessions/s.sessionPass.totalSessions)
            };
        }))

        return flattenSummary
    }

    async getMembershipTransaction(orgId: string, year: number, month: number){
        const startDate = new Date(year, month? month-1:0, 1)
        const endDate = month? new Date(year, month, 1): new Date(year+1, 0, 1)

        return await this.databaseService.membership.findMany({
            where: {
                organizationId: orgId,
                OR : [ 
                    {
                        paidAt: {
                            gte: startDate,
                            lt: endDate
                        }
                    },
                    { paidAt: null }
                ]
            },
            select: {
                id: true,
                member: {
                    select: {
                        id: true, 
                        name: true
                    }
                },
                trainerId: true,
                sessionPass: {
                    select: {
                        name: true,
                        price: true
                    }
                }, 
                paymentType: true,
                paidAt: true,
                paymentStatus: true
            }
        })
    }
}
