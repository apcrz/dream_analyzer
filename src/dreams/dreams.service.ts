import { Injectable } from '@nestjs/common';
import { CreateDreamDto } from './dto/create-dream.dto';
import { UpdateDreamDto } from './dto/update-dream.dto';

@Injectable()
export class DreamsService {
  create(createDreamDto: CreateDreamDto) {
    return 'This action adds a new dream';
  }

  findAll() {
    return `This action returns all dreams`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dream`;
  }

  update(id: number, updateDreamDto: UpdateDreamDto) {
    return `This action updates a #${id} dream`;
  }

  remove(id: number) {
    return `This action removes a #${id} dream`;
  }
}
