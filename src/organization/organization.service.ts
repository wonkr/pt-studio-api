import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationService {
    constructor(
        private readonly databaseService: DatabaseService
    ){}

    async create(trainerId: string, createOrganizationDto: CreateOrganizationDto){
        const org = await this.databaseService.organization.create({
            data: {
                    name: createOrganizationDto.name,
                    address: createOrganizationDto.address,
                    roomCount: createOrganizationDto.roomCount,
                    rooms: {
                        create: createOrganizationDto.rooms.map(room => ({
                            name: room.name,
                            capacity: room.capacity
                        }))
                    },
                    trainers: {
                        create: {
                            trainerId: trainerId,
                            role: 'OWNER',
                            status: 'APPROVED'
                        }
                    }
                }
            })
        
        return {
            name: org.name,
            address: org.address,
            roomCount: org.roomCount
        }
    }

    async search(name: string){
        const orgs = await this.databaseService.organization.findMany({
            where:{
                name: name
            },
            select: {
                id: true, 
                name: true, 
                address: true
            }
        })

        return orgs
    }
}
