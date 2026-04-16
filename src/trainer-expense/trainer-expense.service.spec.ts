import { Test, TestingModule } from '@nestjs/testing';
import { TrainerExpenseService } from './trainer-expense.service';

describe('TrainerExpenseService', () => {
  let service: TrainerExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainerExpenseService],
    }).compile();

    service = module.get<TrainerExpenseService>(TrainerExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
