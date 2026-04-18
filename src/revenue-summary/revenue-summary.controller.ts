import { Controller, Get, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { RevenueSummaryService } from './revenue-summary.service';
import { AuthGuard } from '../auth/auth.guard';
import { RevenueSummaryQueryDto } from './dto/revenue-summary-query.dto';

@Controller('revenue-summary')
export class RevenueSummaryController {
    constructor(
        private readonly revenueSummaryService: RevenueSummaryService
    ) {}
    
    @UseGuards(AuthGuard)
    @Get()
    async getRevenueSummary(@Request() req, @Query(ValidationPipe) query: RevenueSummaryQueryDto){
        return this.revenueSummaryService.getRevenueSummary(req.user.sub, query.year, query.month)
    }
}
