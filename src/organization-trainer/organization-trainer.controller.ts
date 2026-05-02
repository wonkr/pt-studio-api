import { Body, Controller, Get, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrgId, RequiredOrgId, TrainerId } from '../auth/decorators/auth.decorator';
import { OrganizationJoinRequestDto } from './dto/organization-join-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { OrgGuard } from '../auth/guards/org.guard';
import { OrganizationTrainerService } from './organization-trainer.service';
import { UpdateTrainerPayoutDto } from './dto/update-trainer-payout.dto';
import { OrgAdminGuard } from '../auth/guards/org-admin.guard';

@ApiTags('Organization-trainer')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('organization-trainer')
export class OrganizationTrainerController {
    constructor(
        private readonly organizationTrainerService: OrganizationTrainerService
    ){}

    @Get('/joined-orgs')
    async getJoinedOrgs(@TrainerId() trainerId: string){
        return this.organizationTrainerService.getJoinedOrgs(trainerId)
    }

    @Post('/join-request')
    async requestJoin(@TrainerId() trainerId: string, @Body(ValidationPipe) organizationJoinRequestDto: OrganizationJoinRequestDto){
        return this.organizationTrainerService.requestJoin(trainerId, organizationJoinRequestDto)
    }


    @UseGuards(OrgGuard, OrgAdminGuard)
    @Get('/organizations/:orgId/admin/request-status')
    async getAdminRequestStatus(@RequiredOrgId() orgId:string){
        return this.organizationTrainerService.getAdminRequestStatus(orgId)
    }

    @UseGuards(OrgGuard, OrgAdminGuard)
    @Patch('/organizations/:orgId/admin/update-request-status')
    async updateRequestStatus(@Body(ValidationPipe) updateRequestStatusDto: UpdateRequestStatusDto, @RequiredOrgId() orgId: string){
        return this.organizationTrainerService.updateRequestStatus(orgId, updateRequestStatusDto)
    }

    @UseGuards(OrgGuard, OrgAdminGuard)
    @Get('/organizations/:orgId/admin/trainers')
    async getTrainers(@RequiredOrgId() orgId: string){
        return this.organizationTrainerService.getTrainers(orgId)
    }

    @UseGuards(OrgGuard, OrgAdminGuard)
    @Patch('/organizations/:orgId/admin/trainers')
    async updateTrainerPayout(@RequiredOrgId() orgId:string, @Body(ValidationPipe) updateTrainerPayoutDto: UpdateTrainerPayoutDto){
        return this.organizationTrainerService.updateTrainerPayout(orgId, updateTrainerPayoutDto)
    }

    
}
