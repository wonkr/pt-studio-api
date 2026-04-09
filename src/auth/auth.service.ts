import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { loginTrainerDto } from './dto/login-trainer.dto';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {
    constructor(
        private JwtService: JwtService,
        private readonly databaseService: DatabaseService
    ){}

    async signIn(loginTrainerDto: loginTrainerDto): Promise<{ access_token: string, refresh_token: string }> {
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
        if (isMatch){
            const access_payload = { sub: trainer.id, username: trainer.email, type: "access" };
            const refresh_payload = { sub: trainer.id, username: trainer.email, type: "refresh" };

            const access_token = await this.JwtService.signAsync(
                    access_payload, { expiresIn: '15m' })
            const refresh_token = await this.JwtService.signAsync(
                    refresh_payload, { expiresIn: '7d' })
            const decoded = this.JwtService.decode(refresh_token)
            await this.databaseService.refreshToken.create({
                data: {
                    token: refresh_token, 
                    trainerId: trainer.id,
                    createdAt: new Date(decoded.iat * 1000),
                    expiresAt: new Date(decoded.exp * 1000)
                }
            })
            return {
                access_token: access_token,
                refresh_token: refresh_token
            }
        } else {
            throw new NotFoundException('password does not match.')
        }
    }
}
