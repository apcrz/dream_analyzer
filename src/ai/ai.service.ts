// src/ai/ai.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Mistral } from '@mistralai/mistralai';
import { ConfigService } from '@nestjs/config';
import { CreateDreamDto } from '../dreams/dto/create-dream.dto';

@Injectable()
export class AiService {
   private mistralClient;
   private readonly MODEL = 'mistral-large-latest';

   private readonly SYSTEM_PROMPT = `
    Você é um Analista de Sonhos e Numerólogo experiente.
    Sua tarefa é receber a descrição de um sonho, fornecer uma interpretação profunda e, em seguida, gerar sugestões de números para loterias populares no Brasil (Mega-Sena, LotoFácil) e para o Jogo do Bicho, baseado em simbologia e associações numerológicas.

    **Sua resposta DEVE ser um único objeto JSON válido**.

    O JSON deve conter:
      - interpretation (string)
      - summary_keywords (array de strings)
      - suggested_numbers (array de objetos)

    Regras de Geração de Números:
      - Mega-Sena: 6 números (1 a 60)
      - LotoFácil: 15 números (1 a 25)
      - Jogo do Bicho:
          animal
          milhar: array de 4 numeros
          centena: array de 4 numeros
          dezena: array de 4 numeros
  `;

   constructor(private configService: ConfigService) {
      const apiKey = this.configService.get<string>('MISTRAL_API_KEY');
      if (!apiKey) {
         throw new InternalServerErrorException('MISTRAL_API_KEY não está configurada nas variáveis de ambiente.');
      }

      this.mistralClient = new Mistral({ apiKey });
   }

   private normalizeResponse(aiOutput: string): any {
      if (!aiOutput || typeof aiOutput !== 'string') {
         throw new Error("Resposta vazia ou inválida da IA");
      }

      let cleaned = aiOutput.replace(/```json|```/g, '').trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         cleaned = jsonMatch[0];
      }
      
      let parsed;
      try {
         parsed = JSON.parse(cleaned);
      } catch (e) {
         throw new Error("A IA retornou JSON inválido");
      }

      const normalizeNumbers = (value: any): any => {
         if (Array.isArray(value)) {
            return value.map(normalizeNumbers);
         }

         if (value && typeof value === "object") {
            const normalizedObj: any = {};
            for (const key of Object.keys(value)) {
               normalizedObj[key] = normalizeNumbers(value[key]);
            }
            return normalizedObj;
         }

         if (typeof value === "string" && /^\d+$/.test(value)) {
            return Number(value);
         }

         return value;
      };

      return normalizeNumbers(parsed);
   }

   async analyzeDream(createDreamDto: CreateDreamDto): Promise<any> {
      const dreamDescription = createDreamDto.description;

      try {
         const chatResponse = await this.mistralClient.chat.complete({
            model: this.MODEL,
            messages: [
               { role: 'system', content: this.SYSTEM_PROMPT },
               { role: 'user', content: `O sonho a ser analisado é: "${dreamDescription}"` },
            ],
         });

         const rawContent = chatResponse.choices?.[0]?.message?.content;

         if (!rawContent) throw new Error('Resposta inválida da Mistral');

         if () {

         }
         
         return this.normalizeResponseHard(rawContent);

      } catch (error) {
         throw new InternalServerErrorException(
            'Falha na comunicação com o serviço de Inteligência Artificial.'
         );
      }
   }

   private normalizeResponseHard(aiOutput: string): any {
      if (!aiOutput || typeof aiOutput !== "string") {
         throw new Error("Resposta vazia da IA");
      }

      let cleaned = aiOutput
         .replace(/```json/gi, "")
         .replace(/```/g, "")
         .trim();

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];

      cleaned = cleaned.replace(/"([^"]*)":\s*"([\s\S]*?)"/g, (m, key, value) => {
         const singleLine = value.replace(/\s+/g, " ").trim();
         return `"${key}": "${singleLine}"`;
      });

      let parsed;
      try {
         parsed = JSON.parse(cleaned);
      } catch (e) {
         console.error("JSON brabo da IA:", cleaned);
         throw new Error("A IA retornou JSON inválido");
      }

      const normalizeNumbers = (v: any): any => {
         if (Array.isArray(v)) return v.map(normalizeNumbers);

         if (v && typeof v === "object") {
            const obj: any = {};
            for (const k of Object.keys(v)) {
               obj[k] = normalizeNumbers(v[k]);
            }
            return obj;
         }

         if (typeof v === "string" && /^\d+$/.test(v)) {
            return Number(v);
         }

         return v;
      };

      parsed = normalizeNumbers(parsed);

      parsed.suggested_numbers = parsed.suggested_numbers?.map((item: any) => {
         if (item.game === "Jogo do Bicho" && !item.bicho_details) {
            const { animal, milhar, centena, dezena, rationale } = item;

            item.bicho_details = { animal, milhar, centena, dezena };

            delete item.animal;
            delete item.milhar;
            delete item.centena;
            delete item.dezena;

            item.tip = rationale || item.tip || "";
            delete item.rationale;
         }
         return item;
      });

      return parsed;
   }
}
