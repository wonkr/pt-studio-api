import { Test, TestingModule } from '@nestjs/testing';
import { TrainerExpenseController } from './trainer-expense.controller';

describe('TrainerExpenseController', () => {
  let controller: TrainerExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainerExpenseController],
    }).compile();

    controller = module.get<TrainerExpenseController>(TrainerExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
