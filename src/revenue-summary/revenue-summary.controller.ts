import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { RevenueSummaryService } from './revenue-summary.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RevenueSummaryQueryDto } from './dto/revenue-summary-query.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrgGuard } from '../auth/guards/org.guard';
import { RequiredOrgId, TrainerId } from '../auth/decorators/auth.decorator';
import { OrgAdminGuard } from '../auth/guards/org-admin.guard';

@ApiTags('Revenue Summary')
@ApiBearerAuth()
@UseGuards(AuthGuard, OrgGuard)
@Controller('/organizations/:orgId/revenue-summary')
export class RevenueSummaryController {
    constructor(
        private readonly revenueSummaryService: RevenueSummaryService
    ) {}

    @ApiOperation({ summary: 'Get monthly or yearly financial summary' })
    @ApiQuery({ name: 'year', required: true, type: Number, description: 'Year to query (e.g. 2026)' })
    @ApiQuery({ name: 'month', required: false, type: Number, description: 'Month to query (1-12). If omitted, returns full year summary.' })
    @ApiResponse({ status: 200, description: 'Financial summary including totalSales, earnedRevenue, unearnedRevenue, totalExpenses, netProfit' })
    @ApiResponse({ status: 400, description: 'year is required' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseGuards(OrgAdminGuard)
    @Get('/admin')
    async getRevenueSummary(@RequiredOrgId() orgId: string, @Query(ValidationPipe) query: RevenueSummaryQueryDto){
        return this.revenueSummaryService.getRevenueSummary(orgId, query.year, query.month)
    }
}