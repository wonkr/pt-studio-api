import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { MembersService } from './members.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('members')
export class MembersController {
    constructor(
        private readonly memberService: MembersService
    ) {}

    @UseGuards(AuthGuard)
    @Post('/register')
    async register(@Body(ValidationPipe) createMemberDto: CreateMemberDto, @Request() req){
        return this.memberService.create(req.user.sub, createMemberDto)
    }

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Request() req, @Query('name') name?: string){
        return this.memberService.findAll(req.user.sub, name)
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getMemberDetails(@Request() req, @Param('id') id: string){
        return this.memberService.getMemberDetails(req.user.sub, id)
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.memberService.remove(req.user.sub, id)
    } 
}
