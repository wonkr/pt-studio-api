import { Controller, Post, UseGuards, ValidationPipe, Body, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrgGuard } from '../auth/guards/org.guard';
import { RequiredOrgId, TrainerId } from '../auth/decorators/auth.decorator';
import { OrgRole } from '../auth/decorators/org.decorator';

@ApiTags('Schedule')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/schedule')
export class ScheduleController {
    constructor(
        private readonly scheduleService: ScheduleService
    ) {}

    @ApiOperation({ summary: 'Create a new PT session schedule' })
    @ApiResponse({ status: 201, description: 'Schedule created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Invalid or depleted membership' })
    @ApiResponse({ status: 409, description: 'Schedule conflicts with existing session' })
    @UseGuards(OrgGuard)
    @Post('/organizations/:orgId')
    async create(@TrainerId() trainerId: string, @RequiredOrgId() orgId: string, @OrgRole() orgRole:string, @Body(ValidationPipe) createScheduleDto: CreateScheduleDto){
        return this.scheduleService.create(trainerId, orgId, orgRole, createScheduleDto)
    }

    @ApiOperation({ summary: 'Get all schedules by orgs. Optionally filter by member.' })
    @ApiQuery({ name: 'member-id', required: false, description: 'Filter schedules for a specific member' })
    @ApiResponse({ status: 200, description: 'List of schedules' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseGuards(OrgGuard)
    @Get('/organizations/:orgId')
    async findAllByOrg(@TrainerId() trainerId: string, @RequiredOrgId() orgId: string, @OrgRole() orgRole:string, @Query('member-id') memberId?: string){
        return this.scheduleService.findAllByOrg(trainerId, orgId, orgRole, memberId)
    }

    @ApiOperation({ summary: 'Get all schedules by trainers. Optionally filter by member.' })
    @ApiQuery({ name: 'member-id', required: false, description: 'Filter schedules for a specific member' })
    @ApiResponse({ status: 200, description: 'List of schedules' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get('/my')
    async findAllByTrainer(@TrainerId() trainerId: string, @Query('member-id') memberId?: string){
        return this.scheduleService.findAll(trainerId, memberId)
    }

    @ApiOperation({ summary: 'Get a schedule by ID' })
    @ApiResponse({ status: 200, description: 'Schedule details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Schedule not found' })
    @UseGuards(OrgGuard)
    @Get('/organizations/:orgId/:scheduleId')
    async findOne(@TrainerId() trainerId: string, @RequiredOrgId() orgId: string, @OrgRole() orgRole:string, @Param('scheduleId') scheduleId: string){
        return this.scheduleService.findOne(trainerId, orgId, orgRole, scheduleId)
    }

    @ApiOperation({ summary: 'Update a schedule — reschedule, check-in, cancel, no-show' })
    @ApiResponse({ status: 200, description: 'Updated schedule' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Schedule not found' })
    @ApiResponse({ status: 409, description: 'Schedule conflicts with existing session' })
    @UseGuards(OrgGuard)
    @Patch('/organizations/:orgId/:scheduleId')
    async update(@TrainerId() trainerId: string, @RequiredOrgId() orgId: string, @OrgRole() orgRole:string, @Param('scheduleId') scheduleId: string, @Body(ValidationPipe) updateScheduleDto: UpdateScheduleDto){
        return this.scheduleService.update(trainerId, orgId, orgRole, scheduleId, updateScheduleDto)
    }

    @ApiOperation({ summary: 'Delete a schedule' })
    @ApiResponse({ status: 204, description: 'Schedule deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Schedule not found' })
    @UseGuards(OrgGuard)
    @Delete('/organizations/:orgId/:scheduleId')
    async remove(@TrainerId() trainerId: string, @RequiredOrgId() orgId: string, @OrgRole() orgRole:string, @Param('scheduleId') scheduleId: string){
        return this.scheduleService.remove(trainerId, orgId, orgRole, scheduleId)
    }
}
