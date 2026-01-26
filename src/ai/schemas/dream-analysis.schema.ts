import { z } from "zod";

const MegaSenaSchema = z.object({
   game: z.literal('Mega-Sena'),
   numbers: z.array(z.number().int().min(1).max(60)).length(6),
   rationale: z.string()
});

const LotoFacilSchema = z.object({
   game: z.literal('LotoFácil'),
   numbers: z.array(z.number().int().min(1).max(25)).length(15),
   rationale: z.string()
});

const JogoDoBichoSchema = z.object({
   game: z.literal('Jogo do Bicho'),
   animal: z.string(),
   milhar: z.array(z.number().int().min(0).max(9999)).length(4),
   centena: z.array(z.number().int().min(0).max(999)).length(4),
   dezena: z.array(z.number().int().min(0).max(99)).length(4),
});

export const DreamAnalysisSchema = z.object(
   {
      interpretation: z.string().min(10),
      summary_keywords: z.array(z.string()).min(3),
      suggested_numbers: z.array(
         z.union([
            MegaSenaSchema,
            LotoFacilSchema,
            JogoDoBichoSchema
         ])
      ),
   }
);

export type DreamAnalysis = z.infer<typeof DreamAnalysisSchema>