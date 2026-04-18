import { Test, TestingModule } from '@nestjs/testing';
import { RevenueSummaryController } from './revenue-summary.controller';

describe('RevenueSummaryController', () => {
  let controller: RevenueSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevenueSummaryController],
    }).compile();

    controller = module.get<RevenueSummaryController>(RevenueSummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
