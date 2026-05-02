import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { OrgExpenseService } from './org-expense.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateOrgExpenseDto } from './dto/create-org-expense.dto';
import { UpdateOrgExpenseDto } from './dto/update-org-expense.dto';
import { OrgExpenseSummaryQueryDto } from './dto/trainer-org-summary.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrgGuard } from '../auth/guards/org.guard';
import { OrgId, RequiredOrgId, TrainerId } from '../auth/decorators/auth.decorator';

@ApiTags('Trainer Expense')
@ApiBearerAuth()
@UseGuards(AuthGuard, OrgGuard)
@Controller('organizations/:orgId/org-expense/admin')
export class OrgExpenseController {
    constructor(
        private readonly orgExpenseService: OrgExpenseService
    ){}

    @ApiOperation({ summary: 'Create a new expense record' })
    @ApiResponse({ status: 201, description: 'Expense created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post()
    async create(@TrainerId() trainerId: string, @RequiredOrgId() orgId: string, @Body(ValidationPipe) createTrainerExpenseDto: CreateOrgExpenseDto){
        return this.orgExpenseService.create(trainerId, orgId, createTrainerExpenseDto)
    }

    @ApiOperation({ summary: 'Get all expense records. Optionally filter by category or date range.' })
    @ApiQuery({ name: 'category', required: false, enum: ['RENT', 'UTILITY', 'SUPPLY', 'OTHER'] })
    @ApiQuery({ name: 'start-date', required: false, description: 'ISO 8601 inclusive lower bound on paidAt' })
    @ApiQuery({ name: 'end-date', required: false, description: 'ISO 8601 inclusive upper bound on paidAt' })
    @ApiResponse({ status: 200, description: 'List of expense records' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get()
    async findAll(@RequiredOrgId() orgId: string, @Query('category') category?: 'RENT' | 'UTILITY' | 'SUPPLY' | 'OTHER', @Query('start-date') startDate?: string, @Query('end-date') endDate?: string){
        return this.orgExpenseService.findAll(orgId, category, startDate, endDate)
    }

    @ApiOperation({ summary: 'Get expense summary aggregated by period' })
    @ApiQuery({ name: 'year', required: true, type: Number })
    @ApiQuery({ name: 'month', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Expense summary' })
    @ApiResponse({ status: 400, description: 'year is required' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Get('/summary')
    async getExpenseSummary(@RequiredOrgId() orgId: string, @Query(ValidationPipe) query: OrgExpenseSummaryQueryDto){
        return this.orgExpenseService.getExpenseSummary(orgId, query.year, query.month)
    }

    @ApiOperation({ summary: 'Get a single expense record by ID' })
    @ApiResponse({ status: 200, description: 'Expense record details' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Trainer expense not found' })
    @Get(':id')
    async findOne(@RequiredOrgId() orgId: string, @Param('id') id: string){
        return this.orgExpenseService.findOne(orgId, id)
    }

    @ApiOperation({ summary: 'Update an expense record (partial update)' })
    @ApiResponse({ status: 200, description: 'Updated expense record' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Trainer expense not found' })
    @Patch(':id')
    async update(@RequiredOrgId() orgId: string, @Param('id') id: string, @Body(ValidationPipe) updateOrgExpenseDto: UpdateOrgExpenseDto){
        return this.orgExpenseService.update(orgId, id, updateOrgExpenseDto)
    }

    @ApiOperation({ summary: 'Delete an expense record' })
    @ApiResponse({ status: 204, description: 'Expense deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Trainer expense not found' })
    @Delete(':id')
    async remove(@RequiredOrgId() orgId: string, @Param('id') id: string){
        return this.orgExpenseService.remove(orgId, id)
    }
}
