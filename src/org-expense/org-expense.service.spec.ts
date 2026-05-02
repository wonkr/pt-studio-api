import { Test, TestingModule } from '@nestjs/testing';
import { OrgExpenseService } from './org-expense.service';

describe('OrgExpenseService', () => {
  let service: OrgExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrgExpenseService],
    }).compile();

    service = module.get<OrgExpenseService>(OrgExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
