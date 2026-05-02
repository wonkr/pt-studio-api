import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { MembersService } from './members.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrgGuard } from '../auth/guards/org.guard';
import { RequiredOrgId, TrainerId } from '../auth/decorators/auth.decorator';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(AuthGuard, OrgGuard)
@Controller('organizations/:orgId/members')
export class MembersController {
    constructor(
        private readonly memberService: MembersService
    ) {}

    @ApiOperation({ summary: 'Register a new member' })
    @ApiResponse({ status: 201, description: 'Member registered successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('/register')
    async register(@TrainerId() trainerId: string, @RequiredOrgId() orgId: string, @Body(ValidationPipe) createMemberDto: CreateMemberDto){
        return this.memberService.create(trainerId, orgId, createMemberDto)
    }

    @ApiOperation({ summary: 'Get all members. Optionally filter by name.' })
    @ApiQuery({ name: 'name', required: false, description: 'Filter members by name (partial match)' })
    @ApiResponse({ status: 200, description: 'List of members' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    async findAll(@RequiredOrgId() orgId: string, @Query('name') name?: string){
        return this.memberService.findAll(orgId, name)
    }

    @ApiOperation({ summary: 'Get member details by ID' })
    @ApiResponse({ status: 200, description: 'Member details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Member not found' })
    @Get(':id')
    async getMemberDetails(@RequiredOrgId() orgId: string, @Param('id') id: string){
        return this.memberService.getMemberDetails(orgId, id)
    }

    @ApiOperation({ summary: 'Delete a member' })
    @ApiResponse({ status: 200, description: 'Member deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Member not found' })
    @Delete(':id')
    async remove(@TrainerId() trainerId: string, @RequiredOrgId() orgId:string, @Param('id') id: string){
        return this.memberService.remove(trainerId, orgId, id)
    }
}
