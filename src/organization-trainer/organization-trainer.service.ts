import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OrganizationJoinRequestDto } from './dto/organization-join-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { UpdateOrgExpenseDto } from '../org-expense/dto/update-org-expense.dto';
import { UpdateTrainerPayoutDto } from './dto/update-trainer-payout.dto';

@Injectable()
export class OrganizationTrainerService {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async requestJoin(trainerId: string, organizationJoinRequestDto:OrganizationJoinRequestDto){
        const request = await this.databaseService.organizationTrainer.create({
            data: {
                organizationId: organizationJoinRequestDto.organizationId,
                trainerId: trainerId,
                role: 'TRAINER',
                status: 'PENDING'
            },
            select: {
                organization: {
                    select: {
                        name: true
                    }
                },
                role: true,
                status: true
            }
        })

        return { 
            orgName: request.organization.name,
            role: request.role,
            status: request.status
        }
    }

    async getJoinedOrgs(trainerId: string){
        const result = await this.databaseService.organizationTrainer.findMany({
            where: {
                trainerId: trainerId
            },
            select: {
                id: true,
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: true,
                status: true
            }
        })

        return result
    }

    async getAdminRequestStatus(orgId: string){
        const org = await this.databaseService.organization.findFirst({
            where: {
                id: orgId
            }
        })

        if (!org){
            throw new NotFoundException()
        }

        const requests = await this.databaseService.organizationTrainer.findMany({
            where: {
                organizationId: orgId,
                role: {
                    in: ['ADMIN', 'TRAINER']
                }
            },
            select: {
                id: true,
                trainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                role: true,
                status: true
            }
        })

        return {
            orgId: org?.id,
            orgName: org?.name,
            requests: requests
        }
    }

    async updateRequestStatus(orgId: string, updateRequestStatusDto: UpdateRequestStatusDto){

        const update = await this.databaseService.organizationTrainer.update({
            where: {
                id: updateRequestStatusDto.joinRequestId,
                organizationId: orgId,
                role: {
                    in: ['ADMIN', 'TRAINER']
                }
            },
            data: {
                status: updateRequestStatusDto.status
            },
            select: {
                id: true,
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                trainer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: true,
                status: true
            }
        })

        return { 
            id: update.id,
            orgId: update.organization.id,
            orgName: update.organization.name,
            trainerId: update.trainer.id,
            trainerName: update.trainer.name,
            role: update.role,
            status: update.status
        }
    }

    async getTrainers(orgId){
        const org = await this.databaseService.organization.findFirst({
            where: {
                id: orgId
            }
        })

        if (!org){
            throw new NotFoundException()
        }

        const trainers = await this.databaseService.organizationTrainer.findMany({
            where: {
                organizationId: orgId,
            },
            select: {
                id: true,
                trainer: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true
                    }
                },
                role: true,
                status: true,
                payoutPerSession: true
            }
        })

        return {
            orgId: org.id,
            orgName: org.name,
            trainers: trainers
        }
    }

    async updateTrainerPayout (orgId:string, updateTrainerPayoutDto: UpdateTrainerPayoutDto){

        const update = await this.databaseService.organizationTrainer.update({
            where: {
                organizationId: orgId,
                id: updateTrainerPayoutDto.joinRequestId,
            },
            data: {
                payoutPerSession: updateTrainerPayoutDto.payoutPerSession
            },
            select: {
                id: true,
                organization: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                trainer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: true,
                status: true,
                payoutPerSession: true
            }
        })

        return { 
            id: update.id,
            orgId: update.organization.id,
            orgName: update.organization.name,
            trainerId: update.trainer.id,
            trainerName: update.trainer.name,
            role: update.role,
            status: update.status,
            payoutPerSession: update.payoutPerSession
        }
    }
}
