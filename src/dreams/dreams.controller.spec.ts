// src/dreams/dreams.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DreamsController } from './dreams.controller';
import { DreamsService } from './dreams.service';

describe('DreamsController', () => {
  let controller: DreamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DreamsController],
      providers: [DreamsService],
    }).compile();

    controller = module.get<DreamsController>(DreamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
