import { Controller, Post, UseGuards, ValidationPipe, Body, Get, Patch, Delete, Param } from '@nestjs/common';
import { SessionPassService } from './session-pass.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateSessionPassDto } from './dto/create-session-pass.dto';
import { UpdateSessionPassDto } from './dto/update-session-pass.dto';
import { ActivateSessionPassDto } from './dto/activate-session-pass.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrgGuard } from '../auth/guards/org.guard';
import { RequiredOrgId, TrainerId } from '../auth/decorators/auth.decorator';
import { OrgAdminGuard } from '../auth/guards/org-admin.guard';

@ApiTags('Session Pass')
@ApiBearerAuth()
@UseGuards(AuthGuard, OrgGuard, OrgAdminGuard)
@Controller('/organizations/:orgId/admin/session-pass')
export class SessionPassController {
    constructor(
        private readonly sessionPassService: SessionPassService
    ) {}

    @ApiOperation({ summary: 'Create a new session pass template' })
    @ApiResponse({ status: 201, description: 'Session pass created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post()
    async create(@RequiredOrgId() orgId: string, @Body(ValidationPipe) createSessionPassDto: CreateSessionPassDto){
        return this.sessionPassService.create(orgId, createSessionPassDto)
    }

    @ApiOperation({ summary: 'Get all session passes' })
    @ApiResponse({ status: 200, description: 'List of session passes' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    async findAll(@RequiredOrgId() orgId: string){
        return this.sessionPassService.findAll(orgId)
    }

    @ApiOperation({ summary: 'Get a session pass by ID' })
    @ApiResponse({ status: 200, description: 'Session pass details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Get(':id')
    async findOne(@RequiredOrgId() orgId: string, @Param('id') id: string){
        return this.sessionPassService.findOne(orgId, id)
    }

    @ApiOperation({ summary: 'Update a session pass (partial update)' })
    @ApiResponse({ status: 200, description: 'Updated session pass' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Patch(':id')
    async update(@RequiredOrgId() orgId: string, @Param('id') id: string, @Body(ValidationPipe) updateSessionPassDto: UpdateSessionPassDto){
        return this.sessionPassService.update(orgId, id, updateSessionPassDto)
    }

    @ApiOperation({ summary: 'Delete a session pass' })
    @ApiResponse({ status: 204, description: 'Session pass deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Delete(':id')
    async remove(@RequiredOrgId() orgId: string, @Param('id') id: string){
        return this.sessionPassService.remove(orgId, id)
    }

    @ApiOperation({ summary: 'Activate or deactivate a session pass' })
    @ApiResponse({ status: 200, description: 'Updated session pass' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Patch('/activate/:id')
    async activate(@RequiredOrgId() orgId: string, @Param('id') id: string, @Body(ValidationPipe) activateSessionPassDto: ActivateSessionPassDto){
        return this.sessionPassService.activate(orgId, id, activateSessionPassDto)
    }
}
