import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
    constructor(){
        const adapter = new PrismaNeon({
            connectionString: process.env.DATABASE_URL!
        });
        super({
            adapter: adapter
        })
    }
    async onModuleInit() {
        await this.$connect()
    }
}