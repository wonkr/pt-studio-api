import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { LoginTrainerDto } from './dto/login-trainer.dto';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt'
import { ChangePasswordDto } from './dto/change-password.dto';
import { SwitchOrgDto } from './dto/switch-org.dto';
import { LoginStatus } from './enum/login-status.enum';


@Injectable()
export class AuthService {
    constructor(
        private JwtService: JwtService,
        private readonly databaseService: DatabaseService
    ){}

    async signIn(loginTrainerDto: LoginTrainerDto): Promise<{ status: LoginStatus, accessToken: string, refreshToken: string }> {
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

        const orgTrainer = await this.databaseService.organizationTrainer.findMany({
            where: {
                trainerId: trainer.id
            }
        })

        const orgId = (orgTrainer.length === 1 && orgTrainer[0].status === "APPROVED") ? orgTrainer[0].organizationId: undefined
     
        const status = 
            orgTrainer.length === 0? LoginStatus.NoOrgMembership
            :( orgTrainer.length === 1 && orgTrainer[0].status === "APPROVED" )? LoginStatus.Ready
            : LoginStatus.OrgSelectionRequired
    
        const [accessToken, refreshToken] = await Promise.all([
        this.createAccessToken(trainer.id, trainer.email, orgId),
        this.createRefreshToken(trainer.id, trainer.email, orgId),
        ])

        return {
            status: status,
            accessToken: accessToken,
            refreshToken: refreshToken
        }

    }

    async switchOrg(trainerId: string, refreshToken: string, switchOrgDto: SwitchOrgDto): Promise<{ status: LoginStatus, newAccessToken: string, newRefreshToken: string }> {
        const dbToken = await this.databaseService.refreshToken.findUnique({
            where: {
                token: refreshToken,
                trainerId: trainerId
            },
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

        const orgTrainer = await this.databaseService.organizationTrainer.findUnique({
            where: {
                id: switchOrgDto.orgTrainerId
            }
        })

        if (!orgTrainer || orgTrainer.trainerId !== trainerId || orgTrainer.status !== "APPROVED"){
            throw new UnauthorizedException('trainer has no permission to access to the organization')
        }

        const newAccessToken = await this.createAccessToken(dbToken.trainerId, dbToken.trainer.email, orgTrainer.organizationId)
        const newRefreshToken = await this.createRefreshToken(dbToken.trainerId, dbToken.trainer.email, orgTrainer.organizationId)

        return {
            status: LoginStatus.Ready,
            newAccessToken: newAccessToken,
            newRefreshToken: newRefreshToken
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

        const newAccessToken = await this.createAccessToken(dbToken.trainerId, dbToken.trainer.email, payload.organizationId)
        const newRefreshToken = await this.createRefreshToken(dbToken.trainerId, dbToken.trainer.email, payload.organizationId)

        return {
            newAccessToken: newAccessToken,
            newRefreshToken: newRefreshToken
        }
    }

    async logout(trainerId: string) {
        await this.databaseService.refreshToken.deleteMany({
            where: {trainerId: trainerId}
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

        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword){
            throw new BadRequestException('Passwords do not match.')
        }
        
        const saltOrRounds = 10;
        const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, saltOrRounds)

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

    async createAccessToken(trainerId:string, trainerEmail:string, organizationId?: string): Promise<string> {
        const accessPayload:any = { sub: trainerId, email: trainerEmail, type: "access" };

        if (organizationId){
            accessPayload.organizationId = organizationId
        }
        return this.JwtService.signAsync(
                accessPayload, { expiresIn: '15m' })
    }

    async createRefreshToken(trainerId:string, trainerEmail:string, organizationId?: string
    ): Promise<string> {
        const refreshPayload:any = { sub: trainerId, email: trainerEmail, type: "refresh" };

        if (organizationId){
            refreshPayload.organizationId = organizationId
        }

        const refreshToken = await this.JwtService.signAsync(
                refreshPayload, { expiresIn: '7d' })
        
        const decoded = this.JwtService.decode(refreshToken)

        await this.databaseService.refreshToken.deleteMany({
            where: { trainerId: trainerId },
        });

        await this.databaseService.refreshToken.create({
            data: {
                token: refreshToken, 
                trainerId: trainerId,
                orgId: organizationId,
                createdAt: new Date(decoded.iat * 1000),
                expiresAt: new Date(decoded.exp * 1000)
            }
        })

        return refreshToken
    }
}
