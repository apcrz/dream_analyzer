// src/dreams/dreams.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DreamsService } from './dreams.service';

describe('DreamsService', () => {
  let service: DreamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DreamsService],
    }).compile();

    service = module.get<DreamsService>(DreamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
