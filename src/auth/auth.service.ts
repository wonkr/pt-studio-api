import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { loginTrainerDto } from './dto/login-trainer.dto';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt'
import { ChangePasswordDto } from './dto/change-password.dto';


@Injectable()
export class AuthService {
    constructor(
        private JwtService: JwtService,
        private readonly databaseService: DatabaseService
    ){}

    async signIn(loginTrainerDto: loginTrainerDto): Promise<{ accessToken: string, refreshToken: string }> {
        const trainer = await this.databaseService.trainer.findUnique({
            where: {email: loginTrainerDto.email},
            select: {
                id: true,
                email: true,
                passwordHash: true
            }
        })

        if (!trainer){
            throw new NotFoundException('trainer not found.')
        }
        const isMatch = await bcrypt.compare(loginTrainerDto.password, trainer.passwordHash)
    
        if (!isMatch){
            throw new UnauthorizedException('password does not match.')
        } 

        const accessToken = await this.createAccessToken(trainer.id, trainer.email)
        const refreshToken = await this.createRefreshToken(trainer.id, trainer.email)

        await this.databaseService.refreshToken.deleteMany({
            where: { trainerId: trainer.id },
        });

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    async refreshToken(refreshToken: string): Promise<{ newAccessToken: string, newRefreshToken: string }> {
        const dbToken = await this.databaseService.refreshToken.findUnique({
            where: {token: refreshToken},
            include: {
                trainer: {
                    select: { email: true }
                }
            }
        })
        if (!dbToken){
            throw new NotFoundException('refresh token is not valid')
        }
        const payload = await this.JwtService.verifyAsync(refreshToken)
        if (payload.type !== 'refresh'){
            throw new NotFoundException('refresh token is not valid')
        } 
        
        if (payload.sub !== dbToken.trainerId) {
            throw new NotFoundException('refresh token is not valid')
        } 

        const newAccessToken = await this.createAccessToken(dbToken.trainerId, dbToken.trainer.email)
        const newRefreshToken = await this.createRefreshToken(dbToken.trainerId, dbToken.trainer.email)
        
        await this.databaseService.refreshToken.delete({
            where: {token: refreshToken}
        })

        return {
            newAccessToken: newAccessToken,
            newRefreshToken: newRefreshToken
        }
    }

    async logout(refreshToken: string) {
        await this.databaseService.refreshToken.delete({
            where: {token: refreshToken}
        })
    }

    async verifyPassword(trainerId: string, currentPassword: string):  Promise<string> {
        const trainer = await this.databaseService.trainer.findUnique({
            where: {id: trainerId},
            select: {
                passwordHash: true
            }
        })

        if (!trainer){
            throw new NotFoundException('trainer not found.')
        }
        const isMatch = await bcrypt.compare(currentPassword, trainer.passwordHash)
        
        if (!isMatch){
            throw new UnauthorizedException('password does not match.')   
        }

        const passwordChangeToken = await this.JwtService.signAsync(
            { sub: trainerId, type: 'password-change' },
            { expiresIn: '5m' }
        )
        
        return passwordChangeToken
    }

    async changePassword(userId: string, passwordChangeToken: string, changePasswordDto:ChangePasswordDto) {
        const payload = await this.JwtService.verifyAsync(passwordChangeToken)
        if (payload.type !== 'password-change'){
            throw new NotFoundException('passwordChangeToken is not valid')
        } 
        
        if (payload.sub !== userId) {
            throw new NotFoundException('passwordChangeToken is not valid')
        } 

        if (changePasswordDto.password !== changePasswordDto.confirmPassword){
            throw new BadRequestException('Passwords do not match.')
        }
        
        const saltOrRounds = 10;
        const newHashedPassword = await bcrypt.hash(changePasswordDto.password, saltOrRounds)

        await this.databaseService.trainer.update({
            where: {
                id: userId
            },
            data: {
                passwordHash: newHashedPassword
            }
        })
        
        return
    }

    async createAccessToken(trainerId:string, trainerEmail:string): Promise<string> {
        const accessPayload = { sub: trainerId, email: trainerEmail, type: "access" };

        return this.JwtService.signAsync(
                accessPayload, { expiresIn: '15m' })
    }

    async createRefreshToken(trainerId:string, trainerEmail:string): Promise<string> {
        const refreshPayload = { sub: trainerId, email: trainerEmail, type: "refresh" };

        const refreshToken = await this.JwtService.signAsync(
                refreshPayload, { expiresIn: '7d' })
        
        const decoded = this.JwtService.decode(refreshToken)

        await this.databaseService.refreshToken.create({
            data: {
                token: refreshToken, 
                trainerId: trainerId,
                createdAt: new Date(decoded.iat * 1000),
                expiresAt: new Date(decoded.exp * 1000)
            }
        })

        return refreshToken
    }
}
