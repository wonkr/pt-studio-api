import { Test, TestingModule } from '@nestjs/testing';
import { SessionPassController } from './session-pass.controller';

describe('SessionPassController', () => {
  let controller: SessionPassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionPassController],
    }).compile();

    controller = module.get<SessionPassController>(SessionPassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
