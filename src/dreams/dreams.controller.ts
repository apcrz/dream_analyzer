// src/dreams/dreams.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DreamsService } from './dreams.service';
import { CreateDreamDto } from './dto/create-dream.dto';

@Controller('dreams')
export class DreamsController {
  constructor(private readonly dreamsService: DreamsService) { }

  @Post('analyze')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60
    }
  })
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async analyze(
    @Body() createDreamDto: CreateDreamDto,
  ): Promise<any> {
    console.log(
      `Analisando sonho: ${createDreamDto.description.substring(0, 50)}...`,
    );

    return this.dreamsService.analyzeDream(createDreamDto);
  }
}
