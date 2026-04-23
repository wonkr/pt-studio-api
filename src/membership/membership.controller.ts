import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { MembershipSummaryQueryDto } from './dto/membership-summary-query.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Membership')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('membership')
export class MembershipController {
    constructor(
        private readonly membershipService: MembershipService
    ) {}

    @ApiOperation({ summary: 'Create a new membership for a member' })
    @ApiResponse({ status: 201, description: 'Membership created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Member not found' })
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createMemberShipDto:CreateMembershipDto){
        return this.membershipService.create(req.user.sub, createMemberShipDto)
    }

    @ApiOperation({ summary: 'Get membership summary aggregated by period' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiQuery({ name: 'month', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Membership summary' })
    @ApiResponse({ status: 400, description: 'year is required' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get('/summary')
    async getMembershipSummary(@Request() req, @Query(ValidationPipe) query: MembershipSummaryQueryDto){
        return this.membershipService.getMembershipSummary(req.user.sub, query.year, query.month)
    }

    @ApiOperation({ summary: 'Get membership payment transactions by period' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiQuery({ name: 'month', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Membership transactions' })
    @ApiResponse({ status: 400, description: 'year is required' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get('/membership-transaction')
    async getMembershipTransaction(@Request() req, @Query(ValidationPipe) query: MembershipSummaryQueryDto){
        return this.membershipService.getMembershipTransaction(req.user.sub, query.year, query.month)
    }

    @ApiOperation({ summary: 'Get a membership by ID' })
    @ApiResponse({ status: 200, description: 'Membership details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Membership not found' })
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
        return this.membershipService.findOne(req.user.sub, id)
    }

    @ApiOperation({ summary: 'Update a membership (partial update)' })
    @ApiResponse({ status: 200, description: 'Updated membership' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Membership not found' })
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) updateMembershipDto:UpdateMembershipDto){
        return this.membershipService.update(req.user.sub, id, updateMembershipDto)
    }

    @ApiOperation({ summary: 'Delete a membership' })
    @ApiResponse({ status: 204, description: 'Membership deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Membership not found' })
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.membershipService.remove(req.user.sub, id)
    }
}

