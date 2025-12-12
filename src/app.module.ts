import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DreamsModule } from './dreams/dreams.module';
import { AiService } from './ai/ai.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    DreamsModule
  ],
  controllers: [AppController],
  providers: [AppService, AiService],
})
export class AppModule {}
