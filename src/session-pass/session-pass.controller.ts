import { Controller, Post, UseGuards, ValidationPipe, Request, Body, Get, Patch, Delete, Param } from '@nestjs/common';
import { SessionPassService } from './session-pass.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSessionPassDto } from './dto/create-session-pass.dto';
import { UpdateSessionPassDto } from './dto/update-session-pass.dto';
import { ActivateSessionPassDto } from './dto/activate-session-pass.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Session Pass')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('session-pass')
export class SessionPassController {
    constructor(
        private readonly sessionPassService: SessionPassService
    ) {}

    @ApiOperation({ summary: 'Create a new session pass template' })
    @ApiResponse({ status: 201, description: 'Session pass created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createSessionPassDto: CreateSessionPassDto){
        return this.sessionPassService.create(req.user.sub, createSessionPassDto)
    }

    @ApiOperation({ summary: 'Get all session passes' })
    @ApiResponse({ status: 200, description: 'List of session passes' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    async findAll(@Request() req){
        return this.sessionPassService.findAll(req.user.sub)
    }

    @ApiOperation({ summary: 'Get a session pass by ID' })
    @ApiResponse({ status: 200, description: 'Session pass details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string){
        return this.sessionPassService.findOne(req.user.sub, id)
    }

    @ApiOperation({ summary: 'Update a session pass (partial update)' })
    @ApiResponse({ status: 200, description: 'Updated session pass' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) updateSessionPassDto: UpdateSessionPassDto){
        return this.sessionPassService.update(req.user.sub, id, updateSessionPassDto)
    }

    @ApiOperation({ summary: 'Delete a session pass' })
    @ApiResponse({ status: 204, description: 'Session pass deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.sessionPassService.remove(req.user.sub, id)
    }

    @ApiOperation({ summary: 'Activate or deactivate a session pass' })
    @ApiResponse({ status: 200, description: 'Updated session pass' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session pass not found' })
    @Patch('/activate/:id')
    async activate(@Request() req, @Param('id') id: string, @Body(ValidationPipe) activateSessionPassDto: ActivateSessionPassDto){
        return this.sessionPassService.activate(req.user.sub, id, activateSessionPassDto)
    }
}
