// src/dreams/dto/update-dream.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateDreamDto } from './create-dream.dto';

export class UpdateDreamDto extends PartialType(CreateDreamDto) {}
