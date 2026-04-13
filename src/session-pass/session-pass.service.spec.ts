import { Test, TestingModule } from '@nestjs/testing';
import { SessionPassService } from './session-pass.service';

describe('SessionPassService', () => {
  let service: SessionPassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionPassService],
    }).compile();

    service = module.get<SessionPassService>(SessionPassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
