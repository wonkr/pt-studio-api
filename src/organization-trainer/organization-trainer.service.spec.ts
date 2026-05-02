import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationTrainerService } from './organization-trainer.service';

describe('OrganizationTrainerService', () => {
  let service: OrganizationTrainerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationTrainerService],
    }).compile();

    service = module.get<OrganizationTrainerService>(OrganizationTrainerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
