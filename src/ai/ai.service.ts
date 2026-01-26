// src/ai/ai.service.ts

import { Injectable, InternalServerErrorException, Logger, BadGatewayException } from '@nestjs/common';
import { Mistral } from '@mistralai/mistralai';
import { ConfigService } from '@nestjs/config';
import { CreateDreamDto } from '../dreams/dto/create-dream.dto';
import { DreamAnalysisSchema, DreamAnalysis } from './schemas/dream-analysis.schema';
import { ZodError } from 'zod';

@Injectable()
export class AiService {
   private readonly logger = new Logger(AiService.name);
   private readonly mistralClient: Mistral;
   private readonly MODEL = 'mistral-large-latest';

   private readonly SYSTEM_PROMPT = `
      Você é um Analista de Sonhos e Numerólogo experiente.
      Sua tarefa é receber a descrição de um sonho, fornecer uma interpretação profunda e, em seguida, gerar sugestões de números para loterias populares no Brasil (Mega-Sena, LotoFácil) e para o Jogo do Bicho, baseado em simbologia e associações numerológicas.

      **Você é um sistema que responde APENAS JSON VÁLIDO**.

      REGRAS OBRIGATÓRIAS:
      - NÃO escreva texto fora do JSON;
      - NÃO use markdown;
      - NÃO use aspas não escapadas;
      - NÃO adicione comentários;
      - NÃO quebre linhas dentro de strings;
      - USE apenas aspas duplas válidas

      {
         "interpretation": "string",
         "summary_keywords": ["string"],
         "suggested_numbers": [
            {
               "game": "Mega-Sena",
               "numbers": [number, number, number, number, number, number],
               "rationale": "string"
            },
            {
               "game": "LotoFácil",
               "numbers": [number x15],
               "rationale": "string"
            },
            {
               "game": "Jogo do Bicho",
               "animal": "string",
               "milhar": [number x4],
               "centena": [number x4],
               "dezena": [number x4]
            }
         ]
      }

      Se não conseguir cumprir, responda:
      {
         "error": "INVALID_OUTPUT"
      }
  `;

   constructor(private configService: ConfigService) {
      const apiKey = this.configService.get<string>('MISTRAL_API_KEY');
      if (!apiKey) {
         this.logger.error('MISTRAL_API_KEY não configurada');
         throw new InternalServerErrorException('MISTRAL_API_KEY não está configurada nas variáveis de ambiente.');
      }
      this.mistralClient = new Mistral({ apiKey });
   }

   private sanitizeNumbers(parsed: DreamAnalysis): DreamAnalysis {
      return {
         ...parsed,
         suggested_numbers: parsed.suggested_numbers.map(item => {
            if (item.game === 'Mega-Sena' || item.game === 'LotoFácil') {
               const lottoItem = item as { game: 'Mega-Sena' | 'LotoFácil'; numbers: number[]; rationale: string };
               const max = lottoItem.game === 'Mega-Sena' ? 60 : 25;
               return {
                  ...lottoItem,
                  numbers: lottoItem.numbers.map(n => (n > max ? max : n)),
               };
            }

            if (item.game === 'Jogo do Bicho') {
               const bichoItem = item as {
                  game: 'Jogo do Bicho';
                  animal: string;
                  milhar: number[];
                  centena: number[];
                  dezena: number[];
               };
               const max = 9999;
               return {
                  ...bichoItem,
                  milhar: bichoItem.milhar.map(n => (n > max ? max : n)),
                  centena: bichoItem.centena.map(n => (n > max ? max : n)),
                  dezena: bichoItem.dezena.map(n => (n > max ? max : n)),
               };
            }

            return item;
         }),
      };
   }
   private extractJson(raw: string): string {
      let text = raw.trim();

      text = text.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();

      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first === -1 || last === -1) {
         this.logger.error('Nenhum JSON encontrado', raw);
         throw new BadGatewayException('IA retornou resposta inesperada');
      }

      return text.slice(first, last + 1);
   }

   private parseAndValidate(raw: string): DreamAnalysis {
      const jsonString = this.extractJson(raw);

      let parsed: unknown;
      try {
         parsed = JSON.parse(jsonString);
      } catch (err) {
         this.logger.error('JSON inválido da IA', jsonString);
         throw new BadGatewayException('Resposta da IA não é JSON válido');
      }

      const sanitized = this.sanitizeNumbers(parsed as DreamAnalysis);

      try {
         return DreamAnalysisSchema.parse(sanitized);
      } catch (err) {
         if (err instanceof ZodError) {
            this.logger.error('Resposta da IA não corresponde ao schema', JSON.stringify(err));
         }
         throw new BadGatewayException('Resposta da IA não respeita o schema');
      }
   }

   async analyzeDream(createDreamDto: CreateDreamDto): Promise<DreamAnalysis> {
      let chatResponse;
      try {
         chatResponse = await this.mistralClient.chat.complete({
            model: this.MODEL,
            messages: [
               { role: 'system', content: this.SYSTEM_PROMPT },
               { role: 'user', content: createDreamDto.description },
            ],
         });
      } catch (err) {
         this.logger.error('Erro na comunicação com Mistral', err);
         throw new BadGatewayException('Falha ao se comunicar com IA');
      }

      const raw = chatResponse.choices?.[0]?.message?.content;
      if (!raw) {
         this.logger.error('Resposta vazia da IA');
         throw new BadGatewayException('IA retornou resposta vazia');
      }

      return this.parseAndValidate(raw);
   }

}
