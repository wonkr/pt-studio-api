import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { reportUnhandledError } from 'rxjs/internal/util/reportUnhandledError';
import { MembershipSummaryQueryDto } from './dto/membership-summary-query.dto';

@Controller('membership')
export class MembershipController {
    constructor(
        private readonly membershipService: MembershipService
    ) {}

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createMemberShipDto:CreateMembershipDto){
        return this.membershipService.create(req.user.sub, createMemberShipDto)
    }

    @UseGuards(AuthGuard)
    @Get('/summary')
    async getMembershipSummary(@Request() req, @Param(ValidationPipe) query: MembershipSummaryQueryDto){
        return this.membershipService.getMembershipSummary(req.user.sub, query.year, query.month)
    }

    @UseGuards(AuthGuard)
    @Get('/membership-transaction')
    async getMembershipTransaction(@Request() req, @Param(ValidationPipe) query: MembershipSummaryQueryDto){
        return this.membershipService.getMembershipTransaction(req.user.sub, query.year, query.month)
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
        return this.membershipService.findOne(req.user.sub, id)
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) updateMembershipDto:UpdateMembershipDto){
        return this.membershipService.update(req.user.sub, id, updateMembershipDto)
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.membershipService.remove(req.user.sub, id)
    }
}

