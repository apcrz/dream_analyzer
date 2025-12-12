import { Module } from '@nestjs/common';
import { DreamsService } from './dreams.service';
import { DreamsController } from './dreams.controller';
import {
  AiModule
  
 } from 'src/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [DreamsController],
  providers: [DreamsService],
})
export class DreamsModule {}
