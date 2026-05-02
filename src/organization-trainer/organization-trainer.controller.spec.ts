import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationTrainerController } from './organization-trainer.controller';

describe('OrganizationTrainerController', () => {
  let controller: OrganizationTrainerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationTrainerController],
    }).compile();

    controller = module.get<OrganizationTrainerController>(OrganizationTrainerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
