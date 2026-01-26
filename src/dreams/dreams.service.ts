// src/dreams/dreams.service.ts
import { Injectable } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { CreateDreamDto } from './dto/create-dream.dto';

@Injectable()
export class DreamsService {
  constructor(private readonly aiService: AiService) { }

  async analyzeDream(createDreamDto: CreateDreamDto) {
    return this.aiService.analyzeDream(createDreamDto);
  }
}
