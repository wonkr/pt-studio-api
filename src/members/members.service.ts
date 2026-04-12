import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/createMember.dto';
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

        await this.databaseService.membership.create({
            data: {
                trainerId: trainerId,
                memberId: createdMember.id,
                sessionPassId: createMemberDto.sessionPassId,
                paymentType: createMemberDto.paymentType,
                paymentStatus: createMemberDto.paymentStatus,
                paidAt: createMemberDto.paidAt,
                startedAt: createMemberDto.membershipStartedAt,
                expiredAt: createMemberDto.membershipExpiredAt,
                remainingSessions: createMemberDto.sessionPassTotalSessions,
                usedSessions: 0
            }
        })
    }
}
