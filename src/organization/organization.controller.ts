import { Body, Controller, Get, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { OrganizationService } from './organization.service';
import { TrainerId } from '../auth/decorators/auth.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationSearchQueryDto } from './dto/organization-search-query.dto';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('organization')
export class OrganizationController {
    constructor(
        private readonly organizationService: OrganizationService
    ) {}

    @ApiOperation({ summary: 'Create a new organization' })
    @ApiResponse({ status: 201, description: 'Organization created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @Post()
    async create(@TrainerId() trainerId: string, @Body(ValidationPipe) createOrganizationDto: CreateOrganizationDto){
        return this.organizationService.create(trainerId, createOrganizationDto)
    }

    @Get('/search')
    async search(@Query(ValidationPipe) query:OrganizationSearchQueryDto){
        return this.organizationService.search(query.name)
    }
}
