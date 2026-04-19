import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PrismaClient } from '../generated/prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/client';

@Injectable()
export class ScheduleService {
    constructor(
        private readonly databaseService: DatabaseService
    ) {}

    async create(trainerId: string, createScheduleDto:CreateScheduleDto){
        const membership = await this.databaseService.membership.findFirst({
            where:{
                trainerId: trainerId, 
                id: createScheduleDto.membershipId,
            },
            select: {
                remainingSessions: true
            }
        })

        if (!membership || membership.remainingSessions <= 0){
            throw new ForbiddenException('membership is not valid')
        }

        const newStart = new Date(createScheduleDto.scheduledAt)
        const newEnd = new Date(newStart.getTime() + createScheduleDto.sessionDuration * 60 * 1000)

        if (createScheduleDto.status == "ATTENDED"){
            const result = await this.databaseService.$transaction(async (tx) => {
                const schedule = await tx.schedule.create({
                    data:{
                        trainerId:trainerId,
                        memberId:createScheduleDto.memberId,
                        membershipId: createScheduleDto.membershipId,
                        scheduledAt: createScheduleDto.scheduledAt,
                        sessionDuration: createScheduleDto.sessionDuration,
                        endsAt: newEnd,
                        status: createScheduleDto.status,
                        cancelReason: createScheduleDto.cancelReason
                    }
                })

                await this.updateStatusToAttended(tx, trainerId, createScheduleDto.membershipId, schedule.id)
            })

            return result
        } else {
            return await this.databaseService.schedule.create({
                data:{
                    trainerId:trainerId,
                    memberId:createScheduleDto.memberId,
                    membershipId: createScheduleDto.membershipId,
                    scheduledAt: createScheduleDto.scheduledAt,
                    sessionDuration: createScheduleDto.sessionDuration,
                    endsAt: newEnd,
                    status: createScheduleDto.status,
                    cancelReason: createScheduleDto.cancelReason
                }
            })
        }
    }

    async findAll(trainerId: string, memberId?:string){
        return await this.databaseService.schedule.findMany({
            where: {
                trainerId: trainerId,
                ...( memberId && {
                    memberId: memberId
                })
            },
            select: {
                id: true,
                member:{
                    select:{
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                membership: {
                    select:{
                        id: true,
                        remainingSessions: true,
                    }
                },
                scheduledAt: true,
                sessionDuration: true,
                status: true,
                cancelReason: true
            }
        })
    }

    async findOne(trainerId:string, id:string){
        return await this.databaseService.schedule.findFirst({
            where: {
                trainerId: trainerId,
                id: id
            },
            select: {
                id: true,
                member:{
                    select:{
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                membership: {
                    select:{
                        id: true,
                        remainingSessions: true,
                        usedSessions: true,
                        expiredAt: true
                    }
                },
                scheduledAt: true,
                sessionDuration: true,
                status: true,
                cancelReason: true
            }
        })
    }

    async update(trainerId:string, id:string, updateScheduleDto:UpdateScheduleDto){
        const existingSchedule = await this.databaseService.schedule.findFirst({
            where: {
                trainerId: trainerId,
                id: id
            }
        })

        if (!existingSchedule){
            throw new NotFoundException('Schedule not found') 
        }

        const newScheduledAt = updateScheduleDto.scheduledAt ?? existingSchedule.scheduledAt
        const newDuration = updateScheduleDto.sessionDuration ?? existingSchedule.sessionDuration.toNumber()
        const newEndsAt = new Date(
            new Date(newScheduledAt).getTime() + newDuration * 60 * 1000
        )
        const newStatus = updateScheduleDto.status ?? existingSchedule.status

        
        await this.databaseService.$transaction(async (tx) => {
            const schedule = await tx.schedule.update({
                where: {
                    trainerId: trainerId,
                    id: id
                },
                data:{
                    scheduledAt: newScheduledAt,
                    sessionDuration: newDuration,
                    endsAt: newEndsAt,
                    status: newStatus,
                    cancelReason: updateScheduleDto.cancelReason
                }
            })
            if (existingSchedule.status !== "ATTENDED" && newStatus === "ATTENDED") {
                await this.updateStatusToAttended(tx, trainerId, existingSchedule.membershipId, schedule.id)
            }
            if (existingSchedule.status === "ATTENDED" && newStatus !== "ATTENDED") {
                await this.updateStatusFromAttended(tx, trainerId, existingSchedule.membershipId, schedule.id)
            }
        })


        return await this.databaseService.schedule.findFirst({
            where: {
                trainerId: trainerId,
                id: id
            },
            select: {
                id: true,
                member:{
                    select:{
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                membership: {
                    select:{
                        id: true,
                        remainingSessions: true,
                        usedSessions: true,
                        expiredAt: true
                    }
                },
                scheduledAt: true,
                sessionDuration: true,
                status: true,
                cancelReason: true
            }
        })
        
    }

    async remove(trainerId:string, id:string){
        const existingSchedule = await this.databaseService.schedule.findFirst({
            where: {
                trainerId: trainerId,
                id: id
            }
        })

        if (!existingSchedule){
            throw new NotFoundException('no schedule found')
        }


        await this.databaseService.$transaction(async (tx) => {
            if (existingSchedule.status === "ATTENDED"){
                await this.updateStatusFromAttended(tx, trainerId, existingSchedule.membershipId, existingSchedule.id)
            }

            await tx.schedule.delete({
            where: {
                trainerId: trainerId,
                id: id
            }
            })
        })

        return
    }

    private async updateStatusToAttended(tx: Omit<PrismaClient<never, undefined, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">, trainerId: string, membershipId: string, scheduleId: string){
        await tx.membership.update({
            where: { 
                id: membershipId,
                trainerId: trainerId
            },
            data: {
                remainingSessions: { decrement: 1 }
            }
        })
        const membership = await tx.membership.findFirst({
            where: {
                trainerId:trainerId,
                id: membershipId
            },
            select: {
                memberId: true,
                sessionPass: {
                    select: {
                        totalSessions: true,
                        price: true
                    }
                },
                remainingSessions: true
            }
        })

        if (!membership){
            throw new ForbiddenException('membership is not valid')
        }

        const revenue = membership.sessionPass.price.div(membership.sessionPass.totalSessions).toNumber()

        await tx.revenueRecognition.create({
            data: {
                trainerId: trainerId,
                scheduleId: scheduleId,
                memberId: membership.memberId,
                amount: revenue
            }
        })
    }

    private async updateStatusFromAttended(tx: Omit<PrismaClient<never, undefined, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">, trainerId: string, membershipId: string, scheduleId: string){
        await tx.membership.update({
            where: { 
                id: membershipId,
                trainerId: trainerId
            },
            data: {
                remainingSessions: { increment: 1 }
            }
        })

        await tx.revenueRecognition.delete({
            where: {
                trainerId: trainerId,
                scheduleId: scheduleId
            }
        })
    }
}
