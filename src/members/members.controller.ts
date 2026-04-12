import { Body, Controller, Post, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { CreateMemberDto } from './dto/createMember.dto';
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
}
