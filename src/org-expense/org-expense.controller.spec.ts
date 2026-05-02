import { Test, TestingModule } from '@nestjs/testing';
import { OrgExpenseController } from './org-expense.controller';

describe('OrgExpenseController', () => {
  let controller: OrgExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrgExpenseController],
    }).compile();

    controller = module.get<OrgExpenseController>(OrgExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
