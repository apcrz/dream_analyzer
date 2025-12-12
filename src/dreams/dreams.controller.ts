// src/dreams/dreams.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { CreateDreamDto } from './dto/create-dream.dto';

@Controller('dreams')
export class DreamsController {

  constructor(private readonly aiService: AiService) { }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  async analyze(
    @Body() createDreamDto: CreateDreamDto,
  ): Promise<any> {

    console.log(`Analisando sonho: ${createDreamDto.description.substring(0, 50)}...`);

    const analysisResult = await this.aiService.analyzeDream(createDreamDto);

    return analysisResult;
  }

}