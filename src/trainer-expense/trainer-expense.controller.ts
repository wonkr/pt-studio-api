import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { TrainerExpenseService } from './trainer-expense.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTrainerExpenseDto } from './dto/create-trainer-expense.dto';
import { UpdateTrainerExpenseDto } from './dto/update-trainer-expense.dto';

@Controller('trainer-expense')
export class TrainerExpenseController {
    constructor(
        private readonly trainerExpenseService: TrainerExpenseService
    ){}

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createTrainerExpenseDto: CreateTrainerExpenseDto){
        return this.trainerExpenseService.create(req.user.sub, createTrainerExpenseDto)
    }

    @UseGuards(AuthGuard)
    @Get()
    async findAll(@Request() req, @Query('category') category?: 'RENT' | 'UTILITY' | 'SUPPLY' | 'OTHER', @Query('start-date') startDate?: string, @Query('end-date') endDate?: string){
        return this.trainerExpenseService.findAll(req.user.sub, category, startDate, endDate)
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string){
        return this.trainerExpenseService.findOne(req.user.sub, id)
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) UpdateTrainerExpenseDto: UpdateTrainerExpenseDto){
        return this.trainerExpenseService.update(req.user.sub, id, UpdateTrainerExpenseDto)
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.trainerExpenseService.remove(req.user.sub, id)
    }
}