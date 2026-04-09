import { Controller, Post, Patch, Body, ValidationPipe, Res, UseGuards, Request } from '@nestjs/common';
import type { Response } from 'express'
import { AuthService } from './auth.service';
import { TrainersService } from '../trainers/trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { loginTrainerDto } from './dto/login-trainer.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly trainersService: TrainersService
    ) {}
    
    @Post('/register')
    register(@Body(ValidationPipe) createTrainerDto: CreateTrainerDto){
        return this.trainersService.create(createTrainerDto)
    }

    @Post('/login')
    async login(@Body(ValidationPipe) loginTrainerDto:loginTrainerDto, @Res({ passthrough: true }) res: Response){
        const { access_token, refresh_token } = await this.authService.signIn(loginTrainerDto)

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true, // prevent XSS
            secure: true, // transfer only in HTTPS
            sameSite: 'strict', // prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return { access_token }
    }

    @Post('/refresh')
    refresh(){
    }

    @UseGuards(AuthGuard)
    @Post('/logout')
    logout(@Request() req){
        return req.user
    }

    @UseGuards(AuthGuard)
    @Post('/verify-password')
    verifyPassword(){

    }

    @UseGuards(AuthGuard)
    @Patch('/password-change')
    changePassword(){

    }

}


