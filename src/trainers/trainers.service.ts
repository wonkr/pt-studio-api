import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateTrainerDto } from '../auth/dto/create-trainer.dto';
import * as bcrypt from 'bcrypt'


@Injectable()
export class TrainersService {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(createTrainerDto: CreateTrainerDto) {
        const trainer = await this.databaseService.trainer.findUnique({
            where: {email: createTrainerDto.email}
        })
        if (trainer) {
            throw new BadRequestException('Email already exists')
        }

        if (createTrainerDto.password !== createTrainerDto.confirmPassword){
            throw new BadRequestException('Passwords do not match.')
        }
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(createTrainerDto.password, saltOrRounds)

        const registerTrainerDto: Prisma.TrainerCreateInput = {
            name: createTrainerDto.name,
            email: createTrainerDto.email,
            phoneNumber: createTrainerDto.phone,
            passwordHash: hash
        }
        await this.databaseService.trainer.create({
            data: registerTrainerDto
        })

        return { message: 'Registration successful.' }
    } 
}
