import { Controller, Post, UseGuards, ValidationPipe, Request, Body, Get, Patch, Delete, Param } from '@nestjs/common';
import { SessionPassService } from './session-pass.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateSessionPassDto } from './dto/create-session-pass.dto';
import { UpdateSessionPassDto } from './dto/update-session-pass.dto';

@Controller('session-pass')
export class SessionPassController {
    constructor(
        private readonly sessionPassService: SessionPassService
    ) {}

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createSessionPassDto: CreateSessionPassDto){
        return this.sessionPassService.create(req.user.sub, createSessionPassDto)
    }

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Request() req){
        return this.sessionPassService.findAll(req.user.sub)
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string){
        return this.sessionPassService.findOne(req.user.sub, id)
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) updateSessionPassDto: UpdateSessionPassDto){
        return this.sessionPassService.update(req.user.sub, id, updateSessionPassDto)
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.sessionPassService.remove(req.user.sub, id)
    }
}
