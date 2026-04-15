import { Controller, Post, UseGuards, ValidationPipe, Request, Body, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { stringify } from 'querystring';
import { MembershipModule } from '../membership/membership.module';


@Controller('schedule')
export class ScheduleController {
    constructor(
        private readonly scheduleService: ScheduleService
    ) {}

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createScheduleDto: CreateScheduleDto){
            return this.scheduleService.create(req.user.sub, createScheduleDto)
    }

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Request() req, @Query('member-id') memberId?: string){
        return this.scheduleService.findAll(req.user.sub, memberId)
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string){
        return this.scheduleService.findOne(req.user.sub, id)
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) updateScheduleDto: UpdateScheduleDto){
        return this.scheduleService.update(req.user.sub, id, updateScheduleDto)
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.scheduleService.remove(req.user.sub, id)
    }
}
