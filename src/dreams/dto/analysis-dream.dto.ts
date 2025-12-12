// src/dreams/dto/analysis-dream.dto.ts

export class BichoNumbers {
   milhar: number[];
   centena: number[];
   dezena: number[];
   animal: string;
}

export class SuggestedNumbersDto {
   game: 'Mega-Sena' | 'LotoFácil' | 'Jogo do Bicho';
   numbers?: number[];
   bicho_details?: BichoNumbers;
   tip: string;
}