import { Controller, Post, UseGuards, ValidationPipe, Request, Body, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Schedule')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('schedule')
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
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createScheduleDto: CreateScheduleDto){
        return this.scheduleService.create(req.user.sub, createScheduleDto)
    }

    @ApiOperation({ summary: 'Get all schedules. Optionally filter by member.' })
    @ApiQuery({ name: 'member-id', required: false, description: 'Filter schedules for a specific member' })
    @ApiResponse({ status: 200, description: 'List of schedules' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    async findAll(@Request() req, @Query('member-id') memberId?: string){
        return this.scheduleService.findAll(req.user.sub, memberId)
    }

    @ApiOperation({ summary: 'Get a schedule by ID' })
    @ApiResponse({ status: 200, description: 'Schedule details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Schedule not found' })
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string){
        return this.scheduleService.findOne(req.user.sub, id)
    }

    @ApiOperation({ summary: 'Update a schedule — reschedule, check-in, cancel, no-show' })
    @ApiResponse({ status: 200, description: 'Updated schedule' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Schedule not found' })
    @ApiResponse({ status: 409, description: 'Schedule conflicts with existing session' })
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) updateScheduleDto: UpdateScheduleDto){
        return this.scheduleService.update(req.user.sub, id, updateScheduleDto)
    }

    @ApiOperation({ summary: 'Delete a schedule' })
    @ApiResponse({ status: 204, description: 'Schedule deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Schedule not found' })
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.scheduleService.remove(req.user.sub, id)
    }
}
