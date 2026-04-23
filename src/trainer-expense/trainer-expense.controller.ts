import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { TrainerExpenseService } from './trainer-expense.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTrainerExpenseDto } from './dto/create-trainer-expense.dto';
import { UpdateTrainerExpenseDto } from './dto/update-trainer-expense.dto';
import { TrainerExpenseSummaryQueryDto } from './dto/trainer-expense-summary.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Trainer Expense')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('trainer-expense')
export class TrainerExpenseController {
    constructor(
        private readonly trainerExpenseService: TrainerExpenseService
    ){}

    @ApiOperation({ summary: 'Create a new expense record' })
    @ApiResponse({ status: 201, description: 'Expense created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post()
    async create(@Request() req, @Body(ValidationPipe) createTrainerExpenseDto: CreateTrainerExpenseDto){
        return this.trainerExpenseService.create(req.user.sub, createTrainerExpenseDto)
    }

    @ApiOperation({ summary: 'Get all expense records. Optionally filter by category or date range.' })
    @ApiQuery({ name: 'category', required: false, enum: ['RENT', 'UTILITY', 'SUPPLY', 'OTHER'] })
    @ApiQuery({ name: 'start-date', required: false, description: 'ISO 8601 inclusive lower bound on paidAt' })
    @ApiQuery({ name: 'end-date', required: false, description: 'ISO 8601 inclusive upper bound on paidAt' })
    @ApiResponse({ status: 200, description: 'List of expense records' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    async findAll(@Request() req, @Query('category') category?: 'RENT' | 'UTILITY' | 'SUPPLY' | 'OTHER', @Query('start-date') startDate?: string, @Query('end-date') endDate?: string){
        return this.trainerExpenseService.findAll(req.user.sub, category, startDate, endDate)
    }

    @ApiOperation({ summary: 'Get expense summary aggregated by period' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiQuery({ name: 'month', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Expense summary' })
    @ApiResponse({ status: 400, description: 'year is required' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get('/summary')
    async getExpenseSummary(@Request() req, @Query(ValidationPipe) query: TrainerExpenseSummaryQueryDto){
        return this.trainerExpenseService.getExpenseSummary(req.user.sub, query.year, query.month)
    }

    @ApiOperation({ summary: 'Get a single expense record by ID' })
    @ApiResponse({ status: 200, description: 'Expense record details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Trainer expense not found' })
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string){
        return this.trainerExpenseService.findOne(req.user.sub, id)
    }

    @ApiOperation({ summary: 'Update an expense record (partial update)' })
    @ApiResponse({ status: 200, description: 'Updated expense record' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Trainer expense not found' })
    @Patch(':id')
    async update(@Request() req, @Param('id') id: string, @Body(ValidationPipe) UpdateTrainerExpenseDto: UpdateTrainerExpenseDto){
        return this.trainerExpenseService.update(req.user.sub, id, UpdateTrainerExpenseDto)
    }

    @ApiOperation({ summary: 'Delete an expense record' })
    @ApiResponse({ status: 204, description: 'Expense deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Trainer expense not found' })
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string){
        return this.trainerExpenseService.remove(req.user.sub, id)
    }
}