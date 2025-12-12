// src/dreams/dto/create-dream.dto.ts

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDreamDto {
   @IsString()
   @IsNotEmpty()
   @MinLength(10)
   description: string
}
