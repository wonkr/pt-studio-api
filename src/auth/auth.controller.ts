import { Controller, Post, Patch, Body, ValidationPipe, Res, UseGuards, Request } from '@nestjs/common'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { TrainersService } from '../trainers/trainers.service'
import { CreateTrainerDto } from './dto/create-trainer.dto'
import { loginTrainerDto } from './dto/login-trainer.dto'
import { AuthGuard } from './auth.guard'
import { VerifyPasswordDto } from './dto/verify-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { Throttle } from '@nestjs/throttler'
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly trainersService: TrainersService
    ) {}

    @ApiOperation({ summary: 'Register a new trainer' })
    @ApiResponse({ status: 201, description: 'Registered successfully' })
    @ApiResponse({ status: 400, description: 'Validation error / Passwords do not match' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    @Throttle({ short: { ttl: 1000, limit: 1 }, medium: { ttl: 60000, limit: 5 } })
    @Post('/register')
    register(@Body(ValidationPipe) createTrainerDto: CreateTrainerDto){
        return this.trainersService.create(createTrainerDto)
    }

    @ApiOperation({ summary: 'Login and receive access token' })
    @ApiResponse({ status: 200, description: 'Returns accessToken. Sets refresh_token cookie.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @Throttle({ short: { ttl: 1000, limit: 1 }, medium: { ttl: 60000, limit: 5 } })
    @Post('/login')
    async login(@Body(ValidationPipe) loginTrainerDto:loginTrainerDto, @Res({ passthrough: true }) res: Response){
        const { accessToken, refreshToken } = await this.authService.signIn(loginTrainerDto)

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true, // prevent XSS
            secure: true, // transfer only in HTTPS
            sameSite: 'strict', // prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth'
        })

        return { accessToken }
    }

    @ApiOperation({ summary: 'Reissue access token using refresh token cookie' })
    @ApiCookieAuth('refresh_token')
    @ApiResponse({ status: 200, description: 'Returns newAccessToken. Rotates refresh_token cookie.' })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
    @Post('/refresh')
    async refresh(@Request() req, @Res({ passthrough: true }) res: Response){
        const token = req.cookies['refresh_token']
        const { newAccessToken, newRefreshToken } = await this.authService.refreshToken(token)

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true, // prevent XSS
            secure: true, // transfer only in HTTPS
            sameSite: 'strict', // prevent CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth'
        })

        return { newAccessToken }
    }

    @ApiOperation({ summary: 'Logout and revoke refresh token' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseGuards(AuthGuard)
    @Post('/logout')
    async logout(@Request() req, @Res({ passthrough: true }) res: Response){
        const trainerId = req.user.sub
        await this.authService.logout(trainerId)
        res.clearCookie('refresh_token')
        return { message: 'Logged out successfully' }
    }

    @ApiOperation({ summary: 'Verify current password before changing password' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Password verified. Sets password_change_token cookie.' })
    @ApiResponse({ status: 401, description: 'Password does not match' })
    @Throttle({ short: { ttl: 1000, limit: 1 }, medium: { ttl: 60000, limit: 5 } })
    @UseGuards(AuthGuard)
    @Post('/verify-password')
    async verifyPassword(@Body(ValidationPipe) verifyPasswordDto: VerifyPasswordDto, @Request() req, @Res({ passthrough: true }) res: Response){
        const passwordChangeToken = await this.authService.verifyPassword(req.user.sub, verifyPasswordDto.currentPassword)

        res.cookie('password_change_token', passwordChangeToken, {
            httpOnly: true, // prevent XSS
            secure: true, // transfer only in HTTPS
            sameSite: 'strict', // prevent CSRF
            maxAge: 5 * 60 * 1000, // 5 mins
            path: '/api/auth/password-change'
        })

        return
    }

    @ApiOperation({ summary: 'Change password using password_change_token cookie' })
    @ApiBearerAuth()
    @ApiCookieAuth('password_change_token')
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({ status: 400, description: 'Passwords do not match / Weak password' })
    @ApiResponse({ status: 401, description: 'Invalid or expired password change token' })
    @UseGuards(AuthGuard)
    @Patch('/change-password')
    async changePassword(@Body(ValidationPipe) changePasswordDto:ChangePasswordDto, @Request() req, @Res({ passthrough: true }) res: Response){
        const token = req.cookies['password_change_token']

        await this.authService.changePassword(req.user.sub, token, changePasswordDto)

        res.clearCookie('password_change_token')

        return { message: 'Password is changed successfully' }
    }

}


