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

    async create(trainerId: string, orgId: string, orgRole: string, createScheduleDto:CreateScheduleDto){
        const membership = await this.databaseService.membership.findFirst({
            where:{
                organizationId: orgId,
                id: createScheduleDto.membershipId,
            },
            select: {
                trainerId: true,
                remainingSessions: true
            }
        })

        if (!membership || membership.remainingSessions <= 0){
            throw new ForbiddenException('membership is not valid')
        }

        if (trainerId !== membership.trainerId || ['ADMIN', 'OWNER'].includes(orgRole)){
            throw new UnauthorizedException('Have no permission to create a schedule for this member.')
        }

        const newStart = new Date(createScheduleDto.scheduledAt)
        const newEnd = new Date(newStart.getTime() + createScheduleDto.sessionDuration * 60 * 1000)

        if (createScheduleDto.status == "ATTENDED"){
            const result = await this.databaseService.$transaction(async (tx) => {
                const schedule = await tx.schedule.create({
                    data:{
                        organizationId: orgId,
                        primaryTrainerId:membership.trainerId,
                        conductedByTrainerId: createScheduleDto.conductedByTrainerId,
                        memberId:createScheduleDto.memberId,
                        membershipId: createScheduleDto.membershipId,
                        roomId: createScheduleDto.roomId,
                        scheduledAt: createScheduleDto.scheduledAt,
                        sessionDuration: createScheduleDto.sessionDuration,
                        endsAt: newEnd,
                        status: createScheduleDto.status,
                        cancelReason: createScheduleDto.cancelReason
                    }
                })

                await this.updateStatusToAttended(tx, schedule.conductedByTrainerId, orgId, schedule.membershipId, schedule.id)
            })

            return result
        } else {
            return await this.databaseService.schedule.create({
                data:{
                    organizationId: orgId,
                    primaryTrainerId:membership.trainerId,
                    conductedByTrainerId: createScheduleDto.conductedByTrainerId,
                    memberId:createScheduleDto.memberId,
                    membershipId: createScheduleDto.membershipId,
                    roomId: createScheduleDto.roomId,
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
                conductedByTrainerId: trainerId,
                ...( memberId && {
                    memberId: memberId
                })
            },
            select: {
                id: true,
                primaryTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                conductedByTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
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
                room: {
                    select: {
                        id: true,
                        name: true, 
                        capacity: true,
                    }
                },
                scheduledAt: true,
                sessionDuration: true,
                status: true,
                cancelReason: true
            }
        })
    }

    async findAllByOrg(trainerId: string, orgId: string, orgRole: string, memberId?:string){
        const select:any = {
                id: true,
                primaryTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                conductedByTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                room: {
                    select: {
                        id: true,
                        name: true, 
                        capacity: true,
                    }
                },
                scheduledAt: true,
                sessionDuration: true,
                status: true,
                cancelReason: true
            }

        if (['ADMIN', 'OWNER'].includes(orgRole)){
            select.member = {
                    select:{
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
            }
            select.membership = {
                    select:{
                        id: true,
                        remainingSessions: true,
                    }
                }
        }

        return await this.databaseService.schedule.findMany({
            where: {
                organizationId: orgId,
                ...( memberId && {
                    memberId: memberId
                })
            },
            select: select
        })
    }

    async findOne(trainerId:string, orgId: string, orgRole: string, id:string){
        const where: any = {id: id}

        if (['ADMIN', 'OWNER'].includes(orgRole)){
            where.organizationId = orgId
        } else {
            where.OR = [
                { primaryTrainerId: trainerId },
                { conductedByTrainerId: trainerId }
            ]
        }

        return await this.databaseService.schedule.findFirst({
            where: where,
            select: {
                id: true,
                primaryTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                conductedByTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
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
                room: {
                    select: {
                        id: true,
                        name: true, 
                        capacity: true,
                    }
                },
                scheduledAt: true,
                sessionDuration: true,
                status: true,
                cancelReason: true
            }
        })
    }

    async update(trainerId:string, orgId:string, orgRole:string, id:string, updateScheduleDto:UpdateScheduleDto){
        const where: any = {id: id}

        if (['ADMIN', 'OWNER'].includes(orgRole)){
            where.organizationId = orgId
        } else {
            where.OR = [
                { primaryTrainerId: trainerId },
                { conductedByTrainerId: trainerId }
            ]
        }

        const existingSchedule = await this.databaseService.schedule.findFirst({
            where: where
        })

        if (!existingSchedule){
            throw new NotFoundException('Schedule not found') 
        }

        const newScheduledAt = updateScheduleDto.scheduledAt ?? existingSchedule.scheduledAt
        const newDuration = updateScheduleDto.sessionDuration ?? existingSchedule.sessionDuration
        const newEndsAt = new Date(
            new Date(newScheduledAt).getTime() + newDuration * 60 * 1000
        )
        const newStatus = updateScheduleDto.status ?? existingSchedule.status

        
        await this.databaseService.$transaction(async (tx) => {
            const schedule = await tx.schedule.update({
                where: where,
                data:{
                    scheduledAt: newScheduledAt,
                    sessionDuration: newDuration,
                    endsAt: newEndsAt,
                    status: newStatus,
                    cancelReason: updateScheduleDto.cancelReason
                }
            })
            if (existingSchedule.status !== "ATTENDED" && newStatus === "ATTENDED") {
                await this.updateStatusToAttended(tx, schedule.conductedByTrainerId, orgId, schedule.membershipId, schedule.id)
            }
            if (existingSchedule.status === "ATTENDED" && newStatus !== "ATTENDED") {
                await this.updateStatusFromAttended(tx, schedule.conductedByTrainerId, orgId, existingSchedule.membershipId, schedule.id)
            }
        })


        return await this.databaseService.schedule.findFirst({
            where: where,
            select: {
                id: true,
                primaryTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                conductedByTrainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
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
                room: {
                    select: {
                        id: true,
                        name: true, 
                        capacity: true,
                    }
                },
                scheduledAt: true,
                sessionDuration: true,
                status: true,
                cancelReason: true
            }
        })
        
    }

    async remove(trainerId:string, orgId:string, orgRole:string, id:string){
        const where: any = {id: id}

       if (['ADMIN', 'OWNER'].includes(orgRole)){
            where.organizationId = orgId
        } else {
            where.OR = [
                { primaryTrainerId: trainerId },
                { conductedByTrainerId: trainerId }
            ]
        }

        const existingSchedule = await this.databaseService.schedule.findFirst({
            where: where
        })

        if (!existingSchedule){
            throw new NotFoundException('no schedule found')
        }


        await this.databaseService.$transaction(async (tx) => {
            if (existingSchedule.status === "ATTENDED"){
                await this.updateStatusFromAttended(tx, existingSchedule.conductedByTrainerId, orgId, existingSchedule.membershipId, existingSchedule.id)
            }

            await tx.schedule.delete({
            where: where
            })
        })

        return
    }

    private async updateStatusToAttended(tx: Omit<PrismaClient<never, undefined, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">, conductedByTrainerId: string, orgId: string, membershipId: string, scheduleId: string){
        await tx.membership.update({
            where: { 
                id: membershipId,
                organizationId: orgId
            },
            data: {
                remainingSessions: { decrement: 1 }
            }
        })
        const membership = await tx.membership.findFirst({
            where: {
                id: membershipId,
                organizationId: orgId
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
                organizationId: orgId,
                conductedByTrainerId: conductedByTrainerId,
                scheduleId: scheduleId,
                memberId: membership.memberId,
                amount: revenue
            }
        })
    }

    private async updateStatusFromAttended(tx: Omit<PrismaClient<never, undefined, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">, conductedByTrainerId: string, orgId: string, membershipId: string, scheduleId: string){
        await tx.membership.update({
            where: { 
                id: membershipId,
                organizationId: orgId
            },
            data: {
                remainingSessions: { increment: 1 }
            }
        })

        await tx.revenueRecognition.delete({
            where: {
                conductedByTrainerId: conductedByTrainerId,
                scheduleId: scheduleId
            }
        })
    }
}
