import { Test, TestingModule } from '@nestjs/testing';
import { RevenueSummaryService } from './revenue-summary.service';

describe('RevenueSummaryService', () => {
  let service: RevenueSummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevenueSummaryService],
    }).compile();

    service = module.get<RevenueSummaryService>(RevenueSummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
