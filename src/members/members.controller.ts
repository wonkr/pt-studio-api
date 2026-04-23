import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { MembersService } from './members.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('members')
export class MembersController {
    constructor(
        private readonly memberService: MembersService
    ) {}

    @ApiOperation({ summary: 'Register a new member' })
    @ApiResponse({ status: 201, description: 'Member registered successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post('/register')
    async register(@Body(ValidationPipe) createMemberDto: CreateMemberDto, @Request() req){
        return this.memberService.create(req.user.sub, createMemberDto)
    }

    @ApiOperation({ summary: 'Get all members. Optionally filter by name.' })
    @ApiQuery({ name: 'name', required: false, description: 'Filter members by name (partial match)' })
    @ApiResponse({ status: 200, description: 'List of members' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    async findAll(@Request() req, @Query('name') name?: string){
        return this.memberService.findAll(req.user.sub, name)
    }

    @ApiOperation({ summary: 'Get member details by ID' })
    @ApiResponse({ status: 200, description: 'Member details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Member not found' })
    @Get(':id')
    async getMemberDetails(@Request() req, @Param('id') id: string){
        return this.memberService.getMemberDetails(req.user.sub, id)
    }

    @ApiOperation({ summary: 'Delete a member' })
    @ApiResponse({ status: 200, description: 'Member deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Member not found' })
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.memberService.remove(req.user.sub, id)
    }
}
