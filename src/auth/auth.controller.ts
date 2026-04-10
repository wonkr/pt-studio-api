import { Controller, Post, Patch, Body, ValidationPipe, Res, UseGuards, Request } from '@nestjs/common'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { TrainersService } from '../trainers/trainers.service'
import { CreateTrainerDto } from './dto/create-trainer.dto'
import { loginTrainerDto } from './dto/login-trainer.dto'
import { AuthGuard } from './auth.guard'
import { VerifyPasswordDto } from './dto/verify-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

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
        const { accessToken, refreshToken } = await this.authService.signIn(loginTrainerDto)

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true, // prevent XSS
            secure: true, // transfer only in HTTPS
            sameSite: 'strict', // prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/auth'
        })

        return { accessToken }
    }

    @Post('/refresh')
    async refresh(@Request() req, @Res({ passthrough: true }) res: Response){
        const token = req.cookies['refresh_token']
        const { newAccessToken, newRefreshToken } = await this.authService.refreshToken(token)

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true, // prevent XSS
            secure: true, // transfer only in HTTPS
            sameSite: 'strict', // prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/auth'
        })

        return { newAccessToken }
    }

    @UseGuards(AuthGuard)
    @Post('/logout')
    async logout(@Request() req, @Res({ passthrough: true }) res: Response){
        const refreshToken = req.cookies['refresh_token']
        await this.authService.logout(refreshToken)
        res.clearCookie('refresh_token')
        return { message: 'Logged out successfully' }
    }

    @UseGuards(AuthGuard)
    @Post('/verify-password')
    async verifyPassword(@Body(ValidationPipe) verifyPasswordDto: VerifyPasswordDto, @Request() req, @Res({ passthrough: true }) res: Response){
        const passwordChangeToken = await this.authService.verifyPassword(req.user.sub, verifyPasswordDto.currentPassword)

        res.cookie('password_change_token', passwordChangeToken, {
            httpOnly: true, // prevent XSS
            secure: true, // transfer only in HTTPS
            sameSite: 'strict', // prevent CSRF
            maxAge: 5 * 60 * 1000, // 5 mins
            path: '/auth/password-change'
        })

        return
    }

    @UseGuards(AuthGuard)
    @Patch('/change-password')
    async changePassword(@Body(ValidationPipe) changePasswordDto:ChangePasswordDto, @Request() req, @Res({ passthrough: true }) res: Response){
        const token = req.cookies['password_change_token']
        
        await this.authService.changePassword(req.user.sub, token, changePasswordDto)
        
        res.clearCookie('password_change_token')

        return { message: 'Password is changed successfully' }
    }

}


