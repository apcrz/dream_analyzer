import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DreamsModule } from './dreams/dreams.module';
import { AiService } from './ai/ai.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60,
        limit: 10
      }]
    }),
    DreamsModule
  ],
  controllers: [AppController],
  providers: [AppService, AiService],
})
export class AppModule { }
